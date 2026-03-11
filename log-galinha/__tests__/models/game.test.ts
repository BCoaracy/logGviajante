import { pool } from '../../src/lib/db';
import { createGame, getGameByExternalId } from '../../src/models/game'; // Assuming createGame and getGameByExternalId exist
import { Game } from '../../src/types/game';

describe('Game Model', () => {
    beforeAll(async () => {
        // Optional: Clear or set up test database before all tests
        // For now, we'll assume a clean state or handle cleanup in afterEach
    });

    afterEach(async () => {
        // Clean up test data after each test
        await pool.query('DELETE FROM games WHERE external_id IN ($1, $2, $3)', ['test-game-123', 'test-game-456', 'updated-test-game-123']);
    });

    afterAll(async () => {
        await pool.end();
    });

    it('should save the basic data from games (external_id, title, cover) on the database', async () => {
        const gameData: Omit<Game, 'id'> = {
            externalId: 'test-game-123',
            title: 'Test Game Title',
            cover: 'https://example.com/test-cover.jpg',
        };

        const newGame = await createGame(gameData);

        expect(newGame).toBeDefined();
        expect(newGame.id).toBeGreaterThan(0);
        expect(newGame.externalId).toBe(gameData.externalId);
        expect(newGame.title).toBe(gameData.title);
        expect(newGame.cover).toBe(gameData.cover);

        // Verify by retrieving from the database
        const retrievedGame = await getGameByExternalId(gameData.externalId);
        expect(retrievedGame).toBeDefined();
        expect(retrievedGame?.id).toBe(newGame.id);
        expect(retrievedGame?.externalId).toBe(newGame.externalId);
        expect(retrievedGame?.title).toBe(newGame.title);
        expect(retrievedGame?.cover).toBe(newGame.cover);
    });

    it('should not allow creating a game with a duplicate externalId', async () => {
        const gameData: Omit<Game, 'id'> = {
            externalId: 'test-game-123',
            title: 'Duplicate Test Game',
            cover: 'https://example.com/duplicate-cover.jpg',
        };

        await createGame(gameData); // First creation

        await expect(createGame(gameData)).rejects.toThrow(); // Second creation should throw
    });

    it('should handle invalid data gracefully (e.g., missing title)', async () => {
        const invalidGameData: Omit<Game, 'id'> = {
            externalId: 'test-game-invalid',
            title: '', // Missing title
            cover: 'https://example.com/invalid-cover.jpg',
        };
        // Assuming createGame throws an error or returns null for invalid data
        await expect(createGame(invalidGameData)).rejects.toThrow();
    });

    it('should return null when retrieving a game that does not exist', async () => {
        const nonExistentGame = await getGameByExternalId('non-existent-game-id');
        expect(nonExistentGame).toBeNull();
    });

    it('should update an existing game', async () => {
        const gameData: Omit<Game, 'id'> = {
            externalId: 'test-game-456',
            title: 'Original Title',
            cover: 'https://example.com/original-cover.jpg',
        };
        const createdGame = await createGame(gameData);

        const updates = {
            title: 'Updated Title',
            cover: 'https://example.com/updated-cover.jpg',
        };

        const updatedGame = await updateGame(createdGame.id, updates);

        expect(updatedGame).toBeDefined();
        expect(updatedGame?.id).toBe(createdGame.id);
        expect(updatedGame?.title).toBe(updates.title);
        expect(updatedGame?.cover).toBe(updates.cover);

        // Verify by retrieving from the database
        const retrievedGame = await getGameByExternalId(createdGame.externalId);
        expect(retrievedGame?.title).toBe(updates.title);
        expect(retrievedGame?.cover).toBe(updates.cover);
    });

    it('should delete an existing game', async () => {
        const gameData: Omit<Game, 'id'> = {
            externalId: 'test-game-789',
            title: 'Game to Delete',
            cover: 'https://example.com/delete-cover.jpg',
        };
        const createdGame = await createGame(gameData);

        const isDeleted = await deleteGame(createdGame.id);
        expect(isDeleted).toBe(true);

        // Verify deletion by attempting to retrieve the game
        const retrievedGame = await getGameByExternalId(createdGame.externalId);
        expect(retrievedGame).toBeNull();
    });
});
