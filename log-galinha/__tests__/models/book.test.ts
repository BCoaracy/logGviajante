import { pool as db } from '../../src/lib/db';
import { BookModel } from '../../src/models/book';

// Mock the db query pool
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

describe('Book Model (CRUD)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new book and return the record', async () => {
      const mockBook = { id: 1, external_id: 'ext-book-1', title: '1984', cover: '1984-cover.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockBook] });

      const result = await BookModel.create({
        external_id: 'ext-book-1',
        title: '1984',
        cover: '1984-cover.jpg',
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO books'),
        ['ext-book-1', '1984', '1984-cover.jpg']
      );
      expect(result).toEqual(mockBook);
    });
  });

  describe('findById', () => {
    it('should return a book by its ID', async () => {
      const mockBook = { id: 1, external_id: 'ext-book-1', title: '1984', cover: '1984-cover.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockBook] });

      const result = await BookModel.findById(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM books WHERE id = $1'),
        [1]
      );
      expect(result).toEqual(mockBook);
    });
  });

  describe('update', () => {
    it('should update an existing book and return the updated record', async () => {
      const updatedBook = { id: 1, external_id: 'ext-book-1', title: '1984 (Special Edition)', cover: '1984-special.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedBook] });

      const result = await BookModel.update(1, { title: '1984 (Special Edition)', cover: '1984-special.jpg' });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE books'),
        ['1984 (Special Edition)', '1984-special.jpg', 1]
      );
      expect(result).toEqual(updatedBook);
    });
  });

  describe('delete', () => {
    it('should delete a book and return true on success', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      const result = await BookModel.delete(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM books WHERE id = $1'),
        [1]
      );
      expect(result).toBe(true);
    });
  });
});
