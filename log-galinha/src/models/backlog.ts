import { pool } from '../lib/db';
import { BacklogItem, BacklogStatus } from '../types/backlog';

export async function createBacklogItem(
    userId: number,
    mediaId: number, // Corresponds to game.id for now, but designed for generic media.
    status: BacklogStatus
): Promise<BacklogItem> {
    const validStatuses: BacklogStatus[] = ['WANT_TO_PLAY', 'PLAYING', 'PLAYED'];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid backlog status: ${status}`);
    }

    const query = `
        INSERT INTO user_backlogs (user_id, media_id, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, media_id) DO NOTHING
        RETURNING id, user_id AS "userId", media_id AS "mediaId", status, created_at AS "createdAt", updated_at AS "updatedAt";
    `;
    const values = [userId, mediaId, status];

    const { rows } = await pool.query<BacklogItem>(query, values);

    if (rows.length === 0) {
        throw new Error('Backlog item already exists for this user and media.');
    }

    return rows[0];
}
