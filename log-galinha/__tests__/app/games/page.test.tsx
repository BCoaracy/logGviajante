import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GamesPage from '../../../src/app/games/page';

// Mock the native fetch API
global.fetch = jest.fn() as jest.Mock;

describe('Games Page', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('allows users to search and displays results via Games API', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { external_id: '456', title: 'Halo', cover: 'halo.jpg' }
            ]
        });

        render(<GamesPage />);

        const input = screen.getByPlaceholderText(/search for games/i);
        const searchBtn = screen.getByRole('button', { name: /search/i });

        fireEvent.change(input, { target: { value: 'Halo' } });
        fireEvent.click(searchBtn);

        expect(global.fetch).toHaveBeenCalledWith('/api/games?search=Halo');

        await waitFor(() => {
            expect(screen.getByText('Halo')).toBeInTheDocument();
        });
    });

    it('allows users to save a game returning a success message', async () => {
         // First fetch mock for the search
         (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { external_id: '456', title: 'Halo', cover: 'halo.jpg' }
            ]
        });

        render(<GamesPage />);
        fireEvent.change(screen.getByPlaceholderText(/search for games/i), { target: { value: 'Halo' } });
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        await waitFor(() => {
            expect(screen.getByText('Halo')).toBeInTheDocument();
        });

        // Second fetch mock for the save POST request
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 11, title: 'Halo' })
        });

        const saveBtn = screen.getByRole('button', { name: /save to library/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/games', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ external_id: '456', title: 'Halo', cover: 'halo.jpg' })
            }));
            
            expect(screen.getByText(/successfully saved/i)).toBeInTheDocument();
        });
    });
});
