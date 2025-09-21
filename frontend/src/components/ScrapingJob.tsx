'use client';

import React, { useState } from 'react';
import { scrapingApi } from '@/lib/api';
import { TargetType } from '@/types/api';

interface ScrapingJobProps {
  targetUrl: string;
  targetType: TargetType;
}

export default function ScrapingJob({ targetUrl, targetType }: ScrapingJobProps) {
  const [jobId, setJobId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enqueueScrape = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await scrapingApi.enqueueScrape({ targetUrl, targetType });
      setJobId(response.jobId);
      setStatus('Enqueued');
      pollJobStatus(response.jobId);
    } catch (err: any) {
      setError(err.message || 'Failed to enqueue scrape job');
    } finally {
      setLoading(false);
    }
  };

  const pollJobStatus = async (id: number) => {
    try {
      const job = await scrapingApi.getScrapeJob(id);
      setStatus(job.status);
      if (job.status === 'pending' || job.status === 'in_progress') {
        setTimeout(() => pollJobStatus(id), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch scrape job status');
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-2">Scraping</h3>
      <button
        onClick={enqueueScrape}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Enqueuing...' : `Enqueue ${targetType} Scrape`}
      </button>
      {jobId && (
        <p className="mt-2">
          Job ID: {jobId} - Status: <span className="font-medium">{status}</span>
        </p>
      )}
      {error && <p className="mt-2 text-red-600">Error: {error}</p>}
    </div>
  );
}
