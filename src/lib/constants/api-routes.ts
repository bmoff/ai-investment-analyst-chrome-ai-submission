/**
 * Centralized API route paths
 * All API routes should be defined here for consistency and type safety
 */

export const API_ROUTES = {
  FINNHUB: {
    BASE: '/api/finnhub',
    QUOTE: '/api/finnhub/quote',
    COMPANY: '/api/finnhub/company',
    SEARCH: '/api/finnhub/search',
  },
  PDF: {
    BASE: '/api/pdf',
    CLEAN: '/api/pdf/clean',
  },
  WORKFLOWS: {
    BASE: '/api/workflows',
  },
  AGENTS: {
    BASE: '/api/agents',
  },
} as const;

