import { pool as db } from '../lib/db';

export interface Series {
  id: number;
  external_id: string;
  title: string;
  cover: string;
}

export const SeriesModel = {
  async create(data: Omit<Series, 'id'>): Promise<Series> {
    const query = `
      INSERT INTO series (external_id, title, cover)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [data.external_id, data.title, data.cover];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findById(id: number): Promise<Series | null> {
    const query = `
      SELECT * FROM series WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async update(id: number, data: Partial<Omit<Series, 'id' | 'external_id'>>): Promise<Series | null> {
    const query = `
      UPDATE series
      SET title = $1, cover = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [data.title, data.cover, id];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM series WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
};
