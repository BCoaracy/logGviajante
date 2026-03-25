import * as GameModel from '../../src/models/game';
import { searchGamesRAWG } from '../../src/services/rawg'; 
import { searchExternalGames, saveGameToDb, getGameById, updateGame, deleteGameById } from '../../src/controllers/gameController';

jest.mock('../../src/models/game');
jest.mock('../../src/services/rawg');

describe('Game Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchExternalGames', () => {
    it('should query the external RAWG API and return standardized success response', async () => {
      const mockResult = [{ external_id: 'abc', title: 'Halo', cover: 'halo.jpg' }];
      (searchGamesRAWG as jest.Mock).mockResolvedValueOnce(mockResult);

      const response = await searchExternalGames('Halo');
      expect(searchGamesRAWG).toHaveBeenCalledWith('Halo');
      expect(response).toEqual({ success: true, data: mockResult });
    });

    it('should return a 400 error if query is missing', async () => {
      const response = await searchExternalGames('');
      expect(response).toEqual({ success: false, error: 'Search query is required.', statusCode: 400 });
      expect(searchGamesRAWG).not.toHaveBeenCalled();
    });
  });

  describe('saveGameToDb', () => {
    it('should save a valid game structure to DB', async () => {
      const gameData = { externalId: '1', title: 'Halo', cover: 'halo.jpg' };
      const savedGame = { id: 10, ...gameData };
      (GameModel.createGame as jest.Mock).mockResolvedValueOnce(savedGame);

      const response = await saveGameToDb(gameData);
      expect(GameModel.createGame).toHaveBeenCalledWith(gameData);
      expect(response).toEqual({ success: true, data: savedGame });
    });
  });

  describe('getGameById', () => {
    it('should extract a DB row mapped as a Game object', async () => {
      const mockGame = { id: 10, external_id: 'ext1', title: 'Test', cover: 'test.jpg' };
      (GameModel.getGameById as jest.Mock).mockResolvedValueOnce(mockGame);

      const response = await getGameById(10);
      expect(GameModel.getGameById).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true, data: mockGame });
    });
  });

  describe('updateGame', () => {
    it('should successfully update title/cover and return the new item', async () => {
      const mockUpdated = { id: 10, external_id: '1', title: 'New Title', cover: 'new.jpg' };
      (GameModel.updateGame as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await updateGame(10, { title: 'New Title' });
      expect(GameModel.updateGame).toHaveBeenCalledWith(10, { title: 'New Title' });
      expect(response).toEqual({ success: true, data: mockUpdated });
    });
  });

  describe('deleteGameById', () => {
    it('should trigger the DB delete and return success true', async () => {
      (GameModel.deleteGame as jest.Mock).mockResolvedValueOnce(true);
      const response = await deleteGameById(10);
      expect(GameModel.deleteGame).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true });
    });
  });
});
