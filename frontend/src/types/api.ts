// API Response Types
export interface NavigationResponse {
  id: number;
  name: string;
  url: string | null;
  source_id: string;
  source_url: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  source_id: string;
  source_url: string;
  navigationId: number;
  createdAt: string;
  updatedAt: string;
  subcategories?: SubCategoryResponse[];
}

export interface SubCategoryResponse {
  id: number;
  name: string;
  source_id: string;
  source_url: string;
  navigationId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailResponse {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  source_id: string;
  source_url: string;
  last_scraped_at: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  product_details: ProductDetailResponse[];
  reviews: ReviewResponse[];
}

export interface ProductListResponse {
  data: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query Parameters
export interface ProductQueryParams {
  categoryId?: number;
  page?: number;
  limit?: number;
  q?: string;
}

// Scraping Types
export enum TargetType {
  NAVIGATION = 'navigation',
  CATEGORY = 'category',
  PRODUCT = 'product',
}

export interface ScrapeRequest {
  targetUrl: string;
  targetType: TargetType;
}

export interface ScrapeJobResponse {
  id: number;
  url: string;
  status: string;
  error_log: string | null;
  started_at: string | null;
  finished_at: string | null;
  createdAt: string;
  updatedAt: string;
}

// Browsing History Types
export interface BrowsingHistoryItem {
  id: string;
  type: 'category' | 'product';
  name: string;
  url: string;
  timestamp: string;
}

export interface BrowsingHistoryResponse {
  message: string;
  history: BrowsingHistoryItem[];
}
