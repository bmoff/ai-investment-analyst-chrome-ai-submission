/**
 * User Preferences Service
 * Manages user preferences and settings using localStorage
 */

import { localStorageService } from './local-storage-service';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  sidebarCollapsed?: boolean;
  recentCompanies?: string[]; // Recent ticker searches
  defaultAgents?: string[]; // Default agents to auto-run
  notifications?: boolean;
}

const PREFERENCES_KEY = 'user-preferences';
const RECENT_COMPANIES_MAX = 10;

export class UserPreferencesService {
  private static instance: UserPreferencesService;
  private preferences: UserPreferences = {};

  private constructor() {
    this.loadPreferences();
  }

  public static getInstance(): UserPreferencesService {
    if (!UserPreferencesService.instance) {
      UserPreferencesService.instance = new UserPreferencesService();
    }
    return UserPreferencesService.instance;
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    const stored = localStorageService.get<UserPreferences>(PREFERENCES_KEY);
    this.preferences = stored || this.getDefaultPreferences();
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'dark',
      sidebarCollapsed: false,
      recentCompanies: [],
      defaultAgents: [],
      notifications: true
    };
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    localStorageService.set(PREFERENCES_KEY, this.preferences);
  }

  /**
   * Get all preferences
   */
  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  /**
   * Get a specific preference
   */
  public getPreference<K extends keyof UserPreferences>(
    key: K
  ): UserPreferences[K] {
    return this.preferences[key];
  }

  /**
   * Set a specific preference
   */
  public setPreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): void {
    this.preferences[key] = value;
    this.savePreferences();
  }

  /**
   * Update multiple preferences at once
   */
  public updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  /**
   * Add a company to recent searches
   */
  public addRecentCompany(ticker: string): void {
    const recent = this.preferences.recentCompanies || [];
    
    // Remove if already exists
    const filtered = recent.filter(t => t.toLowerCase() !== ticker.toLowerCase());
    
    // Add to front
    const updated = [ticker.toUpperCase(), ...filtered].slice(0, RECENT_COMPANIES_MAX);
    
    this.preferences.recentCompanies = updated;
    this.savePreferences();
  }

  /**
   * Get recent companies
   */
  public getRecentCompanies(): string[] {
    return this.preferences.recentCompanies || [];
  }

  /**
   * Clear recent companies
   */
  public clearRecentCompanies(): void {
    this.preferences.recentCompanies = [];
    this.savePreferences();
  }

  /**
   * Reset all preferences to defaults
   */
  public resetPreferences(): void {
    this.preferences = this.getDefaultPreferences();
    this.savePreferences();
  }
}

// Export singleton instance
export const userPreferencesService = UserPreferencesService.getInstance();

