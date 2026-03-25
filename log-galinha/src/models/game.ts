import { pool } from '../lib/db';
import { Game } from '../types/game';

/**
 * Creates a new game record in the database.
 * @param gameData - The game data to create (externalId, title, cover).
 * @returns The created game object, including its database ID.
 * @throws Error if title is empty or if a game with the same externalId already exists.
 */
export async function createGame(gameData: Omit<Game, 'id'>): Promise<Game> {
    if (!gameData.title || gameData.title.trim() === '') {
        throw new Error('Game title cannot be empty.');
    }

    const query = `
        INSERT INTO games (external_id, title, cover)
        VALUES ($1, $2, $3)
        ON CONFLICT (external_id) DO UPDATE SET
            title = EXCLUDED.title,
            cover = EXCLUDED.cover
        RETURNING id, external_id AS "externalId", title, cover;
    `;
    const values = [gameData.externalId, gameData.title, gameData.cover];
    try {
        const { rows } = await pool.query<Game>(query, values);
        return rows[0];
    } catch (error) {
        if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
            throw new Error(`A game with externalId "${gameData.externalId}" already exists.`);
        }
        throw error;
    }
}

/**
 * Retrieves a game by its external ID.
 * @param externalId - The unique external identifier for the game.
 * @returns The game object if found, otherwise null.
 */
export async function getGameByExternalId(externalId: string): Promise<Game | null> {
    const query = 'SELECT id, external_id AS "externalId", title, cover FROM games WHERE external_id = $1;';
    const { rows } = await pool.query<Game>(query, [externalId]);
    return rows.length ? rows[0] : null;
}

/**
 * Updates an existing game record.
 * @param id - The internal database ID of the game to update.
 * @param updates - An object containing the fields to update (title, cover).
 * @returns The updated game object if successful, otherwise null.
 */
export async function updateGame(id: number, updates: Partial<Omit<Game, 'id' | 'externalId'>>): Promise<Game | null> {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            if (key === 'title' || key === 'cover') {
                fields.push(`${key} = $${paramIndex++}`);
                values.push((updates as any)[key]);
            }
        }
    }

    if (fields.length === 0) {
        const existingGame = await getGameById(id); // Helper to get game by internal ID
        return existingGame; // No updates provided, return current state
    }

    values.push(id); // Add id for the WHERE clause
    const query = `
        UPDATE games
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, external_id AS "externalId", title, cover;
    `;

    const { rows } = await pool.query<Game>(query, values);
    return rows.length ? rows[0] : null;
}

/**
 * Deletes a game record by its internal ID.
 * @param id - The internal database ID of the game to delete.
 * @returns True if the game was deleted, false otherwise.
 */
export async function deleteGame(id: number): Promise<boolean> {
    const query = 'DELETE FROM games WHERE id = $1 RETURNING id;';
    const { rows } = await pool.query(query, [id]);
    return rows.length > 0;
}

/**
 * Searches for games by title using an external API.
 * @param title - The title of the game to search for.
 * @returns A promise that resolves to an array of games matching the search criteria.
 *          These games will not have an internal database 'id' yet.
 */
export async function searchGamesByTitle(title: string): Promise<Omit<Game, 'id'>[]> {
    // Placeholder for actual external API integration logic
    // This function will eventually call an external service (e.g., IGDB)
    // For now, it returns an empty array or dummy data.
    console.warn(`Searching for games by title: "${title}". External API integration not yet implemented.`);
    return [];
}

/**
 * Helper function to get game by internal ID.
 * Used internally by updateGame.
 * @param id - The internal database ID of the game.
 * @returns The game object if found, otherwise null.
 */
export async function getGameById(id: number): Promise<Game | null> {
    const query = 'SELECT id, external_id AS "externalId", title, cover FROM games WHERE id = $1;';
    const { rows } = await pool.query<Game>(query, [id]);
    return rows.length ? rows[0] : null;
}
