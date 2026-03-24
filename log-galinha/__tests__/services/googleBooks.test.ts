import { searchGoogleBooks } from '../../src/services/googleBooks';

// Mock the global fetch API
global.fetch = jest.fn() as jest.Mock;

describe('Google Books API Integration - searchGoogleBooks', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should fetch books from Google Books API and map them correctly', async () => {
    const mockGoogleBooksResponse = {
      items: [
        {
          id: 'mock-vol-id-123',
          volumeInfo: {
            title: 'The Hobbit',
            imageLinks: {
              thumbnail: 'http://books.google.com/books/content?id=mock-vol-id-123&printsec=frontcover&img=1&zoom=1&source=gbs_api'
            }
          }
        },
        {
          id: 'mock-vol-id-456',
          volumeInfo: {
            title: 'The Lord of the Rings'
            // Missing imageLinks to test fallback
          }
        }
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGoogleBooksResponse
    });

    const results = await searchGoogleBooks('The Hobbit');

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://www.googleapis.com/books/v1/volumes?q=The%20Hobbit')
    );

    // Verify the data returned maps to our expected structure
    expect(results).toEqual([
      {
        external_id: 'mock-vol-id-123',
        title: 'The Hobbit',
        cover: 'http://books.google.com/books/content?id=mock-vol-id-123&printsec=frontcover&img=1&zoom=1&source=gbs_api'
      },
      {
        external_id: 'mock-vol-id-456',
        title: 'The Lord of the Rings',
        cover: '' // No thumbnail provided
      }
    ]);
  });

  it('should return an empty array if no items are found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ totalItems: 0 }) // items array is often undefined when 0 results
    });

    const results = await searchGoogleBooks('Some Unknown Book Name');
    expect(results).toEqual([]);
  });

  it('should throw an error if the API request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    await expect(searchGoogleBooks('The Hobbit'))
      .rejects
      .toThrow('Failed to fetch from Google Books, status: 500');
  });
});
