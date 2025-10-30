/**
 * Local Storage Service
 * Provides type-safe localStorage access with error handling and validation
 */

const STORAGE_PREFIX = 'ai-analyst-';

export interface StorageOptions {
  expiresIn?: number; // milliseconds
}

interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

export class LocalStorageService {
  private static instance: LocalStorageService;

  private constructor() {}

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  /**
   * Check if localStorage is available
   */
  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a value from localStorage
   */
  public get<T>(key: string): T | null {
    if (!this.isAvailable()) return null;

    try {
      const fullKey = STORAGE_PREFIX + key;
      const item = localStorage.getItem(fullKey);
      
      if (!item) return null;

      const stored: StorageItem<T> = JSON.parse(item);

      // Check if item has expired
      if (stored.expiresAt && Date.now() > stored.expiresAt) {
        this.remove(key);
        return null;
      }

      return stored.value;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * Set a value in localStorage
   */
  public set<T>(key: string, value: T, options?: StorageOptions): boolean {
    if (!this.isAvailable()) return false;

    try {
      const fullKey = STORAGE_PREFIX + key;
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: options?.expiresIn ? Date.now() + options.expiresIn : undefined
      };

      localStorage.setItem(fullKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Remove a value from localStorage
   */
  public remove(key: string): void {
    if (!this.isAvailable()) return;

    try {
      const fullKey = STORAGE_PREFIX + key;
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  /**
   * Clear all items with the app prefix
   */
  public clear(): void {
    if (!this.isAvailable()) return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if a key exists
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get all keys with the app prefix
   */
  public keys(): string[] {
    if (!this.isAvailable()) return [];

    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.replace(STORAGE_PREFIX, ''));
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get storage usage information
   */
  public getUsageInfo(): { used: number; available: number; percentage: number } | null {
    if (!this.isAvailable()) return null;

    try {
      // Estimate localStorage size (most browsers have 5-10MB limit)
      const allData = JSON.stringify(localStorage);
      const used = new Blob([allData]).size;
      const available = 5 * 1024 * 1024; // Assume 5MB limit
      const percentage = (used / available) * 100;

      return {
        used,
        available,
        percentage: Math.round(percentage * 100) / 100
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return null;
    }
  }
}

// Export singleton instance
export const localStorageService = LocalStorageService.getInstance();

