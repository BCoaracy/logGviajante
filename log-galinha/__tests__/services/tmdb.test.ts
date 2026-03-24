import { searchMoviesTMDB } from '../../src/services/tmdb';

// Mock the global fetch API
global.fetch = jest.fn() as jest.Mock;

describe('TMDB Integration - searchMoviesTMDB', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, TMDB_API_KEY: 'test_api_key' };
    (global.fetch as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should fetch movies from TMDB and map them correctly', async () => {
    const mockTMDBResponse = {
      results: [
        {
          id: 550,
          title: 'Fight Club',
          poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTMDBResponse
    });

    const results = await searchMoviesTMDB('Fight Club');

    // Verify fetch was called with correct URL and Auth header
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.themoviedb.org/3/search/movie?query=Fight%20Club'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test_api_key',
          'Content-Type': 'application/json'
        }
      })
    );

    // Verify the data returned maps to our expected structure
    expect(results).toEqual([
      {
        external_id: '550',
        title: 'Fight Club',
        cover: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg'
      }
    ]);
  });

  it('should throw an error if the API request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    await expect(searchMoviesTMDB('Fight Club'))
      .rejects
      .toThrow('Failed to fetch from TMDB, status: 401');
  });
});
