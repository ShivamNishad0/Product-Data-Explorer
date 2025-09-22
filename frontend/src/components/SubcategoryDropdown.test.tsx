import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubcategoryDropdown from './SubcategoryDropdown';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SubcategoryDropdown Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const subcategories = [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Books' },
      { id: 3, name: 'Clothing' },
    ];

    render(<SubcategoryDropdown subcategories={subcategories} />);

    expect(screen.getByText('Select a subcategory')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('Clothing')).toBeInTheDocument();
  });

  it('navigates to selected category when option is selected', () => {
    const subcategories = [
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Books' },
    ];

    render(<SubcategoryDropdown subcategories={subcategories} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });

    expect(mockPush).toHaveBeenCalledWith('/category/2');
  });

  it('does not navigate when no option is selected', () => {
    const subcategories = [
      { id: 1, name: 'Electronics' },
    ];

    render(<SubcategoryDropdown subcategories={subcategories} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders empty when no subcategories are provided', () => {
    render(<SubcategoryDropdown subcategories={[]} />);

    expect(screen.getByText('Select a subcategory')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(1); // Only the default option
  });
});
