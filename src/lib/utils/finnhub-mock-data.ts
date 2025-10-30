/**
 * Mock Finnhub API responses for demo/fallback mode
 * Used when FINNHUB_API_KEY is not configured
 */

export interface MockCompanyProfile {
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

export interface MockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface MockSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

// Mock company profiles
const mockProfiles: Record<string, MockCompanyProfile> = {
  AAPL: {
    country: 'US',
    currency: 'USD',
    exchange: 'NASDAQ',
    ipo: '1980-12-12',
    marketCapitalization: 3000000000000,
    name: 'Apple Inc.',
    phone: '14089961010',
    shareOutstanding: 15321870000,
    ticker: 'AAPL',
    weburl: 'https://www.apple.com',
    logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
    finnhubIndustry: 'Technology'
  },
  TSLA: {
    country: 'US',
    currency: 'USD',
    exchange: 'NASDAQ',
    ipo: '2010-06-29',
    marketCapitalization: 800000000000,
    name: 'Tesla Inc.',
    phone: '16506800000',
    shareOutstanding: 3187200000,
    ticker: 'TSLA',
    weburl: 'https://www.tesla.com',
    logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
    finnhubIndustry: 'Automotive'
  },
  MSFT: {
    country: 'US',
    currency: 'USD',
    exchange: 'NASDAQ',
    ipo: '1986-03-13',
    marketCapitalization: 2800000000000,
    name: 'Microsoft Corporation',
    phone: '14258828080',
    shareOutstanding: 7440000000,
    ticker: 'MSFT',
    weburl: 'https://www.microsoft.com',
    logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
    finnhubIndustry: 'Technology'
  },
  GOOGL: {
    country: 'US',
    currency: 'USD',
    exchange: 'NASDAQ',
    ipo: '2004-08-19',
    marketCapitalization: 1900000000000,
    name: 'Alphabet Inc.',
    phone: '16502530000',
    shareOutstanding: 12344000000,
    ticker: 'GOOGL',
    weburl: 'https://www.abc.xyz',
    logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
    finnhubIndustry: 'Technology'
  },
  AMZN: {
    country: 'US',
    currency: 'USD',
    exchange: 'NASDAQ',
    ipo: '1997-05-15',
    marketCapitalization: 1500000000000,
    name: 'Amazon.com Inc.',
    phone: '12062661000',
    shareOutstanding: 10500000000,
    ticker: 'AMZN',
    weburl: 'https://www.amazon.com',
    logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
    finnhubIndustry: 'Consumer Cyclical'
  },
  NVDA: {
    country: 'US',
    currency: 'USD',
    exchange: 'NASDAQ',
    ipo: '1999-01-22',
    marketCapitalization: 1200000000000,
    name: 'NVIDIA Corporation',
    phone: '14086800000',
    shareOutstanding: 2460000000,
    ticker: 'NVDA',
    weburl: 'https://www.nvidia.com',
    logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
    finnhubIndustry: 'Technology'
  },
  META: {
    country: 'US',
    currency: 'USD',
    exchange: 'NASDAQ',
    ipo: '2012-05-18',
    marketCapitalization: 900000000000,
    name: 'Meta Platforms Inc.',
    phone: '16505433000',
    shareOutstanding: 2587000000,
    ticker: 'META',
    weburl: 'https://www.meta.com',
    logo: 'https://static.finnhub.io/logo/87cb30d8-80df-11ea-8951-00000000092a.png',
    finnhubIndustry: 'Technology'
  }
};

// Mock quotes (realistic prices with some variation)
function generateMockQuote(symbol: string): MockQuote {
  const basePrices: Record<string, number> = {
    AAPL: 175.50,
    TSLA: 245.80,
    MSFT: 378.20,
    GOOGL: 142.50,
    AMZN: 145.30,
    NVDA: 485.60,
    META: 355.40
  };

  const basePrice = basePrices[symbol] || 100.00;
  const change = (Math.random() - 0.5) * 5; // Random change between -2.5 and +2.5
  const currentPrice = basePrice + change;
  const percentChange = (change / basePrice) * 100;
  const high = currentPrice + Math.random() * 3;
  const low = currentPrice - Math.random() * 3;

  return {
    c: Math.round(currentPrice * 100) / 100,
    d: Math.round(change * 100) / 100,
    dp: Math.round(percentChange * 100) / 100,
    h: Math.round(high * 100) / 100,
    l: Math.round(low * 100) / 100,
    o: Math.round((basePrice + (Math.random() - 0.5) * 2) * 100) / 100,
    pc: basePrice,
    t: Math.floor(Date.now() / 1000)
  };
}

// Mock search results
const mockSearchResults: Record<string, MockSearchResult[]> = {
  'apple': [
    {
      description: 'Apple Inc',
      displaySymbol: 'AAPL',
      symbol: 'AAPL',
      type: 'Common Stock'
    }
  ],
  'tesla': [
    {
      description: 'Tesla Inc',
      displaySymbol: 'TSLA',
      symbol: 'TSLA',
      type: 'Common Stock'
    }
  ],
  'microsoft': [
    {
      description: 'Microsoft Corporation',
      displaySymbol: 'MSFT',
      symbol: 'MSFT',
      type: 'Common Stock'
    }
  ],
  'google': [
    {
      description: 'Alphabet Inc',
      displaySymbol: 'GOOGL',
      symbol: 'GOOGL',
      type: 'Common Stock'
    }
  ],
  'amazon': [
    {
      description: 'Amazon.com Inc',
      displaySymbol: 'AMZN',
      symbol: 'AMZN',
      type: 'Common Stock'
    }
  ],
  'nvidia': [
    {
      description: 'NVIDIA Corporation',
      displaySymbol: 'NVDA',
      symbol: 'NVDA',
      type: 'Common Stock'
    }
  ],
  'meta': [
    {
      description: 'Meta Platforms Inc',
      displaySymbol: 'META',
      symbol: 'META',
      type: 'Common Stock'
    }
  ]
};

/**
 * Get mock company profile
 */
export function getMockCompanyProfile(symbol: string): MockCompanyProfile | null {
  const upperSymbol = symbol.toUpperCase();
  return mockProfiles[upperSymbol] || null;
}

/**
 * Get mock quote
 */
export function getMockQuote(symbol: string): MockQuote | null {
  const upperSymbol = symbol.toUpperCase();
  if (mockProfiles[upperSymbol]) {
    return generateMockQuote(upperSymbol);
  }
  return null;
}

/**
 * Get mock search results
 */
export function getMockSearchResults(query: string): MockSearchResult[] {
  const lowerQuery = query.toLowerCase();
  
  // Exact match
  if (mockSearchResults[lowerQuery]) {
    return mockSearchResults[lowerQuery];
  }

  // Partial match
  const results: MockSearchResult[] = [];
  for (const [key, value] of Object.entries(mockSearchResults)) {
    if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
      results.push(...value);
    }
  }

  // Also check if query matches any ticker symbol
  for (const [symbol, profile] of Object.entries(mockProfiles)) {
    if (symbol.toLowerCase().includes(lowerQuery) || 
        profile.name.toLowerCase().includes(lowerQuery)) {
      results.push({
        description: profile.name,
        displaySymbol: symbol,
        symbol: symbol,
        type: 'Common Stock'
      });
    }
  }

  // Remove duplicates
  const unique = results.filter((item, index, self) =>
    index === self.findIndex(t => t.symbol === item.symbol)
  );

  return unique.slice(0, 10);
}

