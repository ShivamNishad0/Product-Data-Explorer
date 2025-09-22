import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from './ProductCard';
import type { ProductResponse } from '@/types/api';

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill }: { src: string; alt: string; fill: boolean }) => (
    <img
      src={src}
      alt={alt}
      style={fill ? { width: '100%', height: '100%', objectFit: 'contain' } : undefined}
    />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('ProductCard Component', () => {
  it('renders product information correctly', () => {
    const mockProduct: ProductResponse = {
      id: 1,
      name: 'Test Product',
      source_id: 'test-123',
      source_url: 'https://example.com/image.jpg',
      last_scraped_at: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      categoryId: 1,
      product_details: [
        { id: 1, key: 'author', value: 'Test Author', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
        { id: 2, key: 'price', value: '$29.99', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      ],
      reviews: [],
    };

    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/1');
  });

  it('displays fallback text when author is not available', () => {
    const mockProduct: ProductResponse = {
      id: 1,
      name: 'Test Product',
      source_id: 'test-123',
      source_url: 'https://example.com/image.jpg',
      last_scraped_at: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      categoryId: 1,
      product_details: [
        { id: 2, key: 'price', value: '$29.99', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      ],
      reviews: [],
    };

    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Unknown Author')).toBeInTheDocument();
  });

  it('displays fallback text when price is not available', () => {
    const mockProduct: ProductResponse = {
      id: 1,
      name: 'Test Product',
      source_id: 'test-123',
      source_url: 'https://example.com/image.jpg',
      last_scraped_at: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      categoryId: 1,
      product_details: [
        { id: 1, key: 'author', value: 'Test Author', createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
      ],
      reviews: [],
    };

    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Price not available')).toBeInTheDocument();
  });

  it('displays "No Image" placeholder when source_url is not available', () => {
    const mockProduct: ProductResponse = {
      id: 1,
      name: 'Test Product',
      source_id: 'test-123',
      source_url: '',
      last_scraped_at: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      categoryId: 1,
      product_details: [],
      reviews: [],
    };

    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('No Image')).toBeInTheDocument();
  });
});
