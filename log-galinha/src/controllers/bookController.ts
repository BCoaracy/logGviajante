import { BookModel, Book } from '../models/book';
import { searchGoogleBooks, GoogleBookResult } from '../services/googleBooks'; 
import { ServiceResponse } from './movieController'; 

export async function searchExternalBooks(query: string): Promise<ServiceResponse<GoogleBookResult[]>> {
  if (!query || query.trim() === '') {
    return { success: false, error: 'Search query is required.', statusCode: 400 };
  }

  try {
    const results = await searchGoogleBooks(query); 
    return { success: true, data: results };
  } catch (error: any) {
    console.error('[BookController.searchExternalBooks]', error);
    return { success: false, error: 'Failed to search external books.', statusCode: 500 };
  }
}

export async function saveBookToDb(data: Omit<Book, 'id'>): Promise<ServiceResponse<Book>> {
  if (!data.external_id || !data.title) {
    return { success: false, error: 'external_id and title are required to save a book.', statusCode: 400 };
  }

  try {
    const savedBook = await BookModel.create({
      external_id: data.external_id,
      title: data.title,
      cover: data.cover || ''
    });
    return { success: true, data: savedBook };
  } catch (error: any) {
    console.error('[BookController.saveBookToDb]', error);
    return { success: false, error: 'Failed to save book to database.', statusCode: 500 };
  }
}

export async function getBookById(id: number): Promise<ServiceResponse<Book>> {
  if (!id) return { success: false, error: 'Invalid book ID.', statusCode: 400 };

  try {
    const book = await BookModel.findById(id);
    if (!book) return { success: false, error: 'Book not found.', statusCode: 404 };
    
    return { success: true, data: book };
  } catch (error: any) {
    console.error('[BookController.getBookById]', error);
    return { success: false, error: 'Failed to retrieve book.', statusCode: 500 };
  }
}

export async function updateBook(id: number, data: Partial<Omit<Book, 'id' | 'external_id'>>): Promise<ServiceResponse<Book>> {
  if (!id) return { success: false, error: 'Invalid book ID.', statusCode: 400 };

  try {
    const updated = await BookModel.update(id, data);
    if (!updated) return { success: false, error: 'Book not found.', statusCode: 404 };
    
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('[BookController.updateBook]', error);
    return { success: false, error: 'Failed to update book.', statusCode: 500 };
  }
}

export async function deleteBookById(id: number): Promise<ServiceResponse<null>> {
  if (!id) return { success: false, error: 'Invalid book ID.', statusCode: 400 };

  try {
    const success = await BookModel.delete(id);
    if (!success) return { success: false, error: 'Book not found.', statusCode: 404 };
    
    return { success: true };
  } catch (error: any) {
    console.error('[BookController.deleteBookById]', error);
    return { success: false, error: 'Failed to delete book.', statusCode: 500 };
  }
}
