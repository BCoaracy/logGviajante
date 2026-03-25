import { BookModel } from '../../src/models/book';
import { searchGoogleBooks } from '../../src/services/googleBooks'; 
import { searchExternalBooks, saveBookToDb, getBookById, updateBook, deleteBookById } from '../../src/controllers/bookController';

jest.mock('../../src/models/book');
jest.mock('../../src/services/googleBooks');

describe('Book Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchExternalBooks', () => {
    it('should query the external Google API and return standardized success response', async () => {
      const mockResult = [{ external_id: 'abc', title: '1984', cover: '1984.jpg' }];
      (searchGoogleBooks as jest.Mock).mockResolvedValueOnce(mockResult);

      const response = await searchExternalBooks('1984');
      expect(searchGoogleBooks).toHaveBeenCalledWith('1984');
      expect(response).toEqual({ success: true, data: mockResult });
    });

    it('should return a 400 error if query is missing', async () => {
      const response = await searchExternalBooks('');
      expect(response).toEqual({ success: false, error: 'Search query is required.', statusCode: 400 });
      expect(searchGoogleBooks).not.toHaveBeenCalled();
    });
  });

  describe('saveBookToDb', () => {
    it('should save a valid book structure to DB', async () => {
      const bookData = { external_id: '1', title: '1984', cover: '1984.jpg' };
      const savedBook = { id: 10, ...bookData };
      (BookModel.create as jest.Mock).mockResolvedValueOnce(savedBook);

      const response = await saveBookToDb(bookData);
      expect(BookModel.create).toHaveBeenCalledWith(bookData);
      expect(response).toEqual({ success: true, data: savedBook });
    });
  });

  describe('getBookById', () => {
    it('should extract a DB row mapped as a Book object', async () => {
      const mockBook = { id: 10, external_id: 'ext1', title: 'Test', cover: 'test.jpg' };
      (BookModel.findById as jest.Mock).mockResolvedValueOnce(mockBook);

      const response = await getBookById(10);
      expect(BookModel.findById).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true, data: mockBook });
    });
  });

  describe('updateBook', () => {
    it('should successfully update title/cover and return the new item', async () => {
      const mockUpdated = { id: 10, external_id: '1', title: 'New Title', cover: 'new.jpg' };
      (BookModel.update as jest.Mock).mockResolvedValueOnce(mockUpdated);

      const response = await updateBook(10, { title: 'New Title' });
      expect(BookModel.update).toHaveBeenCalledWith(10, { title: 'New Title' });
      expect(response).toEqual({ success: true, data: mockUpdated });
    });
  });

  describe('deleteBookById', () => {
    it('should trigger the DB delete and return success true', async () => {
      (BookModel.delete as jest.Mock).mockResolvedValueOnce(true);
      const response = await deleteBookById(10);
      expect(BookModel.delete).toHaveBeenCalledWith(10);
      expect(response).toEqual({ success: true });
    });
  });
});
