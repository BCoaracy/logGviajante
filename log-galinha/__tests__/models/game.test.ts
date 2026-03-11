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
        await pool.query('DELETE FROM games WHERE external_id = $1', ['test-game-123']);
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

    // You might want to add tests for:
    // - duplicate externalId handling
    // - invalid data (e.g., missing title)
    // - retrieving a game that doesn't exist
    // - updating a game
    // - deleting a game
});
