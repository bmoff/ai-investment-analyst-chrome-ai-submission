/**
 * File parsing utilities for handling different document formats
 * Supports PDF, TXT, and DOCX files for earnings call transcripts
 */

export interface ParsedFile {
  content: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  wordCount: number;
  characterCount: number;
}

export interface FileParseError {
  code: string;
  message: string;
  details?: unknown;
}

export class FileParser {
  /**
   * Parse a file and extract text content
   */
  public static async parseFile(file: File): Promise<{ success: true; data: ParsedFile } | { success: false; error: FileParseError }> {
    try {
      // Validate file first
      if (!file || !file.name) {
        console.error('File parsing error: Invalid file provided', { file, fileName: file?.name });
        return {
          success: false,
          error: {
            code: 'INVALID_FILE',
            message: 'Invalid file provided'
          }
        };
      }

      console.log('Parsing file:', { name: file.name, size: file.size, type: file.type });

      const fileType = this.getFileType(file);
      let content: string;

      switch (fileType) {
        case 'text/plain':
          content = await this.parseTextFile(file);
          break;
        case 'application/pdf':
          content = await this.parsePdfFile(file);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          content = await this.parseDocxFile(file);
          break;
        default:
          return {
            success: false,
            error: {
              code: 'UNSUPPORTED_FILE_TYPE',
              message: `Unsupported file type: ${fileType}`
            }
          };
      }

      const wordCount = this.countWords(content);
      const characterCount = content.length;

      return {
        success: true,
        data: {
          content,
          fileName: file.name,
          fileSize: file.size,
          fileType,
          wordCount,
          characterCount
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to parse file',
          details: error
        }
      };
    }
  }

  /**
   * Get MIME type of the file
   */
  private static getFileType(file: File): string {
    if (!file || !file.name) {
      return 'application/octet-stream';
    }
    return file.type || this.getFileTypeFromExtension(file.name);
  }

  /**
   * Get MIME type from file extension
   */
  private static getFileTypeFromExtension(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return 'application/octet-stream';
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'txt':
        return 'text/plain';
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Parse plain text file
   */
  private static async parseTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          resolve(content);
        } else {
          reject(new Error('Failed to read text file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading text file'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Parse PDF file using server-side PDF.js processing
   * Sends the PDF to /api/pdf/clean endpoint for proper parsing
   */
  private static async parsePdfFile(file: File): Promise<string> {
    try {
      // Create form data with the PDF file
      const formData = new FormData();
      formData.append('file', file);

      // Send to server-side PDF processing endpoint
      const response = await fetch('/api/pdf/clean', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse PDF' }));
        throw new Error(errorData.error || `PDF processing failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.fullText) {
        throw new Error('No text content extracted from PDF');
      }

      return result.fullText;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to parse PDF: ${error.message}` 
          : 'Failed to parse PDF file'
      );
    }
  }


  /**
   * Parse DOCX file
   * Note: This is a simplified implementation. For production, consider using a library like mammoth
   */
  private static async parseDocxFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            reject(new Error('Failed to read DOCX file'));
            return;
          }

          // For now, we'll use a simple approach that works with basic DOCX files
          // In a production environment, you'd want to use mammoth.js or similar
          const uint8Array = new Uint8Array(arrayBuffer);
          const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
          
          // Extract text content from DOCX (this is a simplified approach)
          const textContent = this.extractTextFromDocxBuffer(text);
          resolve(textContent);
        } catch {
          reject(new Error('Failed to parse DOCX content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading DOCX file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Extract text from DOCX buffer (simplified implementation)
   */
  private static extractTextFromDocxBuffer(buffer: string): string {
    // This is a very basic DOCX text extraction
    // For production, use a proper DOCX parsing library like mammoth.js
    const textMatches = buffer.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (textMatches) {
      return textMatches
        .map(match => {
          const textContent = match.match(/<w:t[^>]*>(.*?)<\/w:t>/);
          return textContent ? textContent[1] : '';
        })
        .join(' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }
    
    // Fallback: try to extract any readable text
    return buffer
      .replace(/[^\x20-\x7E\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Count words in text
   */
  private static countWords(text: string): number {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  /**
   * Validate file before parsing
   */
  public static validateFile(file: File, maxSizeMB: number = 25, allowedTypes: string[] = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeMB}MB`
      };
    }

    // Check file type
    const fileType = this.getFileType(file);
    if (!allowedTypes.includes(fileType)) {
      return {
        valid: false,
        error: `File type must be one of: ${allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }
}
