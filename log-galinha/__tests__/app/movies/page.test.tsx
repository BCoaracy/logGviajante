import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MoviesPage from '../../../src/app/movies/page';

// Mock the native fetch API
global.fetch = jest.fn() as jest.Mock;

describe('Movies Page', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('allows users to search and displays results', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { external_id: '123', title: 'The Matrix', cover: 'matrix.jpg' }
            ]
        });

        render(<MoviesPage />);

        const input = screen.getByPlaceholderText(/search for movies/i);
        const searchBtn = screen.getByRole('button', { name: /search/i });

        fireEvent.change(input, { target: { value: 'The Matrix' } });
        fireEvent.click(searchBtn);

        expect(global.fetch).toHaveBeenCalledWith('/api/movies?search=The%20Matrix');

        await waitFor(() => {
            expect(screen.getByText('The Matrix')).toBeInTheDocument();
        });
    });

    it('allows users to save a movie returning a success message', async () => {
         // First fetch mock for the search
         (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { external_id: '123', title: 'The Matrix', cover: 'matrix.jpg' }
            ]
        });

        render(<MoviesPage />);
        fireEvent.change(screen.getByPlaceholderText(/search for movies/i), { target: { value: 'The Matrix' } });
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByText('The Matrix')).toBeInTheDocument();
        });

        // Second fetch mock for the save POST request
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 10, title: 'The Matrix' })
        });

        // Click save button
        const saveBtn = screen.getByRole('button', { name: /save to library/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/movies', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ external_id: '123', title: 'The Matrix', cover: 'matrix.jpg' })
            }));
            
            // Check success message 
            expect(screen.getByText(/successfully saved/i)).toBeInTheDocument();
        });
    });
});
