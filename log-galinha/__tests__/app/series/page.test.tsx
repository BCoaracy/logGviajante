import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SeriesPage from '../../../src/app/series/page';

// Mock the native fetch API
global.fetch = jest.fn() as jest.Mock;

describe('Series Page', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('allows users to search and displays results via Series API', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { external_id: '456', title: 'Breaking Bad', cover: 'bb.jpg' }
            ]
        });

        render(<SeriesPage />);

        const input = screen.getByPlaceholderText(/search for TV series/i);
        const searchBtn = screen.getByRole('button', { name: /search/i });

        fireEvent.change(input, { target: { value: 'Breaking Bad' } });
        fireEvent.click(searchBtn);

        expect(global.fetch).toHaveBeenCalledWith('/api/series?search=Breaking%20Bad');

        await waitFor(() => {
            expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
        });
    });

    it('allows users to save a series returning a success message', async () => {
         // First fetch mock for the search
         (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { external_id: '456', title: 'Breaking Bad', cover: 'bb.jpg' }
            ]
        });

        render(<SeriesPage />);
        fireEvent.change(screen.getByPlaceholderText(/search for TV series/i), { target: { value: 'Breaking Bad' } });
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
        });

        // Second fetch mock for the save POST request
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 11, title: 'Breaking Bad' })
        });

        const saveBtn = screen.getByRole('button', { name: /save to library/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/series', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ external_id: '456', title: 'Breaking Bad', cover: 'bb.jpg' })
            }));
            
            expect(screen.getByText(/successfully saved/i)).toBeInTheDocument();
        });
    });
});
