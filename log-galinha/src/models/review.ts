import { pool as db } from '../lib/db';

export interface Review {
  id: number;
  media_id: number;
  review: string;
  evaluation: number;
}

const MAX_REVIEW_LENGTH = 300;

function validateReview(data: Partial<Omit<Review, 'id' | 'media_id'>>) {
  if (data.review !== undefined && data.review.length > MAX_REVIEW_LENGTH) {
    throw new Error(`Review text must be ${MAX_REVIEW_LENGTH} characters or less.`);
  }
  if (data.evaluation !== undefined && (data.evaluation < 0 || data.evaluation > 12)) {
    throw new Error('Evaluation must be between 0 and 12.');
  }
}

export const ReviewModel = {
  async create(data: Omit<Review, 'id'>): Promise<Review> {
    validateReview(data);

    const query = `
      INSERT INTO reviews (media_id, review, evaluation)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [data.media_id, data.review, data.evaluation];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findById(id: number): Promise<Review | null> {
    const query = `
      SELECT * FROM reviews WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async update(id: number, data: Partial<Omit<Review, 'id' | 'media_id'>>): Promise<Review | null> {
    validateReview(data);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.review !== undefined) {
      updates.push(`review = $${paramIndex}`);
      values.push(data.review);
      paramIndex++;
    }
    if (data.evaluation !== undefined) {
      updates.push(`evaluation = $${paramIndex}`);
      values.push(data.evaluation);
      paramIndex++;
    }

    if (updates.length === 0) return null; // Nothing to update

    values.push(id);
    const query = `
      UPDATE reviews
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;
    const result = await db.query(query, values);
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const query = `
      DELETE FROM reviews WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
};
