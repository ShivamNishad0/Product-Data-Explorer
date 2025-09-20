import axios from 'axios';
import {
  NavigationResponse,
  CategoryResponse,
  ProductResponse,
  ProductListResponse,
  ProductQueryParams,
  ScrapeRequest,
  ScrapeJobResponse,
  BrowsingHistoryResponse,
} from '@/types/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    }
    if (error.response?.status >= 500) {
      throw new Error('Server error occurred');
    }
    throw error;
  }
);

// Navigation API
export const navigationApi = {
  getAll: async (): Promise<NavigationResponse[]> => {
    const response = await api.get('/navigations');
    return response.data;
  },
};

// Category API
export const categoryApi = {
  getById: async (id: number): Promise<CategoryResponse> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};

// Product API
export const productApi = {
  getAll: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  search: async (query: string, categoryId?: number): Promise<ProductListResponse> => {
    const params: ProductQueryParams = { q: query, categoryId };
    return productApi.getAll(params);
  },
};

// Scraping API
export const scrapingApi = {
  enqueueScrape: async (scrapeRequest: ScrapeRequest): Promise<{ message: string; jobId: number }> => {
    const response = await api.post('/scrape', scrapeRequest);
    return response.data;
  },

  getScrapeJob: async (id: number): Promise<ScrapeJobResponse> => {
    const response = await api.get(`/scrape/jobs/${id}`);
    return response.data;
  },
};

// Browsing History API
export const historyApi = {
  syncHistory: async (history: any[]): Promise<BrowsingHistoryResponse> => {
    const response = await api.post('/history/sync', { history });
    return response.data;
  },
};

export default api;
