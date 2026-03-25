import { MovieModel } from '../../src/models/movie';
import { searchMoviesTMDB } from '../../src/services/tmdb';
import { searchExternalMovies, saveMovieToDb, getMovieById, updateMovie, deleteMovieById } from '../../src/controllers/movieController';

// Mock dependencies
jest.mock('../../src/models/movie');
jest.mock('../../src/services/tmdb');

describe('Movie Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchExternalMovies', () => {
    it('should query the external TMDB API and return standardized success response', async () => {
      const mockResult = [{ external_id: '123', title: 'The Matrix', cover: 'matrix.jpg' }];
      (searchMoviesTMDB as jest.Mock).mockResolvedValueOnce(mockResult);

      const response = await searchExternalMovies('The Matrix');

      expect(searchMoviesTMDB).toHaveBeenCalledWith('The Matrix');
      expect(response).toEqual({ success: true, data: mockResult });
    });

    it('should return a 400 error if query is missing', async () => {
      const response = await searchExternalMovies('');
      expect(response).toEqual({ success: false, error: 'Search query is required.', statusCode: 400 });
      expect(searchMoviesTMDB).not.toHaveBeenCalled();
    });

    it('should catch underlying TMDB errors and return a 500 error', async () => {
      (searchMoviesTMDB as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));
      const response = await searchExternalMovies('Test');
      expect(response).toEqual({ success: false, error: 'Failed to search external movies.', statusCode: 500 });
    });
  });

  describe('saveMovieToDb', () => {
    it('should save a valid movie structure to the PostgreSQL database via Model', async () => {
      const movieData = { external_id: '1', title: 'Avatar', cover: 'avatar.jpg' };
      const savedMovie = { id: 10, ...movieData };
      (MovieModel.create as jest.Mock).mockResolvedValueOnce(savedMovie);

      const response = await saveMovieToDb(movieData);

      expect(MovieModel.create).toHaveBeenCalledWith(movieData);
      expect(response).toEqual({ success: true, data: savedMovie });
    });

    it('should return 400 bad request if attempting to save empty or invalid payload', async () => {
      const response = await saveMovieToDb({ external_id: '', title: '', cover: '' });
      expect(response).toEqual({ success: false, error: 'external_id and title are required to save a movie.', statusCode: 400 });
    });
  });

  describe('getMovieById', () => {
    it('should extract a specific DB row mapped as a Movie object', async () => {
      const mockMovie = { id: 10, external_id: 'ext1', title: 'Test', cover: 'test.jpg' };
      (MovieModel.findById as jest.Mock).mockResolvedValueOnce(mockMovie);

      const response = await getMovieById(10);
      expect(MovieModel.findById).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true, data: mockMovie });
    });

    it('should return 404 if movie ID does not exist in DB', async () => {
      (MovieModel.findById as jest.Mock).mockResolvedValueOnce(null);

      const response = await getMovieById(999);
      expect(response).toEqual({ success: false, error: 'Movie not found.', statusCode: 404 });
    });
  });

  describe('updateMovie', () => {
    it('should successfully update title/cover and return the new item', async () => {
      const mockUpdated = { id: 10, external_id: '1', title: 'New Title', cover: 'new.jpg' };
      (MovieModel.update as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await updateMovie(10, { title: 'New Title', cover: 'new.jpg' });
      expect(MovieModel.update).toHaveBeenCalledWith(10, { title: 'New Title', cover: 'new.jpg' });
      expect(response).toEqual({ success: true, data: mockUpdated });
    });
    
    it('should return a 404 error if DB update fails to find target', async () => {
      (MovieModel.update as jest.Mock).mockResolvedValueOnce(null);

      const response = await updateMovie(999, { title: 'Ghost' });
      expect(response).toEqual({ success: false, error: 'Movie not found.', statusCode: 404 });
    });
  });

  describe('deleteMovieById', () => {
    it('should trigger the DB delete and return success true', async () => {
      (MovieModel.delete as jest.Mock).mockResolvedValueOnce(true);
      const response = await deleteMovieById(10);
      
      expect(MovieModel.delete).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true });
    });

    it('should return 404 error code if deleting a non-existent item fails', async () => {
      (MovieModel.delete as jest.Mock).mockResolvedValueOnce(false);
      const response = await deleteMovieById(999);
      
      expect(response).toEqual({ success: false, error: 'Movie not found.', statusCode: 404 });
    });
  });
});
