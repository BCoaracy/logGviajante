import db from '../../src/lib/db';
import { ReviewModel } from '../../src/models/review';

// Mock the db query pool
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

describe('Review Model (CRUD)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new review and return the record', async () => {
      const mockReview = { id: 1, media_id: 10, review: 'Great game!', evaluation: 10 };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockReview] });

      const result = await ReviewModel.create({
        media_id: 10,
        review: 'Great game!',
        evaluation: 10,
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO reviews'),
        [10, 'Great game!', 10]
      );
      expect(result).toEqual(mockReview);
    });

    it('should throw an error if review is longer than 300 characters', async () => {
      const longReview = 'a'.repeat(301);
      await expect(ReviewModel.create({ media_id: 1, review: longReview, evaluation: 5 }))
        .rejects
        .toThrow('Review text must be 300 characters or less.');
    });

    it('should throw an error if evaluation is outside 0-12 range', async () => {
      await expect(ReviewModel.create({ media_id: 1, review: 'Okay', evaluation: -1 }))
        .rejects
        .toThrow('Evaluation must be between 0 and 12.');
      
      await expect(ReviewModel.create({ media_id: 1, review: 'Okay', evaluation: 13 }))
        .rejects
        .toThrow('Evaluation must be between 0 and 12.');
    });
  });

  describe('findById', () => {
    it('should return a review by its ID', async () => {
      const mockReview = { id: 1, media_id: 10, review: 'Great game!', evaluation: 10 };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockReview] });

      const result = await ReviewModel.findById(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM reviews WHERE id = $1'),
        [1]
      );
      expect(result).toEqual(mockReview);
    });
  });

  describe('update', () => {
    it('should update an existing review and return the updated record', async () => {
      const updatedReview = { id: 1, media_id: 10, review: 'Actually, it was just okay.', evaluation: 6 };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedReview] });

      const result = await ReviewModel.update(1, { review: 'Actually, it was just okay.', evaluation: 6 });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reviews'),
        ['Actually, it was just okay.', 6, 1]
      );
      expect(result).toEqual(updatedReview);
    });

    it('should throw an error if update review text is longer than 300 characters', async () => {
      const longReview = 'a'.repeat(301);
      await expect(ReviewModel.update(1, { review: longReview }))
        .rejects
        .toThrow('Review text must be 300 characters or less.');
    });

    it('should throw an error if update evaluation is outside 0-12 range', async () => {
      await expect(ReviewModel.update(1, { evaluation: 15 }))
        .rejects
        .toThrow('Evaluation must be between 0 and 12.');
    });
  });

  describe('delete', () => {
    it('should delete a review and return true on success', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      const result = await ReviewModel.delete(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM reviews WHERE id = $1'),
        [1]
      );
      expect(result).toBe(true);
    });
  });
});
