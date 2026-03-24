export interface TMDBMovieResult {
  external_id: string;
  title: string;
  cover: string;
}

export async function searchMoviesTMDB(query: string): Promise<TMDBMovieResult[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is missing from environment variables');
  }

  const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from TMDB, status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((result: any) => ({
    external_id: result.id.toString(),
    title: result.title,
    cover: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : ''
  }));
}
