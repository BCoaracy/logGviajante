import { SeriesModel, Series } from '../models/series';
import { searchMoviesTMDB, TMDBMovieResult } from '../services/tmdb'; // For simplicity using TMDB which provides TV endpoints as well, aliased contextually
import { ServiceResponse } from './movieController'; // Code reuse

export async function searchExternalSeries(query: string): Promise<ServiceResponse<TMDBMovieResult[]>> {
  if (!query || query.trim() === '') {
    return { success: false, error: 'Search query is required.', statusCode: 400 };
  }

  try {
    const results = await searchMoviesTMDB(query); // Function matches structurally
    return { success: true, data: results };
  } catch (error: any) {
    console.error('[SeriesController.searchExternalSeries]', error);
    return { success: false, error: 'Failed to search external series.', statusCode: 500 };
  }
}

export async function saveSeriesToDb(data: Omit<Series, 'id'>): Promise<ServiceResponse<Series>> {
  if (!data.external_id || !data.title) {
    return { success: false, error: 'external_id and title are required to save a series.', statusCode: 400 };
  }

  try {
    const savedSeries = await SeriesModel.create({
      external_id: data.external_id,
      title: data.title,
      cover: data.cover || ''
    });
    return { success: true, data: savedSeries };
  } catch (error: any) {
    console.error('[SeriesController.saveSeriesToDb]', error);
    return { success: false, error: 'Failed to save series to database.', statusCode: 500 };
  }
}

export async function getSeriesById(id: number): Promise<ServiceResponse<Series>> {
  if (!id) return { success: false, error: 'Invalid series ID.', statusCode: 400 };

  try {
    const series = await SeriesModel.findById(id);
    if (!series) return { success: false, error: 'Series not found.', statusCode: 404 };
    
    return { success: true, data: series };
  } catch (error: any) {
    console.error('[SeriesController.getSeriesById]', error);
    return { success: false, error: 'Failed to retrieve series.', statusCode: 500 };
  }
}

export async function updateSeries(id: number, data: Partial<Omit<Series, 'id' | 'external_id'>>): Promise<ServiceResponse<Series>> {
  if (!id) return { success: false, error: 'Invalid series ID.', statusCode: 400 };

  try {
    const updated = await SeriesModel.update(id, data);
    if (!updated) return { success: false, error: 'Series not found.', statusCode: 404 };
    
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[SeriesController.updateSeries]', error);
    return { success: false, error: 'Failed to update series.', statusCode: 500 };
  }
}

export async function deleteSeriesById(id: number): Promise<ServiceResponse<null>> {
  if (!id) return { success: false, error: 'Invalid series ID.', statusCode: 400 };

  try {
    const success = await SeriesModel.delete(id);
    if (!success) return { success: false, error: 'Series not found.', statusCode: 404 };
    
    return { success: true };
  } catch (error: any) {
    console.error('[SeriesController.deleteSeriesById]', error);
    return { success: false, error: 'Failed to delete series.', statusCode: 500 };
  }
}
