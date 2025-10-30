import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants/app-config';
import { getMockCompanyProfile } from '@/lib/utils/finnhub-mock-data';

const FINNHUB_API_KEY = APP_CONFIG.FINNHUB.API_KEY;
const FINNHUB_BASE_URL = APP_CONFIG.FINNHUB.BASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  // Use mock data if API key is not configured
  if (!FINNHUB_API_KEY) {
    const mockData = getMockCompanyProfile(symbol);
    if (mockData) {
      console.log(`[Mock] Returning mock company profile for ${symbol}`);
      return NextResponse.json(mockData);
    }
    return NextResponse.json(
      { error: 'Company not found in mock data. Please configure FINNHUB_API_KEY for full access.' },
      { status: 404 }
    );
  }

  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Finnhub company API error:', error);
    // Fallback to mock data on API error
    const mockData = getMockCompanyProfile(symbol);
    if (mockData) {
      console.log(`[Fallback] Using mock company profile for ${symbol}`);
      return NextResponse.json(mockData);
    }
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    );
  }
}
