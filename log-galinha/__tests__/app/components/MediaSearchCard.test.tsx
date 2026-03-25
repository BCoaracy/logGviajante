import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MediaSearchCard, { ExternalMediaResult } from '../../../src/app/components/MediaSearchCard';

describe('MediaSearchCard Component', () => {
    const mockResult: ExternalMediaResult = {
        external_id: 'tmdb-999',
        title: 'Inception',
        cover: 'inception.jpg'
    };

    const mockOnSave = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the external media result correctly', () => {
        render(<MediaSearchCard result={mockResult} onSave={mockOnSave} />);
        
        expect(screen.getByText('Inception')).toBeInTheDocument();
        const img = screen.getByRole('img', { name: /cover for inception/i });
        expect(img).toHaveAttribute('src', 'inception.jpg');
    });

    it('fires the onSave callback when the save button is clicked', () => {
        render(<MediaSearchCard result={mockResult} onSave={mockOnSave} />);
        
        const saveButton = screen.getByRole('button', { name: /save to library/i });
        fireEvent.click(saveButton);
        
        expect(mockOnSave).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith(mockResult);
    });
});
