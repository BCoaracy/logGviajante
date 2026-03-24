import db from '../../src/lib/db';
import { SeriesModel } from '../../src/models/series';

// Mock the db query pool
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

describe('Series Model (CRUD)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new series and return the record', async () => {
      const mockSeries = { id: 1, external_id: 'ext-series-1', title: 'Breaking Bad', cover: 'breaking-bad.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSeries] });

      const result = await SeriesModel.create({
        external_id: 'ext-series-1',
        title: 'Breaking Bad',
        cover: 'breaking-bad.jpg',
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO series'),
        ['ext-series-1', 'Breaking Bad', 'breaking-bad.jpg']
      );
      expect(result).toEqual(mockSeries);
    });
  });

  describe('findById', () => {
    it('should return a series by its ID', async () => {
      const mockSeries = { id: 1, external_id: 'ext-series-1', title: 'Breaking Bad', cover: 'breaking-bad.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSeries] });

      const result = await SeriesModel.findById(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM series WHERE id = $1'),
        [1]
      );
      expect(result).toEqual(mockSeries);
    });
  });

  describe('update', () => {
    it('should update an existing series and return the updated record', async () => {
      const updatedSeries = { id: 1, external_id: 'ext-series-1', title: 'Breaking Bad (Remastered)', cover: 'breaking-bad-2.jpg' };
      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedSeries] });

      const result = await SeriesModel.update(1, { title: 'Breaking Bad (Remastered)', cover: 'breaking-bad-2.jpg' });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE series'),
        ['Breaking Bad (Remastered)', 'breaking-bad-2.jpg', 1]
      );
      expect(result).toEqual(updatedSeries);
    });
  });

  describe('delete', () => {
    it('should delete a series and return true on success', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      const result = await SeriesModel.delete(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM series WHERE id = $1'),
        [1]
      );
      expect(result).toBe(true);
    });
  });
});
