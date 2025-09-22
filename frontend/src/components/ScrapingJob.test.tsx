import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScrapingJob from './ScrapingJob';
import { TargetType } from '@/types/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  scrapingApi: {
    enqueueScrape: jest.fn(),
    getScrapeJob: jest.fn(),
  },
}));

import { scrapingApi } from '@/lib/api';

const mockEnqueueScrape = scrapingApi.enqueueScrape as jest.MockedFunction<typeof scrapingApi.enqueueScrape>;
const mockGetScrapeJob = scrapingApi.getScrapeJob as jest.MockedFunction<typeof scrapingApi.getScrapeJob>;

describe('ScrapingJob Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const props = {
      targetUrl: 'https://www.worldofbooks.com/',
      targetType: TargetType.CATEGORY,
    };

    render(<ScrapingJob {...props} />);

    expect(screen.getByText('Scraping')).toBeInTheDocument();
    expect(screen.getByText('Enqueue category Scrape')).toBeInTheDocument();
  });

  it('enqueues a scrape job when button is clicked', async () => {
    const props = {
      targetUrl: 'https://www.worldofbooks.com/',
      targetType: TargetType.CATEGORY,
    };

    mockEnqueueScrape.mockResolvedValueOnce({ message: 'Job enqueued', jobId: 123 });

    render(<ScrapingJob {...props} />);

    const button = screen.getByText('Enqueue category Scrape');
    fireEvent.click(button);

    expect(mockEnqueueScrape).toHaveBeenCalledWith({
      targetUrl: 'https://www.worldofbooks.com/',
      targetType: TargetType.CATEGORY,
    });

    await waitFor(() => {
      expect(screen.getByText(/Job ID: 123/)).toBeInTheDocument();
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
      expect(screen.getByText('Enqueued')).toBeInTheDocument();
    });
  });

  it('shows loading state while enqueuing', () => {
    const props = {
      targetUrl: 'https://www.worldofbooks.com/',
      targetType: TargetType.CATEGORY,
    };

    mockEnqueueScrape.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ScrapingJob {...props} />);

    const button = screen.getByText('Enqueue category Scrape');
    fireEvent.click(button);

    expect(screen.getByText('Enqueuing...')).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('displays error message when enqueue fails', async () => {
    const props = {
      targetUrl: 'https://www.worldofbooks.com/',
      targetType: TargetType.CATEGORY,
    };

    mockEnqueueScrape.mockRejectedValueOnce(new Error('Network error'));

    render(<ScrapingJob {...props} />);

    const button = screen.getByText('Enqueue category Scrape');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  it('polls job status after successful enqueue', async () => {
    const props = {
      targetUrl: 'https://www.worldofbooks.com/',
      targetType: TargetType.CATEGORY,
    };

    mockEnqueueScrape.mockResolvedValueOnce({ message: 'Job enqueued', jobId: 123 });
    mockGetScrapeJob.mockResolvedValueOnce({ id: 123, status: 'in_progress', url: 'https://www.worldofbooks.com/', error_log: null, started_at: null, finished_at: null, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' });

    jest.useFakeTimers();

    render(<ScrapingJob {...props} />);

    const button = screen.getByText('Enqueue category Scrape');
    fireEvent.click(button);

    // Fast-forward time to trigger the polling
    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(mockGetScrapeJob).toHaveBeenCalledWith(123);
    });

    jest.useRealTimers();
  });
});
