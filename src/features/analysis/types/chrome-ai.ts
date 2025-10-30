/**
 * TypeScript interfaces for Chrome AI APIs
 * Based on Chrome Built-in AI API specifications
 */

// Base Chrome AI API availability
export interface ChromeAIAvailability {
  available: boolean;
  summarizer: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  writer: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  rewriter: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  translator: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  languageModel: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
}

// Summarizer API interfaces
export interface SummarizerOptions {
  maxLength?: number;
  format?: 'paragraph' | 'bullet' | 'numbered';
  style?: 'concise' | 'detailed' | 'analytical';
}

export interface SummarizerRequest {
  text: string;
  options?: SummarizerOptions;
}

export interface SummarizerResponse {
  summary: string;
  originalLength: number;
  summaryLength: number;
}

// Writer API interfaces
export interface WriterOptions {
  maxLength?: number;
  format?: 'paragraph' | 'bullet' | 'numbered';
  style?: 'professional' | 'casual' | 'academic' | 'creative';
  tone?: 'analytical' | 'optimistic' | 'neutral' | 'critical';
}

export interface WriterRequest {
  prompt: string;
  options?: WriterOptions;
}

export interface WriterResponse {
  content: string;
  wordCount: number;
  style: string;
  tone: string;
}

// Rewriter API interfaces
export interface RewriterOptions {
  style?: 'professional' | 'casual' | 'academic' | 'creative';
  tone?: 'analytical' | 'optimistic' | 'neutral' | 'critical';
  preserveLength?: boolean;
  preserveFormatting?: boolean;
}

export interface RewriterRequest {
  text: string;
  options?: RewriterOptions;
}

export interface RewriterResponse {
  rewrittenText: string;
  originalLength: number;
  rewrittenLength: number;
  changes: string[];
}

// Translator API interfaces
export interface TranslatorRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslatorResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

// Language Detector API interfaces
export interface LanguageDetectorRequest {
  text: string;
}

export interface LanguageDetectorResponse {
  language: string;
  confidence: number;
  alternatives: Array<{
    language: string;
    confidence: number;
  }>;
}

// Error handling interfaces
export interface ChromeAIError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ChromeAIResult<T> {
  success: boolean;
  data?: T;
  error?: ChromeAIError;
}

// API test results
export interface APITestResult {
  apiName: string;
  available: boolean;
  responseTime?: number;
  error?: string;
  sampleResponse?: unknown;
}

export interface ComprehensiveTestResult {
  overallAvailable: boolean;
  tests: APITestResult[];
  timestamp: Date;
  userAgent: string;
  chromeVersion?: string;
}
