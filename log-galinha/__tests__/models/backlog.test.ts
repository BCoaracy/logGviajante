import db from '../../src/lib/db';
import { BacklogModel, MediaType, MediaStatus } from '../../src/models/backlog';

// Mock the db query pool
jest.mock('../../src/lib/db', () => ({
  query: jest.fn(),
}));

describe('Backlog Model (CRUD)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('should add a new item to the user backlog', async () => {
      const mockItem = {
        id: 1,
        user_id: 10,
        media_id: 100,
        media_type: 'movie' as MediaType,
        status: 'Na Fila' as MediaStatus
      };

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockItem] });

      const result = await BacklogModel.addItem({
        user_id: 10,
        media_id: 100,
        media_type: 'movie',
        status: 'Na Fila'
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO backlog_items'),
        [10, 100, 'movie', 'Na Fila']
      );
      expect(result).toEqual(mockItem);
    });

    it('should throw an error for invalid status', async () => {
      await expect(BacklogModel.addItem({
        user_id: 10,
        media_id: 100,
        media_type: 'movie',
        status: 'InvalidStatus' as any
      })).rejects.toThrow('Invalid status allowed. Must be "Na Fila", "Em Andamento", or "Finalizado".');
    });

    it('should throw an error for invalid media type', async () => {
      await expect(BacklogModel.addItem({
        user_id: 10,
        media_id: 100,
        media_type: 'invalidType' as any,
        status: 'Na Fila'
      })).rejects.toThrow('Invalid media_type allowed. Must be "movie", "series", "book", or "game".');
    });
  });

  describe('getByUserId', () => {
    it('should retrieve all items for a specific user backlog', async () => {
      const mockItems = [
        { id: 1, user_id: 10, media_id: 100, media_type: 'movie', status: 'Na Fila' },
        { id: 2, user_id: 10, media_id: 201, media_type: 'book', status: 'Em Andamento' }
      ];

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: mockItems });

      const result = await BacklogModel.getByUserId(10);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM backlog_items WHERE user_id = $1'),
        [10]
      );
      expect(result).toEqual(mockItems);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of an existing backlog item', async () => {
      const updatedItem = {
        id: 1,
        user_id: 10,
        media_id: 100,
        media_type: 'movie',
        status: 'Finalizado' as MediaStatus
      };

      (db.query as jest.Mock).mockResolvedValueOnce({ rows: [updatedItem] });

      const result = await BacklogModel.updateStatus(1, 'Finalizado');

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE backlog_items'),
        ['Finalizado', 1]
      );
      expect(result).toEqual(updatedItem);
    });

    it('should throw an error if updating to an invalid status', async () => {
      await expect(BacklogModel.updateStatus(1, 'InvalidStatus' as any))
        .rejects.toThrow('Invalid status allowed. Must be "Na Fila", "Em Andamento", or "Finalizado".');
    });
  });

  describe('removeItem', () => {
    it('should correctly delete an item from the backlog', async () => {
      (db.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      const result = await BacklogModel.removeItem(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM backlog_items WHERE id = $1'),
        [1]
      );
      expect(result).toBe(true);
    });
  });
});
