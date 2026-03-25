import { MovieModel, Movie } from '../models/movie';
import { searchMoviesTMDB, TMDBMovieResult } from '../services/tmdb';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export async function searchExternalMovies(query: string): Promise<ServiceResponse<TMDBMovieResult[]>> {
  if (!query || query.trim() === '') {
    return { success: false, error: 'Search query is required.', statusCode: 400 };
  }

  try {
    const results = await searchMoviesTMDB(query);
    return { success: true, data: results };
  } catch (error: any) {
    console.error('[MovieController.searchExternalMovies]', error);
    return { success: false, error: 'Failed to search external movies.', statusCode: 500 };
  }
}

export async function saveMovieToDb(data: Omit<Movie, 'id'>): Promise<ServiceResponse<Movie>> {
  if (!data.external_id || !data.title) {
    return { success: false, error: 'external_id and title are required to save a movie.', statusCode: 400 };
  }

  try {
    const savedMovie = await MovieModel.create({
      external_id: data.external_id,
      title: data.title,
      cover: data.cover || ''
    });
    return { success: true, data: savedMovie };
  } catch (error: any) {
    console.error('[MovieController.saveMovieToDb]', error);
    return { success: false, error: 'Failed to save movie to database.', statusCode: 500 };
  }
}

export async function getMovieById(id: number): Promise<ServiceResponse<Movie>> {
  if (!id) return { success: false, error: 'Invalid movie ID.', statusCode: 400 };

  try {
    const movie = await MovieModel.findById(id);
    if (!movie) return { success: false, error: 'Movie not found.', statusCode: 404 };
    
    return { success: true, data: movie };
  } catch (error: any) {
    console.error('[MovieController.getMovieById]', error);
    return { success: false, error: 'Failed to retrieve movie.', statusCode: 500 };
  }
}

export async function updateMovie(id: number, data: Partial<Omit<Movie, 'id' | 'external_id'>>): Promise<ServiceResponse<Movie>> {
  if (!id) return { success: false, error: 'Invalid movie ID.', statusCode: 400 };

  try {
    const updated = await MovieModel.update(id, data);
    if (!updated) return { success: false, error: 'Movie not found.', statusCode: 404 };
    
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[MovieController.updateMovie]', error);
    return { success: false, error: 'Failed to update movie.', statusCode: 500 };
  }
}

export async function deleteMovieById(id: number): Promise<ServiceResponse<null>> {
  if (!id) return { success: false, error: 'Invalid movie ID.', statusCode: 400 };

  try {
    const success = await MovieModel.delete(id);
    if (!success) return { success: false, error: 'Movie not found.', statusCode: 404 };
    
    return { success: true };
  } catch (error: any) {
    console.error('[MovieController.deleteMovieById]', error);
    return { success: false, error: 'Failed to delete movie.', statusCode: 500 };
  }
}
