import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BacklogItemComponent, { UnifiedBacklogItem } from '../../../src/app/components/BacklogItem';

describe('BacklogItem Component', () => {
  const mockItem: UnifiedBacklogItem = {
    id: 1,
    media_id: 100,
    media_type: 'movie',
    status: 'Na Fila',
    title: 'The Matrix',
    cover: 'matrix.jpg'
  };

  const mockOnStatusChange = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the item details correctly', () => {
    render(<BacklogItemComponent item={mockItem} onStatusChange={mockOnStatusChange} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('The Matrix')).toBeInTheDocument();
    expect(screen.getByText('Movie')).toBeInTheDocument(); // capitalized
    
    const coverImage = screen.getByRole('img', { name: /cover for the matrix/i });
    expect(coverImage).toHaveAttribute('src', 'matrix.jpg');
    
    // Check correct default value in select
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('Na Fila');
  });

  it('should call onStatusChange when the user selects a new status', () => {
    render(<BacklogItemComponent item={mockItem} onStatusChange={mockOnStatusChange} onDelete={mockOnDelete} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Finalizado' } });
    
    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'Finalizado');
  });

  it('should call onDelete when the delete button is clicked', () => {
    render(<BacklogItemComponent item={mockItem} onStatusChange={mockOnStatusChange} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /remove item/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
