/**
 * Document types for company-specific document storage
 */

export type DocumentType = 'financial-analysis' | 'regulatory-filing' | 'market-research' | 'other';

export interface CompanyDocument {
  id: string;
  ticker: string;
  name: string;
  type: DocumentType;
  file: File;
  uploadedAt: Date | string; // Can be string after localStorage deserialization
  size: number;
  content?: string; // Parsed content for analysis
  fileData?: string; // Base64 encoded file data for reconstruction
}

export interface DocumentStorageItem {
  value: CompanyDocument;
  timestamp: number;
}

export interface DocumentListResponse {
  documents: CompanyDocument[];
  count: number;
}
