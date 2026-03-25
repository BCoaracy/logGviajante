import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BooksPage from '../../../src/app/books/page';

// Mock the native fetch API
global.fetch = jest.fn() as jest.Mock;

describe('Books Page', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('allows users to search and displays results via Books API', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { external_id: '456', title: '1984', cover: '1984.jpg' }
            ]
        });

        render(<BooksPage />);

        const input = screen.getByPlaceholderText(/search for books/i);
        const searchBtn = screen.getByRole('button', { name: /search/i });

        fireEvent.change(input, { target: { value: '1984' } });
        fireEvent.click(searchBtn);

        expect(global.fetch).toHaveBeenCalledWith('/api/books?search=1984');

        await waitFor(() => {
            expect(screen.getByText('1984')).toBeInTheDocument();
        });
    });

    it('allows users to save a book returning a success message', async () => {
         // First fetch mock for the search
         (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { external_id: '456', title: '1984', cover: '1984.jpg' }
            ]
        });

        render(<BooksPage />);
        fireEvent.change(screen.getByPlaceholderText(/search for books/i), { target: { value: '1984' } });
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByText('1984')).toBeInTheDocument();
        });

        // Second fetch mock for the save POST request
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 11, title: '1984' })
        });

        const saveBtn = screen.getByRole('button', { name: /save to library/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/books', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ external_id: '456', title: '1984', cover: '1984.jpg' })
            }));
            
            expect(screen.getByText(/successfully saved/i)).toBeInTheDocument();
        });
    });
});
