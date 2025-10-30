/**
 * Chrome AI API Test Functions
 * 
 * This module provides test functions for Chrome AI APIs.
 * These functions are used for testing and debugging Chrome AI functionality.
 */

import { chromeAIService } from '@/features/analysis/services/chrome-ai-service-simple';

// Check if Chrome AI APIs are available
export async function isChromeAIAvailable(): Promise<boolean> {
  const availability = await chromeAIService.getAvailabilityStatus();
  return availability.available;
}

// Test Summarizer API
export async function testSummarizerAPI(text: string): Promise<string | null> {
  const result = await chromeAIService.summarizeText(text, { language: 'en' });
  
  return result.success ? result.data?.summary || null : null;
}

// Test Writer API
export async function testWriterAPI(prompt: string): Promise<string | null> {
  const result = await chromeAIService.generateText(prompt, {
    tone: 'professional',
    format: 'paragraph',
    length: 'medium'
  });
  
  return result.success ? result.data?.text || null : null;
}

// Test all Chrome AI APIs
export async function testAllChromeAIAPIs() {
  const availability = await chromeAIService.getAvailabilityStatus();
  
  const results = {
    overallAvailability: availability,
    tests: {
      summarizer: null as string | null,
      writer: null as string | null,
    }
  };

  // Test Summarizer if available
  if (availability.summarizer === 'available') {
    try {
      results.tests.summarizer = await testSummarizerAPI("This is a test text to summarize. It contains multiple sentences to test the summarization functionality.");
    } catch (error) {
      console.error('Summarizer test failed:', error);
    }
  }

  // Test Writer if available
  if (availability.writer === 'available') {
    try {
      results.tests.writer = await testWriterAPI("Write a brief summary of artificial intelligence in finance.");
    } catch (error) {
      console.error('Writer test failed:', error);
    }
  }

  return results;
}