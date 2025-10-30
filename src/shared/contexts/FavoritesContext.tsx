'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { localStorageService } from '@/lib/services/local-storage-service';

const STORAGE_KEY = STORAGE_KEYS.FAVORITES;

export interface Favorite {
  ticker: string;
  addedAt: Date;
}

interface StoredFavorite {
  ticker: string;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  isFavorite: (ticker: string) => boolean;
  addFavorite: (ticker: string) => void;
  removeFavorite: (ticker: string) => void;
  toggleFavorite: (ticker: string) => void;
  clearFavorites: () => void;
  isLoaded: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Try new key first (without prefix in constant, service adds prefix)
      let stored = localStorageService.get<StoredFavorite[]>(STORAGE_KEY);
      
      // Migration: Check for old key format if new key is empty
      if (!stored || (Array.isArray(stored) && stored.length === 0)) {
        const oldKey = 'ai-analyst-favorites';
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          try {
            const parsed = JSON.parse(oldData);
            // Handle both old direct format and wrapped format
            const favorites = parsed.value || parsed;
            if (Array.isArray(favorites) && favorites.length > 0) {
              stored = favorites;
              // Save to new location and remove old
              localStorageService.set(STORAGE_KEY, stored);
              localStorage.removeItem(oldKey);
              console.log('Migrated favorites from old storage key');
            }
          } catch (e) {
            console.error('Error migrating old favorites:', e);
          }
        }
      }
      
      // Check if the favorites key exists in localStorage (even if empty array)
      // This distinguishes between "never initialized" vs "user removed all"
      const keyExists = localStorageService.has(STORAGE_KEY) || 
                       localStorage.getItem('ai-analyst-favorites') !== null;
      
      if (stored && Array.isArray(stored) && stored.length > 0) {
        // User has stored favorites - use them
        const loaded = stored.map((f) => ({
          ticker: f.ticker,
          addedAt: new Date(f.addedAt)
        }));
        setFavorites(loaded);
      } else if (!keyExists) {
        // First-time user - localStorage key doesn't exist yet
        // Initialize with default favorites
        const defaultFavorites: Favorite[] = [
          { ticker: 'AAPL', addedAt: new Date() },
          { ticker: 'NVDA', addedAt: new Date() },
          { ticker: 'AMZN', addedAt: new Date() },
          { ticker: 'GOOGL', addedAt: new Date() },
        ];
        setFavorites(defaultFavorites);
        // Save to localStorage immediately (this creates the key)
        const toStore: StoredFavorite[] = defaultFavorites.map(f => ({
          ticker: f.ticker,
          addedAt: f.addedAt.toISOString()
        }));
        localStorageService.set(STORAGE_KEY, toStore);
      } else {
        // Key exists but array is empty - user has manually removed all favorites
        // Respect their choice and show empty
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      localStorageService.remove(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save favorites to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof window === 'undefined') return;
    
    try {
      const toStore: StoredFavorite[] = favorites.map(f => ({
        ticker: f.ticker,
        addedAt: f.addedAt.toISOString()
      }));
      localStorageService.set(STORAGE_KEY, toStore);
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites, isLoaded]);

  const isFavorite = (ticker: string): boolean => {
    return favorites.some(f => f.ticker.toLowerCase() === ticker.toLowerCase());
  };

  const addFavorite = (ticker: string) => {
    if (!isFavorite(ticker)) {
      setFavorites(prev => [...prev, { 
        ticker: ticker.toUpperCase(), 
        addedAt: new Date() 
      }]);
    }
  };

  const removeFavorite = (ticker: string) => {
    setFavorites(prev => prev.filter(f => f.ticker.toLowerCase() !== ticker.toLowerCase()));
  };

  const toggleFavorite = (ticker: string) => {
    if (isFavorite(ticker)) {
      removeFavorite(ticker);
    } else {
      addFavorite(ticker);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const value: FavoritesContextType = {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    isLoaded
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

