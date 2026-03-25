import { BacklogModel, BacklogItem, MediaStatus, MediaType } from '../../src/models/backlog';
import { addBacklogItem, getUserBacklog, updateBacklogItemStatus, removeBacklogItem } from '../../src/controllers/backlogController';

jest.mock('../../src/models/backlog');

describe('Backlog Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addBacklogItem', () => {
    it('should successfully add a valid item to the backlog', async () => {
      const mockResult: BacklogItem = { id: 1, user_id: 10, media_id: 100, media_type: 'movie', status: 'Na Fila' };
      (BacklogModel.addItem as jest.Mock).mockResolvedValueOnce(mockResult);

      const response = await addBacklogItem({ user_id: 10, media_id: 100, media_type: 'movie', status: 'Na Fila' });

      expect(BacklogModel.addItem).toHaveBeenCalledWith({
        user_id: 10,
        media_id: 100,
        media_type: 'movie',
        status: 'Na Fila'
      });
      expect(response).toEqual({ success: true, data: mockResult });
    });

    it('should return a 400 bad request error structure if data is missing', async () => {
      const response = await addBacklogItem({ user_id: 0, media_id: 0, media_type: '' as any, status: '' as any });
      
      expect(response).toEqual({ success: false, error: 'Missing required configuration: user_id, media_id, media_type, and status are required.', statusCode: 400 });
      expect(BacklogModel.addItem).not.toHaveBeenCalled();
    });

    it('should catch database errors and return a 500 internal server error structure', async () => {
      (BacklogModel.addItem as jest.Mock).mockRejectedValueOnce(new Error('DB Connection Refused'));

      const response = await addBacklogItem({ user_id: 10, media_id: 100, media_type: 'movie', status: 'Na Fila' });

      expect(response).toEqual({ success: false, error: 'Failed to add item to backlog. Please try again later.', statusCode: 500 });
    });
  });

  describe('getUserBacklog', () => {
    it('should return a structured success response with items', async () => {
      const mockItems: BacklogItem[] = [
        { id: 1, user_id: 10, media_id: 100, media_type: 'movie', status: 'Na Fila' }
      ];
      (BacklogModel.getByUserId as jest.Mock).mockResolvedValueOnce(mockItems);

      const response = await getUserBacklog(10);
      
      expect(BacklogModel.getByUserId).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true, data: mockItems });
    });

    it('should return a structured error response if user_id is invalid', async () => {
      const response = await getUserBacklog(0);
      expect(response).toEqual({ success: false, error: 'Invalid user ID.', statusCode: 400 });
    });
  });

  describe('updateBacklogItemStatus', () => {
    it('should successfully update status and return the item', async () => {
      const updatedItem: BacklogItem = { id: 1, user_id: 10, media_id: 100, media_type: 'movie', status: 'Finalizado' };
      (BacklogModel.updateStatus as jest.Mock).mockResolvedValueOnce(updatedItem);

      const response = await updateBacklogItemStatus(1, 'Finalizado');

      expect(BacklogModel.updateStatus).toHaveBeenCalledWith(1, 'Finalizado');
      expect(response).toEqual({ success: true, data: updatedItem });
    });

    it('should return a 404 error response if the item to update was not found', async () => {
      (BacklogModel.updateStatus as jest.Mock).mockResolvedValueOnce(null);

      const response = await updateBacklogItemStatus(999, 'Finalizado');

      expect(response).toEqual({ success: false, error: 'Backlog item not found.', statusCode: 404 });
    });
  });

  describe('removeBacklogItem', () => {
    it('should return success if the item is deleted', async () => {
      (BacklogModel.removeItem as jest.Mock).mockResolvedValueOnce(true);

      const response = await removeBacklogItem(1);

      expect(BacklogModel.removeItem).toHaveBeenCalledWith(1);
      expect(response).toEqual({ success: true });
    });

    it('should return a 404 error response if the item delete failed/was not found', async () => {
      (BacklogModel.removeItem as jest.Mock).mockResolvedValueOnce(false);

      const response = await removeBacklogItem(999);

      expect(response).toEqual({ success: false, error: 'Backlog item not found.', statusCode: 404 });
    });
  });
});
