import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BacklogPage from '../../../src/app/backlog/page';

// Mock the native fetch API
global.fetch = jest.fn() as jest.Mock;

describe('Backlog Page', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('displays a loading state initially and then renders items', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [
                { id: 1, media_id: 100, media_type: 'movie', status: 'Na Fila', title: 'The Matrix', cover: 'matrix.jpg' },
                { id: 2, media_id: 200, media_type: 'book', status: 'Em Andamento', title: '1984', cover: '1984.jpg' }
            ]
        });

        render(<BacklogPage />);

        expect(screen.getByText('Loading your universe...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('The Matrix')).toBeInTheDocument();
            expect(screen.getByText('1984')).toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/backlog?userId=10');
    });

    it('displays the empty state when no items are returned', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => []
        });

        render(<BacklogPage />);

        await waitFor(() => {
            expect(screen.getByText(/Your backlog is empty/i)).toBeInTheDocument();
        });
    });

    it('displays an error state when fetch fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network disconnected'));

        render(<BacklogPage />);

        await waitFor(() => {
            expect(screen.getByText(/Error: Network disconnected/i)).toBeInTheDocument();
        });
    });
});
