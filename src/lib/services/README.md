# Stock Data Services Architecture

## Overview
Clean, single-purpose services for stock data integration using Finnhub API.

## Services

### 1. `finnhub-service.ts`
**Purpose**: Direct Finnhub API integration
- `getFinnhubCompanyProfile(symbol)` - Get company profile
- `getFinnhubQuote(symbol)` - Get real-time quote
- `searchFinnhubCompanies(query)` - Search companies by name/symbol
- `getFinnhubCompanyData(symbol)` - Get both profile + quote

**Features**:
- Rate limiting (60 calls/minute)
- Error handling
- No fallback data (fails cleanly)

### 2. `stock-validation-service.ts`
**Purpose**: Validation wrapper for UI components
- `validateTicker(symbol)` - Validate ticker and get company info
- `searchCompanies(query)` - Search with UI-friendly results
- Caching (5 minutes)
- No fallback data (fails cleanly)

## Usage

### Homepage Search
```typescript
import { stockValidationService } from '@/lib/services/stock-validation-service';

// Search for companies
const results = await stockValidationService.searchCompanies('Apple');

// Validate ticker
const validation = await stockValidationService.validateTicker('AAPL');
```

### Direct API Access
```typescript
import { getFinnhubCompanyData } from '@/lib/services/finnhub-service';

// Get company data
const data = await getFinnhubCompanyData('AAPL');
```

## No Duplication
- Single source of truth: Finnhub API
- No Alpha Vantage remnants
- No demo/fallback data
- Clean error handling
