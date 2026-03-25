import { searchGamesRAWG } from '../../src/services/rawg';

// Mock the global fetch API
global.fetch = jest.fn() as jest.Mock;

describe('RAWG API Integration - searchGamesRAWG', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, RAWG_API_KEY: 'test_rawg_key' };
    (global.fetch as jest.Mock).mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should fetch games from RAWG API and map them correctly', async () => {
    const mockRAWGResponse = {
      results: [
        {
          id: 3498,
          name: 'Grand Theft Auto V',
          background_image: 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg'
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRAWGResponse
    });

    const results = await searchGamesRAWG('Grand Theft Auto V');

    // Verify fetch was called with correct URL including the API key
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.rawg.io/api/games?search=Grand%20Theft%20Auto%20V&key=test_rawg_key')
    );

    // Verify the data returned maps to our expected structure
    expect(results).toEqual([
      {
        external_id: '3498',
        title: 'Grand Theft Auto V',
        cover: 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg'
      }
    ]);
  });

  it('should return an empty array if no items are found or results is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ count: 0 }) 
    });

    const results = await searchGamesRAWG('Some Unknown Game XYZ');
    expect(results).toEqual([]);
  });

  it('should throw an error if the API request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403
    });

    await expect(searchGamesRAWG('Zelda'))
      .rejects
      .toThrow('Failed to fetch from RAWG, status: 403');
  });
});
