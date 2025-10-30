/**
 * Stock Data Validation Service
 * 
 * Validates ticker symbols and provides real-time stock data validation
 * Uses Finnhub API with proper error handling and rate limiting
 */

import { getFinnhubCompanyData, searchFinnhubCompanies } from './finnhub-service';

export interface StockValidationResult {
  isValid: boolean;
  ticker: string;
  companyName?: string;
  error?: string;
  data?: {
    symbol: string;
    name: string;
    price?: number;
    change?: number;
    changePercent?: number;
  };
}

export interface StockValidationOptions {
  timeout?: number;
  retries?: number;
}

export class StockValidationService {
  private static instance: StockValidationService;
  private validationCache = new Map<string, { result: StockValidationResult; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): StockValidationService {
    if (!StockValidationService.instance) {
      StockValidationService.instance = new StockValidationService();
    }
    return StockValidationService.instance;
  }

  /**
   * Validate a ticker symbol and return company information
   */
  public async validateTicker(
    ticker: string
  ): Promise<StockValidationResult> {
    const normalizedTicker = ticker.trim().toUpperCase();
    
    // Check cache first
    const cached = this.validationCache.get(normalizedTicker);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }

    // Basic validation
    if (!this.isValidTickerFormat(normalizedTicker)) {
      const result: StockValidationResult = {
        isValid: false,
        ticker: normalizedTicker,
        error: 'Invalid ticker format. Use 1-5 uppercase letters.'
      };
      this.cacheResult(normalizedTicker, result);
      return result;
    }

    try {
      // Try to get company data from Finnhub
      const companyData = await getFinnhubCompanyData(normalizedTicker);
      
      if (companyData?.profile) {
        const result: StockValidationResult = {
          isValid: true,
          ticker: normalizedTicker,
          companyName: companyData.profile.name,
          data: {
            symbol: companyData.profile.ticker,
            name: companyData.profile.name,
            price: companyData.quote?.c || 0,
            change: companyData.quote?.d || 0,
            changePercent: companyData.quote?.dp || 0
          }
        };
        this.cacheResult(normalizedTicker, result);
        return result;
      } else {
        const result: StockValidationResult = {
          isValid: false,
          ticker: normalizedTicker,
          error: 'Company not found. Please check the ticker symbol.'
        };
        this.cacheResult(normalizedTicker, result);
        return result;
      }
    } catch (error) {
      console.error('Stock validation error:', error);
      const result: StockValidationResult = {
        isValid: false,
        ticker: normalizedTicker,
        error: 'Unable to validate ticker. Please try again.'
      };
      this.cacheResult(normalizedTicker, result);
      return result;
    }
  }

  /**
   * Validate multiple tickers in batch
   */
  public async validateTickers(
    tickers: string[]
  ): Promise<StockValidationResult[]> {
    const promises = tickers.map(ticker => this.validateTicker(ticker));
    return Promise.all(promises);
  }

  /**
   * Check if ticker format is valid (1-5 uppercase letters)
   */
  private isValidTickerFormat(ticker: string): boolean {
    return /^[A-Z]{1,5}$/.test(ticker);
  }

  /**
   * Cache validation result
   */
  private cacheResult(ticker: string, result: StockValidationResult): void {
    this.validationCache.set(ticker, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Clear validation cache
   */
  public clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Search for companies by name or symbol
   */
  public async searchCompanies(query: string): Promise<StockValidationResult[]> {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 2) {
      return [];
    }

    try {
      const searchResults = await searchFinnhubCompanies(trimmedQuery);
      
      return searchResults.map(result => ({
        isValid: true,
        ticker: result.symbol,
        companyName: result.description,
        data: {
          symbol: result.symbol,
          name: result.description,
          price: 0,
          change: 0,
          changePercent: 0
        }
      }));
    } catch (error) {
      console.error('Company search error:', error);
      return [];
    }
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.validationCache.size,
      entries: Array.from(this.validationCache.keys())
    };
  }
}

// Export singleton instance
export const stockValidationService = StockValidationService.getInstance();
