import { pool as db } from '../lib/db';

export interface Movie {
  id: number;
  external_id: string;
  title: string;
  cover: string;
}

export const MovieModel = {
  async create(data: Omit<Movie, 'id'>): Promise<Movie> {
    const query = `
      INSERT INTO movies (external_id, title, cover)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [data.external_id, data.title, data.cover];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findById(id: number): Promise<Movie | null> {
    const query = `
      SELECT * FROM movies WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async update(id: number, data: Partial<Omit<Movie, 'id' | 'external_id'>>): Promise<Movie | null> {
    const query = `
      UPDATE movies
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
      DELETE FROM movies WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
};
