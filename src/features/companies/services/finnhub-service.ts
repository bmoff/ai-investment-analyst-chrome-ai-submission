/**
 * Finnhub Stock Data API Integration
 * 
 * This service provides comprehensive stock data using Finnhub API
 * Free tier: 60 calls/minute (much better than Alpha Vantage's 5/minute)
 */

// API Configuration - Using internal API routes for security
const FINNHUB_BASE_URL = '/api/finnhub';

// Rate limiting
let lastCall = 0;
const RATE_LIMIT = 1000; // 60 calls per minute = 1 second between calls

export interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

// Rate limiting helper
function canMakeCall(): boolean {
  return Date.now() - lastCall >= RATE_LIMIT;
}

// Wait for rate limit if needed
async function waitForRateLimit(): Promise<void> {
  if (!canMakeCall()) {
    const waitTime = RATE_LIMIT - (Date.now() - lastCall);
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Get company profile by ticker symbol
 */
export async function getFinnhubCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile | null> {

  await waitForRateLimit();

  try {
    lastCall = Date.now();
    const response = await fetch(
      `${FINNHUB_BASE_URL}/company?symbol=${symbol}`
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Check if we got valid data
    if (!data.ticker || !data.name) {
      return null;
    }

    return {
      country: data.country || '',
      currency: data.currency || 'USD',
      exchange: data.exchange || '',
      ipo: data.ipo || '',
      marketCapitalization: data.marketCapitalization || 0,
      name: data.name || '',
      phone: data.phone || '',
      shareOutstanding: data.shareOutstanding || 0,
      ticker: data.ticker || symbol,
      weburl: data.weburl || '',
      logo: data.logo || '',
      finnhubIndustry: data.finnhubIndustry || ''
    };
  } catch (error) {
    console.error('Finnhub API error:', error);
    return null;
  }
}

/**
 * Get real-time quote by ticker symbol
 */
export async function getFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {

  await waitForRateLimit();

  try {
    lastCall = Date.now();
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}`
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Check if we got valid data
    if (data.c === undefined || data.c === null) {
      return null;
    }

    return {
      c: data.c || 0,
      d: data.d || 0,
      dp: data.dp || 0,
      h: data.h || 0,
      l: data.l || 0,
      o: data.o || 0,
      pc: data.pc || 0,
      t: data.t || 0
    };
  } catch (error) {
    console.error('Finnhub API error:', error);
    return null;
  }
}

/**
 * Search for companies by name or symbol
 */
export async function searchFinnhubCompanies(query: string): Promise<FinnhubSearchResult[]> {

  await waitForRateLimit();

  try {
    lastCall = Date.now();
    const response = await fetch(
      `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Return the search results, limiting to first 10
    return (data.result || []).slice(0, 10).map((item: unknown) => {
      const searchItem = item as { description?: string; displaySymbol?: string; symbol?: string; type?: string };
      return {
        description: searchItem.description || '',
        displaySymbol: searchItem.displaySymbol || '',
        symbol: searchItem.symbol || '',
        type: searchItem.type || ''
      };
    });
  } catch (error) {
    console.error('Finnhub search API error:', error);
    return [];
  }
}

/**
 * Get comprehensive company data (profile + quote)
 */
export async function getFinnhubCompanyData(symbol: string): Promise<{
  profile: FinnhubCompanyProfile | null;
  quote: FinnhubQuote | null;
} | null> {
  try {
    const [profile, quote] = await Promise.all([
      getFinnhubCompanyProfile(symbol),
      getFinnhubQuote(symbol)
    ]);

    return { profile, quote };
  } catch (error) {
    console.error('Error fetching Finnhub company data:', error);
    return null;
  }
}

