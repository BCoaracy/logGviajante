export interface RAWGGameResult {
  external_id: string;
  title: string;
  cover: string;
}

export async function searchGamesRAWG(query: string): Promise<RAWGGameResult[]> {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw new Error('RAWG_API_KEY is missing from environment variables');
  }

  const url = `https://api.rawg.io/api/games?search=${encodeURIComponent(query)}&key=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch from RAWG, status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((game: any) => ({
    external_id: game.id.toString(),
    title: game.name,
    cover: game.background_image || ''
  }));
}
