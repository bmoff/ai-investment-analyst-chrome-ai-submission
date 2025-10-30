export interface Company {
  ticker: string;
  name: string;
  sector: string;
  isFavorite?: boolean;
}

export const mockCompanies: Company[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', isFavorite: true },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', isFavorite: true },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', isFavorite: true },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', isFavorite: true },
];

export const getFavoriteCompanies = () => mockCompanies.filter(c => c.isFavorite);

export const getCompanyByTicker = (ticker: string) => 
  mockCompanies.find(c => c.ticker.toLowerCase() === ticker.toLowerCase());
