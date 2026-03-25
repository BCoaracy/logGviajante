import { pool as db } from '../../src/lib/db';
import { MovieModel } from '../../src/models/movie';

// Mock the db query pool
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

describe('Movie Model (CRUD)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new movie and return the record', async () => {
      const mockMovie = { id: 1, external_id: 'ext-123', title: 'The Matrix', cover: 'matrix.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMovie] });

      const result = await MovieModel.create({
        external_id: 'ext-123',
        title: 'The Matrix',
        cover: 'matrix.jpg',
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO movies'),
        ['ext-123', 'The Matrix', 'matrix.jpg']
      );
      expect(result).toEqual(mockMovie);
    });
  });

  describe('findById', () => {
    it('should return a movie by its ID', async () => {
      const mockMovie = { id: 1, external_id: 'ext-123', title: 'The Matrix', cover: 'matrix.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMovie] });

      const result = await MovieModel.findById(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM movies WHERE id = $1'),
        [1]
      );
      expect(result).toEqual(mockMovie);
    });
  });

  describe('update', () => {
    it('should update an existing movie and return the updated record', async () => {
      const updatedMovie = { id: 1, external_id: 'ext-123', title: 'The Matrix Reloaded', cover: 'matrix-2.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedMovie] });

      const result = await MovieModel.update(1, { title: 'The Matrix Reloaded', cover: 'matrix-2.jpg' });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE movies'),
        ['The Matrix Reloaded', 'matrix-2.jpg', 1]
      );
      expect(result).toEqual(updatedMovie);
    });
  });

  describe('delete', () => {
    it('should delete a movie and return true on success', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      const result = await MovieModel.delete(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM movies WHERE id = $1'),
        [1]
      );
      expect(result).toBe(true);
    });
  });
});
