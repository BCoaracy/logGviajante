import * as GameModel from '../models/game';
import { searchGamesRAWG, RAWGGameResult } from '../services/rawg'; 
import { ServiceResponse } from './movieController'; 

// Using standard Game interface fallback assuming Game type structure from the tests
interface Game { id: number; externalId: string; title: string; cover: string; }

export async function searchExternalGames(query: string): Promise<ServiceResponse<RAWGGameResult[]>> {
  if (!query || query.trim() === '') {
    return { success: false, error: 'Search query is required.', statusCode: 400 };
  }

  try {
    const results = await searchGamesRAWG(query); 
    return { success: true, data: results };
  } catch (error: any) {
    console.error('[GameController.searchExternalGames]', error);
    return { success: false, error: 'Failed to search external games.', statusCode: 500 };
  }
}

export async function saveGameToDb(data: Omit<Game, 'id'>): Promise<ServiceResponse<Game>> {
  if (!data.externalId || !data.title) {
    return { success: false, error: 'external_id and title are required to save a game.', statusCode: 400 };
  }

  try {
    const savedGame = await GameModel.createGame({
      externalId: data.externalId,
      title: data.title,
      cover: data.cover || ''
    });
    return { success: true, data: savedGame as unknown as Game }; // Type coercion workaround for unified standard
  } catch (error: any) {
    console.error('[GameController.saveGameToDb]', error);
    return { success: false, error: 'Failed to save game to database.', statusCode: 500 };
  }
}

export async function getGameById(id: number): Promise<ServiceResponse<Game>> {
  if (!id) return { success: false, error: 'Invalid game ID.', statusCode: 400 };

  try {
    const game = await GameModel.getGameById(id);
    if (!game) return { success: false, error: 'Game not found.', statusCode: 404 };
    
    return { success: true, data: game as unknown as Game };
  } catch (error: any) {
    console.error('[GameController.getGameById]', error);
    return { success: false, error: 'Failed to retrieve game.', statusCode: 500 };
  }
}

export async function updateGame(id: number, data: Partial<Omit<Game, 'id' | 'external_id'>>): Promise<ServiceResponse<Game>> {
  if (!id) return { success: false, error: 'Invalid game ID.', statusCode: 400 };

  try {
    const updated = await GameModel.updateGame(id, data);
    if (!updated) return { success: false, error: 'Game not found.', statusCode: 404 };
    
    return { success: true, data: updated as unknown as Game };
  } catch (error: any) {
    console.error('[GameController.updateGame]', error);
    return { success: false, error: 'Failed to update game.', statusCode: 500 };
  }
}

export async function deleteGameById(id: number): Promise<ServiceResponse<null>> {
  if (!id) return { success: false, error: 'Invalid game ID.', statusCode: 400 };

  try {
    const success = await GameModel.deleteGame(id);
    if (!success) return { success: false, error: 'Game not found.', statusCode: 404 };
    
    return { success: true };
  } catch (error: any) {
    console.error('[GameController.deleteGameById]', error);
    return { success: false, error: 'Failed to delete game.', statusCode: 500 };
  }
}
