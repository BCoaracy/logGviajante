import { pool as db } from '../../src/lib/db';
import { createGame, getGameByExternalId, updateGame, deleteGame } from '../../src/models/game';
import { Game } from '../../src/types/game';

describe('Game Model', () => {
    beforeAll(async () => {
        // Prepare isolation tables if native sequences requested
    });

    afterEach(async () => {
        await db.query('DELETE FROM games WHERE external_id IN ($1, $2, $3, $4)', ['test-game-123', 'test-game-456', 'updated-test-game-123', 'test-game-789']);
    });

    afterAll(async () => {
        await db.end();
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

        const retrievedGame = await getGameByExternalId(createdGame.externalId);
        expect(retrievedGame).toBeNull();
    });
});
