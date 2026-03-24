import db from '../lib/db';

export type MediaStatus = 'Na Fila' | 'Em Andamento' | 'Finalizado';
export type MediaType = 'movie' | 'series' | 'book' | 'game';

export interface BacklogItem {
  id: number;
  user_id: number;
  media_id: number; 
  media_type: MediaType;
  status: MediaStatus;
  created_at?: Date;
  updated_at?: Date;
}

const VALID_STATUSES: MediaStatus[] = ['Na Fila', 'Em Andamento', 'Finalizado'];
const VALID_MEDIA_TYPES: MediaType[] = ['movie', 'series', 'book', 'game'];

export const BacklogModel = {
  async addItem(data: Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>): Promise<BacklogItem> {
    if (!VALID_STATUSES.includes(data.status)) {
      throw new Error('Invalid status allowed. Must be "Na Fila", "Em Andamento", or "Finalizado".');
    }
    if (!VALID_MEDIA_TYPES.includes(data.media_type)) {
      throw new Error('Invalid media_type allowed. Must be "movie", "series", "book", or "game".');
    }

    const query = `
      INSERT INTO backlog_items (user_id, media_id, media_type, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [data.user_id, data.media_id, data.media_type, data.status];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getByUserId(user_id: number): Promise<BacklogItem[]> {
    const query = `
      SELECT * FROM backlog_items 
      WHERE user_id = $1 
      ORDER BY id DESC;
    `;
    const values = [user_id];
    const result = await db.query(query, values);
    return result.rows;
  },

  async updateStatus(id: number, newStatus: MediaStatus): Promise<BacklogItem | null> {
    if (!VALID_STATUSES.includes(newStatus)) {
      throw new Error('Invalid status allowed. Must be "Na Fila", "Em Andamento", or "Finalizado".');
    }

    const query = `
      UPDATE backlog_items
      SET status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [newStatus, id];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async removeItem(id: number): Promise<boolean> {
    const query = `
      DELETE FROM backlog_items WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
};
