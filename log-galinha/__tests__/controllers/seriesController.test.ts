import { SeriesModel } from '../../src/models/series';
import { searchMoviesTMDB } from '../../src/services/tmdb'; // TMDB TV search could use a different endpoint, but the user didn't specify. Assuming TMDB handles both or we adapt. Let's assume standard TMDB service interface for this test suite.
import { searchExternalSeries, saveSeriesToDb, getSeriesById, updateSeries, deleteSeriesById } from '../../src/controllers/seriesController';

jest.mock('../../src/models/series');
jest.mock('../../src/services/tmdb');

describe('Series Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchExternalSeries', () => {
    it('should query the external TMDB API and return standardized success response', async () => {
      const mockResult = [{ external_id: '456', title: 'Breaking Bad', cover: 'bb.jpg' }];
      (searchMoviesTMDB as jest.Mock).mockResolvedValueOnce(mockResult);

      const response = await searchExternalSeries('Breaking Bad');
      expect(searchMoviesTMDB).toHaveBeenCalledWith('Breaking Bad');
      expect(response).toEqual({ success: true, data: mockResult });
    });

    it('should return a 400 error if query is missing', async () => {
      const response = await searchExternalSeries('');
      expect(response).toEqual({ success: false, error: 'Search query is required.', statusCode: 400 });
      expect(searchMoviesTMDB).not.toHaveBeenCalled();
    });
  });

  describe('saveSeriesToDb', () => {
    it('should save a valid series structure to the PostgreSQL database via Model', async () => {
      const seriesData = { external_id: '1', title: 'Breaking Bad', cover: 'bb.jpg' };
      const savedSeries = { id: 10, ...seriesData };
      (SeriesModel.create as jest.Mock).mockResolvedValueOnce(savedSeries);

      const response = await saveSeriesToDb(seriesData);
      expect(SeriesModel.create).toHaveBeenCalledWith(seriesData);
      expect(response).toEqual({ success: true, data: savedSeries });
    });

    it('should return 400 bad request if attempting to save empty or invalid payload', async () => {
      const response = await saveSeriesToDb({ external_id: '', title: '', cover: '' });
      expect(response).toEqual({ success: false, error: 'external_id and title are required to save a series.', statusCode: 400 });
    });
  });

  // Tests for getSeriesById, updateSeries, deleteSeriesById mirror the movies controller exactly
  describe('getSeriesById', () => {
    it('should extract a DB row mapped as a Series object', async () => {
      const mockSeries = { id: 10, external_id: 'ext1', title: 'Test', cover: 'test.jpg' };
      (SeriesModel.findById as jest.Mock).mockResolvedValueOnce(mockSeries);

      const response = await getSeriesById(10);
      expect(SeriesModel.findById).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true, data: mockSeries });
    });
  });

  describe('updateSeries', () => {
    it('should successfully update title/cover and return the new item', async () => {
      const mockUpdated = { id: 10, external_id: '1', title: 'New Title', cover: 'new.jpg' };
      (SeriesModel.update as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await updateSeries(10, { title: 'New Title' });
      expect(SeriesModel.update).toHaveBeenCalledWith(10, { title: 'New Title' });
      expect(response).toEqual({ success: true, data: mockUpdated });
    });
  });

  describe('deleteSeriesById', () => {
    it('should trigger the DB delete and return success true', async () => {
      (SeriesModel.delete as jest.Mock).mockResolvedValueOnce(true);
      const response = await deleteSeriesById(10);
      expect(SeriesModel.delete).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true });
    });
  });
});
