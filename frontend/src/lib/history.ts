import { BrowsingHistoryItem } from '@/types/api';
import { historyApi } from './api';

const STORAGE_KEY = 'product-explorer-history';
const MAX_HISTORY_ITEMS = 50;

export class BrowsingHistoryManager {
  private static instance: BrowsingHistoryManager;
  private history: BrowsingHistoryItem[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): BrowsingHistoryManager {
    if (!BrowsingHistoryManager.instance) {
      BrowsingHistoryManager.instance = new BrowsingHistoryManager();
    }
    return BrowsingHistoryManager.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load browsing history from localStorage:', error);
      this.history = [];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save browsing history to localStorage:', error);
    }
  }

  public addItem(item: Omit<BrowsingHistoryItem, 'id' | 'timestamp'>): void {
    const historyItem: BrowsingHistoryItem = {
      ...item,
      id: `${item.type}-${item.url}-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    // Remove existing item with same type and url
    this.history = this.history.filter(
      (existing) => !(existing.type === item.type && existing.url === item.url)
    );

    // Add new item at the beginning
    this.history.unshift(historyItem);

    // Limit history size
    if (this.history.length > MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, MAX_HISTORY_ITEMS);
    }

    this.saveToStorage();
  }

  public getHistory(): BrowsingHistoryItem[] {
    return [...this.history];
  }

  public clearHistory(): void {
    this.history = [];
    this.saveToStorage();
  }

  public async syncWithBackend(): Promise<void> {
    try {
      await historyApi.syncHistory(this.history);
      console.log('Browsing history synced with backend');
    } catch (error) {
      console.error('Failed to sync browsing history with backend:', error);
    }
  }

  public getRecentItems(limit: number = 10): BrowsingHistoryItem[] {
    return this.history.slice(0, limit);
  }

  public getItemsByType(type: 'category' | 'product'): BrowsingHistoryItem[] {
    return this.history.filter(item => item.type === type);
  }
}

// Export singleton instance
export const browsingHistory = BrowsingHistoryManager.getInstance();

// Helper functions for easy usage
export const addToHistory = (type: 'category' | 'product', name: string, url: string) => {
  browsingHistory.addItem({ type, name, url });
};

export const getHistory = () => browsingHistory.getHistory();
export const clearHistory = () => browsingHistory.clearHistory();
export const syncHistory = () => browsingHistory.syncWithBackend();
