import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/lib/constants/app-config';
import { getMockSearchResults } from '@/lib/utils/finnhub-mock-data';

const FINNHUB_API_KEY = APP_CONFIG.FINNHUB.API_KEY;
const FINNHUB_BASE_URL = APP_CONFIG.FINNHUB.BASE_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  // Use mock data if API key is not configured
  if (!FINNHUB_API_KEY) {
    const mockResults = getMockSearchResults(q);
    console.log(`[Mock] Returning ${mockResults.length} mock search results for "${q}"`);
    return NextResponse.json({ result: mockResults });
  }

  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(q)}&token=${FINNHUB_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Finnhub search API error:', error);
    // Fallback to mock data on API error
    const mockResults = getMockSearchResults(q);
    console.log(`[Fallback] Using ${mockResults.length} mock search results for "${q}"`);
    return NextResponse.json({ result: mockResults });
  }
}
