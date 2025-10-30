/**
 * Centralized localStorage keys for the application
 * All storage keys should be defined here to avoid hardcoding across the codebase
 */

export const STORAGE_KEYS = {
  JOBS: 'workspace-jobs',
  ANALYSIS: 'ai-investment-analyst-analysis',
  FAVORITES: 'favorites', // localStorageService adds 'ai-analyst-' prefix
  DOCUMENTS_PREFIX: 'documents-',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

