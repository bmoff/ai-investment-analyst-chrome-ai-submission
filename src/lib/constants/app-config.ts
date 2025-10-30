/**
 * Application configuration constants
 * Centralized configuration values for the application
 */

export const APP_CONFIG = {
  NAME: 'AI Investment Analyst',
  DESCRIPTION: 'AI-powered investment analysis using Chrome Built-in AI',
  VERSION: '1.0.0',
  
  CHROME_AI: {
    ORIGIN_TRIAL_TOKEN: process.env.NEXT_PUBLIC_CHROME_AI_TOKEN || 
      'Atqb/wGDlBk1i8ORWTVZgqa0NxvigKUZiX+zF7OTUa3vwoDkuZr/L2OvCYzlDLN8RMEs3zlX+SFtmt/2KdDlrAsAAABOeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiQUlXcml0ZXJBUEkiLCJleHBpcnkiOjE3Njk0NzIwMDB9',
  },
  
  FINNHUB: {
    BASE_URL: 'https://finnhub.io/api/v1',
    API_KEY: process.env.FINNHUB_API_KEY,
  },
} as const;

