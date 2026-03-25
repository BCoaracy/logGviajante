import { pool as db } from '../lib/db';

export interface Book {
  id: number;
  external_id: string;
  title: string;
  cover: string;
}

export const BookModel = {
  async create(data: Omit<Book, 'id'>): Promise<Book> {
    const query = `
      INSERT INTO books (external_id, title, cover)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [data.external_id, data.title, data.cover];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findById(id: number): Promise<Book | null> {
    const query = `
      SELECT * FROM books WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async update(id: number, data: Partial<Omit<Book, 'id' | 'external_id'>>): Promise<Book | null> {
    const query = `
      UPDATE books
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
      DELETE FROM books WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
};
