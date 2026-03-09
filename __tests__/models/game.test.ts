import { Game } from '../../src/types/game';

// This external API mock simulates fetching game details from a third-party service.
// In a real implementation, this would likely be a dedicated service or a utility
// making actual HTTP requests.
const externalGameApiMock = {
    fetchGameDetails: jest.fn(async (externalId: string) => {
        if (externalId === 'external-game-123') {
            return {
                externalId: 'external-game-123',
                title: 'The Witcher 3: Wild Hunt',
                coverImageUrl: 'http://example.com/witcher3.jpg',
                description: 'A vast open-world RPG', // External API might return more
                releaseDate: '2015-05-19',
            };
        }
        return null;
    }),
};

// This in-memory mock simulates the database table for 'games'.
// It allows us to test the model's logic without a real database connection during TDD.
const mockGamesTable: Game[] = [];
let nextId = 1;

// This stub represents the functions that will exist in `src/models/game.ts`.
// It includes the core logic of the feature (get from API and save to DB)
// and lower-level DB interaction functions for individual testing.
const gameModelStub = {
    /**
     * Simulates the main feature function: gets game info from external API and saves to DB.
     * If the game already exists in the local DB, it returns the existing entry.
     */
    getOrCreateGameFromExternalApiAndSave: jest.fn(async (externalId: string): Promise<Game | null> => {
        // 1. Try to get from local DB first
        const existingGame = await gameModelStub.getGameByExternalId(externalId);
        if (existingGame) {
            return existingGame;
        }

        // 2. If not in DB, fetch from external API
        const apiData = await externalGameApiMock.fetchGameDetails(externalId);
        if (!apiData) {
            return null; // Game not found externally
        }

        // 3. Save only the specified basic data to local DB
        const newGameData: Omit<Game, 'id'> = {
            externalId: apiData.externalId,
            title: apiData.title,
            coverImageUrl: apiData.coverImageUrl,
        };
        const newGame = await gameModelStub.createGame(newGameData);
        return newGame;
    }),

    /**
     * Simulates creating a new game entry in the local database.
     */
    createGame: jest.fn(async (gameData: Omit<Game, 'id'>): Promise<Game> => {
        const newGame: Game = { id: nextId++, ...gameData };
        mockGamesTable.push(newGame);
        return newGame;
    }),

    /**
     * Simulates retrieving a game by its external ID from the local database.
     */
    getGameByExternalId: jest.fn(async (externalId: string): Promise<Game | null> => {
        return mockGamesTable.find(g => g.externalId === externalId) || null;
    }),
};

describe('Game Model - External API Integration and Local Save', () => {
    beforeEach(() => {
        // Reset the in-memory database and clear all mock calls before each test.
        mockGamesTable.length = 0; // Clear array
        nextId = 1;

        externalGameApiMock.fetchGameDetails.mockClear();
        gameModelStub.getOrCreateGameFromExternalApiAndSave.mockClear();
        gameModelStub.createGame.mockClear();
        gameModelStub.getGameByExternalId.mockClear();

        // Restore original mock implementations if they were temporarily overridden in specific tests.
        externalGameApiMock.fetchGameDetails.mockImplementation(jest.fn(async (externalId: string) => {
            if (externalId === 'external-game-123') {
                return {
                    externalId: 'external-game-123',
                    title: 'The Witcher 3: Wild Hunt',
                    coverImageUrl: 'http://example.com/witcher3.jpg',
                    description: 'A vast open-world RPG',
                    releaseDate: '2015-05-19',
                };
            }
            return null;
        }));
    });

    // Test case 1: Successfully fetches game details from an external API.
    it('should successfully fetch game details from the external API', async () => {
        const externalId = 'external-game-123';
        const gameDetails = await externalGameApiMock.fetchGameDetails(externalId);

        expect(externalGameApiMock.fetchGameDetails).toHaveBeenCalledWith(externalId);
        expect(gameDetails).toBeDefined();
        expect(gameDetails).toEqual(expect.objectContaining({
            externalId: externalId,
            title: 'The Witcher 3: Wild Hunt',
            coverImageUrl: 'http://example.com/witcher3.jpg',
        }));
    });

    // Test case 2: Handles cases where the external API does not find the game.
    it('should return null if game is not found in the external API', async () => {
        const externalId = 'non-existent-game';
        const gameDetails = await externalGameApiMock.fetchGameDetails(externalId);

        expect(externalGameApiMock.fetchGameDetails).toHaveBeenCalledWith(externalId);
        expect(gameDetails).toBeNull();
    });

    // Test case 3: Saves basic game data (external ID, title, cover) to the local database.
    it('should save basic game data to the local database', async () => {
        const newGameData: Omit<Game, 'id'> = {
            externalId: 'new-game-456',
            title: 'Cyberpunk 2077',
            coverImageUrl: 'http://example.com/cyberpunk.jpg',
        };

        const savedGame = await gameModelStub.createGame(newGameData);

        expect(gameModelStub.createGame).toHaveBeenCalledWith(newGameData);
        expect(savedGame).toBeDefined();
        expect(savedGame.id).toBeGreaterThan(0); // Check if a local ID was assigned
        expect(savedGame).toEqual(expect.objectContaining(newGameData));
        expect(mockGamesTable).toHaveLength(1);
        expect(mockGamesTable[0]).toEqual(savedGame);
    });

    // Test case 4: Integrated test - fetches from API and saves if not in DB.
    it('should fetch game from external API and save it to the database if it does not exist', async () => {
        const externalId = 'external-game-123';
        const expectedGameData = {
            externalId: 'external-game-123',
            title: 'The Witcher 3: Wild Hunt',
            coverImageUrl: 'http://example.com/witcher3.jpg',
        };

        // Ensure the game is not in the mock DB initially
        expect(await gameModelStub.getGameByExternalId(externalId)).toBeNull();

        const game = await gameModelStub.getOrCreateGameFromExternalApiAndSave(externalId);

        expect(externalGameApiMock.fetchGameDetails).toHaveBeenCalledWith(externalId); // API called
        expect(gameModelStub.getGameByExternalId).toHaveBeenCalledWith(externalId); // DB checked
        expect(gameModelStub.createGame).toHaveBeenCalledTimes(1); // Game saved
        expect(game).toBeDefined();
        expect(game!.id).toBe(1); // First created game
        expect(game).toEqual(expect.objectContaining(expectedGameData));
        expect(mockGamesTable).toHaveLength(1);
    });

    // Test case 5: Integrated test - returns existing game from DB without API call.
    it('should return existing game from local database without calling external API', async () => {
        const existingGame: Game = {
            id: 10,
            externalId: 'existing-game-456',
            title: 'Existing Game Title',
            coverImageUrl: 'http://example.com/existing.jpg',
        };
        mockGamesTable.push(existingGame); // Pre-populate DB

        const result = await gameModelStub.getOrCreateGameFromExternalApiAndSave(existingGame.externalId);

        expect(gameModelStub.getGameByExternalId).toHaveBeenCalledWith(existingGame.externalId); // DB checked
        expect(externalGameApiMock.fetchGameDetails).not.toHaveBeenCalled(); // API not called
        expect(gameModelStub.createGame).not.toHaveBeenCalled(); // No new game created
        expect(result).toEqual(existingGame);
        expect(mockGamesTable).toHaveLength(1); // No new game added
    });

    // Test case 6: Integrated test - handles game not found in external API when trying to save.
    it('should return null if external API returns no data for a new game to be saved', async () => {
        const externalId = 'non-existent-api-game-789';
        externalGameApiMock.fetchGameDetails.mockResolvedValueOnce(null); // Mock API to return null

        const result = await gameModelStub.getOrCreateGameFromExternalApiAndSave(externalId);

        expect(gameModelStub.getGameByExternalId).toHaveBeenCalledWith(externalId);
        expect(externalGameApiMock.fetchGameDetails).toHaveBeenCalledWith(externalId);
        expect(gameModelStub.createGame).not.toHaveBeenCalled();
        expect(result).toBeNull();
        expect(mockGamesTable).toHaveLength(0); // No game should be saved
    });

    // Test case 7: Ensures only specified basic data is saved from the external API.
    it('should save only basic game data (external ID, title, cover) to the local database, ignoring other API fields', async () => {
        const externalId = 'external-game-123';
        const externalApiFullData = {
            externalId: 'external-game-123',
            title: 'The Witcher 3: Wild Hunt',
            coverImageUrl: 'http://example.com/witcher3.jpg',
            description: 'A vast open-world RPG', // Extra data from API
            genres: ['RPG', 'Action'],
        };
        externalGameApiMock.fetchGameDetails.mockResolvedValueOnce(externalApiFullData);

        const result = await gameModelStub.getOrCreateGameFromExternalApiAndSave(externalId);

        expect(result).toBeDefined();
        // Check that only the expected properties are present and match
        expect(result).toEqual({
            id: expect.any(Number),
            externalId: externalApiFullData.externalId,
            title: externalApiFullData.title,
            coverImageUrl: externalApiFullData.coverImageUrl,
        });
        // Explicitly check that properties not in the `Game` interface are not saved
        expect(Object.keys(result!)).not.toContain('description');
        expect(Object.keys(result!)).not.toContain('genres');
        expect(Object.keys(result!)).not.toContain('releaseDate');
    });
});
