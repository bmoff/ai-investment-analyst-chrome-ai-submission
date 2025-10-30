/**
 * Document Storage Service
 * Manages company-specific document storage using localStorage
 */

import { localStorageService } from '@/lib/services/local-storage-service';
import type { CompanyDocument, DocumentType, DocumentListResponse } from '../types/document';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';

const DOCUMENT_PREFIX = STORAGE_KEYS.DOCUMENTS_PREFIX;

export class DocumentStorageService {
  private static instance: DocumentStorageService;

  private constructor() {}

  public static getInstance(): DocumentStorageService {
    if (!DocumentStorageService.instance) {
      DocumentStorageService.instance = new DocumentStorageService();
    }
    return DocumentStorageService.instance;
  }

  /**
   * Store a document for a specific company
   */
  public async storeDocument(ticker: string, file: File, type: DocumentType = 'other'): Promise<CompanyDocument | null> {
    try {
      const documentId = this.generateDocumentId();
      
      // Convert File to base64 for storage
      const fileData = await this.fileToBase64(file);
      
      const document: CompanyDocument = {
        id: documentId,
        ticker: ticker.toUpperCase(),
        name: file.name,
        type,
        file, // Keep original file for immediate use
        uploadedAt: new Date(),
        size: file.size,
        fileData // Store base64 data for reconstruction
      };

      const key = `${DOCUMENT_PREFIX}${ticker.toUpperCase()}-${documentId}`;
      const success = localStorageService.set(key, document);
      
      if (success) {
        return document;
      }
      return null;
    } catch (error) {
      console.error('Error storing document:', error);
      return null;
    }
  }

  /**
   * Get all documents for a specific company
   */
  public getCompanyDocuments(ticker: string): DocumentListResponse {
    try {
      const keys = localStorageService.keys();
      const companyKey = `${DOCUMENT_PREFIX}${ticker.toUpperCase()}-`;
      
      const documentKeys = keys.filter(key => key.startsWith(companyKey));
      const documents: CompanyDocument[] = [];

      for (const key of documentKeys) {
        const document = localStorageService.get<CompanyDocument>(key);
        if (document) {
          // Convert date string back to Date object (localStorage serializes dates as strings)
          if (document.uploadedAt && typeof document.uploadedAt === 'string') {
            document.uploadedAt = new Date(document.uploadedAt);
          }
          
          // Check if document needs migration (has file but no fileData)
          if (document.file && !document.fileData && document.name) {
            console.log('Migrating document to include fileData:', document.name);
            this.migrateDocument(key, document);
          }
          documents.push(document);
        }
      }

      // Sort by upload date (newest first)
      documents.sort((a, b) => {
        const dateA = a.uploadedAt instanceof Date ? a.uploadedAt : new Date(a.uploadedAt);
        const dateB = b.uploadedAt instanceof Date ? b.uploadedAt : new Date(b.uploadedAt);
        return dateB.getTime() - dateA.getTime();
      });

      return {
        documents,
        count: documents.length
      };
    } catch (error) {
      console.error('Error getting company documents:', error);
      return { documents: [], count: 0 };
    }
  }

  /**
   * Get a specific document
   */
  public getDocument(ticker: string, documentId: string): CompanyDocument | null {
    try {
      const key = `${DOCUMENT_PREFIX}${ticker.toUpperCase()}-${documentId}`;
      return localStorageService.get<CompanyDocument>(key);
    } catch (error) {
      console.error('Error getting document:', error);
      return null;
    }
  }

  /**
   * Delete a document
   */
  public deleteDocument(ticker: string, documentId: string): boolean {
    try {
      const key = `${DOCUMENT_PREFIX}${ticker.toUpperCase()}-${documentId}`;
      localStorageService.remove(key);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Get document count for a company
   */
  public getDocumentCount(ticker: string): number {
    const response = this.getCompanyDocuments(ticker);
    return response.count;
  }

  /**
   * Convert File to base64 string
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to convert file to base64'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert base64 string back to File object
   */
  private base64ToFile(base64: string, filename: string, mimeType: string): File {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
  }

  /**
   * Reconstruct File object from stored document
   */
  public reconstructFile(document: CompanyDocument): File | null {
    console.log('Reconstructing file from document:', { 
      hasFile: !!document.file, 
      fileName: document.file?.name, 
      hasFileData: !!document.fileData,
      documentName: document.name 
    });
    
    // Check if file is still valid (has name property)
    if (document.file && document.file.name && typeof document.file.name === 'string') {
      // File is still valid
      console.log('Using existing file:', document.file.name);
      return document.file;
    }
    
    if (document.fileData) {
      // Reconstruct from base64
      console.log('Reconstructing from base64 data');
      const mimeType = this.getMimeTypeFromFilename(document.name);
      const reconstructedFile = this.base64ToFile(document.fileData, document.name, mimeType);
      console.log('Reconstructed file:', { name: reconstructedFile.name, size: reconstructedFile.size, type: reconstructedFile.type });
      return reconstructedFile;
    }
    
    // If we have a file object but it's corrupted, try to create a new one with the document name
    if (document.file && document.name) {
      console.log('File object exists but corrupted, creating new file with document name');
      const mimeType = this.getMimeTypeFromFilename(document.name);
      
      // Try to create a new File object with the stored name and size
      try {
        const newFile = new File([document.file], document.name, { 
          type: mimeType,
          lastModified: document.uploadedAt instanceof Date ? document.uploadedAt.getTime() : Date.now()
        });
        console.log('Created new file:', { name: newFile.name, size: newFile.size, type: newFile.type });
        return newFile;
      } catch (error) {
        console.error('Failed to create new file from corrupted file:', error);
        // If that fails, create a minimal file with just the name
        const minimalFile = new File([''], document.name, { type: mimeType });
        console.log('Created minimal file:', { name: minimalFile.name, size: minimalFile.size, type: minimalFile.type });
        return minimalFile;
      }
    }
    
    console.error('Cannot reconstruct file - no valid file, fileData, or document name');
    return null;
  }

  /**
   * Get MIME type from filename
   */
  private getMimeTypeFromFilename(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'txt': return 'text/plain';
      case 'pdf': return 'application/pdf';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default: return 'application/octet-stream';
    }
  }

  /**
   * Migrate a document to include fileData
   */
  private async migrateDocument(key: string, document: CompanyDocument): Promise<void> {
    try {
      // If file is corrupted, we can't migrate it
      if (!document.file || !document.file.name) {
        console.warn('Cannot migrate document - file is corrupted:', document.name);
        return;
      }

      const fileData = await this.fileToBase64(document.file);
      const updatedDocument = { ...document, fileData };
      
      localStorageService.set(key, updatedDocument);
      console.log('Document migrated successfully:', document.name);
    } catch (error) {
      console.error('Failed to migrate document:', document.name, error);
    }
  }

  /**
   * Clear all documents for a company
   */
  public clearCompanyDocuments(ticker: string): boolean {
    try {
      const keys = localStorageService.keys();
      const companyKey = `${DOCUMENT_PREFIX}${ticker.toUpperCase()}-`;
      
      const documentKeys = keys.filter(key => key.startsWith(companyKey));
      
      for (const key of documentKeys) {
        localStorageService.remove(key);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing company documents:', error);
      return false;
    }
  }

  /**
   * Generate a unique document ID
   */
  private generateDocumentId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get document type from file name (for auto-suggestions)
   */
  public static getDocumentTypeFromFileName(fileName: string): DocumentType {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('earnings') || lowerName.includes('transcript') || lowerName.includes('financial') || lowerName.includes('presentation')) {
      return 'financial-analysis';
    }
    
    if (lowerName.includes('sec') || lowerName.includes('filing') || lowerName.includes('10-k') || lowerName.includes('10-q') || lowerName.includes('regulatory')) {
      return 'regulatory-filing';
    }
    
    if (lowerName.includes('research') || lowerName.includes('analysis') || lowerName.includes('report') || lowerName.includes('market')) {
      return 'market-research';
    }
    
    return 'other';
  }

  /**
   * Format file size for display
   */
  public static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format date for display
   */
  public static formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Export singleton instance
export const documentStorageService = DocumentStorageService.getInstance();
