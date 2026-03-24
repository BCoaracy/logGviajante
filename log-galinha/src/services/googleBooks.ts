export interface GoogleBookResult {
  external_id: string;
  title: string;
  cover: string;
}

export async function searchGoogleBooks(query: string): Promise<GoogleBookResult[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch from Google Books, status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.items || !Array.isArray(data.items)) {
    return [];
  }

  return data.items.map((item: any) => ({
    external_id: item.id,
    title: item.volumeInfo?.title || 'Unknown Title',
    cover: item.volumeInfo?.imageLinks?.thumbnail || ''
  }));
}
