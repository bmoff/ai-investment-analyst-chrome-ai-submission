/**
 * Centralized chunking service for handling different Chrome AI API token limits
 * Each API has different limits, so we chunk accordingly
 */

export interface ChunkingOptions {
  maxTokens: number;
  chunkSize: number; // Characters per chunk (conservative estimate)
  overlapSize?: number; // Characters to overlap between chunks
}

export interface ChunkingResult {
  success: boolean;
  data?: string;
  error?: string;
}

// Token limits for each Chrome AI API (based on real-world testing)
// Chrome AI Summarizer has a much lower token limit than documented
export const API_TOKEN_LIMITS = {
  summarizer: { maxTokens: 2500, chunkSize: 8000, overlapSize: 400 },      // ~2,000 tokens per chunk (conservative after testing)
  writer: { maxTokens: 9000, chunkSize: 30000, overlapSize: 1000 },        // ~7,500 tokens per chunk (83% capacity)
  languageModel: { maxTokens: 9216, chunkSize: 30000, overlapSize: 1000 }, // ~7,500 tokens per chunk (81% capacity)
  proofreader: { maxTokens: 9000, chunkSize: 30000, overlapSize: 1000 },   // ~7,500 tokens per chunk (83% capacity)
  translator: { maxTokens: 9000, chunkSize: 30000, overlapSize: 1000 },    // ~7,500 tokens per chunk (83% capacity)
  rewriter: { maxTokens: 9000, chunkSize: 30000, overlapSize: 1000 }       // ~7,500 tokens per chunk (83% capacity)
} as const;

export type APIKey = keyof typeof API_TOKEN_LIMITS;

export class ChunkingService {
  /**
   * Check if content needs chunking for a specific API
   */
  public static needsChunking(content: string, apiKey: APIKey): boolean {
    const options = API_TOKEN_LIMITS[apiKey];
    return content.length > options.chunkSize;
  }

  /**
   * Split content into chunks for a specific API
   */
  public static createChunks(content: string, apiKey: APIKey): string[] {
    const options = API_TOKEN_LIMITS[apiKey];
    const chunks: string[] = [];
    
    console.log('Creating chunks:', {
      contentLength: content.length,
      chunkSize: options.chunkSize,
      overlapSize: options.overlapSize,
      increment: options.chunkSize - (options.overlapSize || 0)
    });
    
    for (let i = 0; i < content.length; i += options.chunkSize - (options.overlapSize || 0)) {
      const chunk = content.slice(i, i + options.chunkSize);
      if (chunk.trim().length > 0) {
        chunks.push(chunk);
      }
    }
    
    console.log('Created chunks:', {
      count: chunks.length,
      firstChunkLength: chunks[0]?.length,
      lastChunkLength: chunks[chunks.length - 1]?.length
    });
    
    return chunks;
  }

  /**
   * Process content through an API with automatic chunking
   */
  public static async processWithChunking<T>(
    content: string,
    apiKey: APIKey,
    apiFunction: (chunk: string) => Promise<{ success: boolean; data?: T; error?: string }>,
    onProgress?: (message: string) => void
  ): Promise<ChunkingResult> {
    try {
      // Check if chunking is needed
      if (!this.needsChunking(content, apiKey)) {
        onProgress?.('Processing document...');
        const result = await apiFunction(content);
        
        if (result.success) {
          return { success: true, data: result.data as string };
        } else {
          return { success: false, error: result.error || 'API call failed' };
        }
      }

      // Create chunks
      const chunks = this.createChunks(content, apiKey);
      console.log('Processing with chunking:', {
        apiKey,
        contentLength: content.length,
        chunksCount: chunks.length,
        needsChunking: this.needsChunking(content, apiKey)
      });
      onProgress?.(`Processing large document in ${chunks.length} sections...`);

      const results: string[] = [];

      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        onProgress?.(`Processing section ${i + 1} of ${chunks.length}...`);
        
        const chunkResult = await apiFunction(chunks[i]);
        
        if (chunkResult.success && chunkResult.data) {
          results.push(chunkResult.data as string);
        } else {
          console.warn(`Failed to process chunk ${i + 1}, skipping...`);
        }
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (results.length === 0) {
        return { success: false, error: 'All chunks failed to process' };
      }

      // Combine results
      onProgress?.('Combining results...');
      const combinedResult = results.join('\n\n');

      // If combined result is still too long, process it again
      if (this.needsChunking(combinedResult, apiKey)) {
        onProgress?.('Finalizing results...');
        const finalResult = await apiFunction(combinedResult);
        
        if (finalResult.success) {
          return { success: true, data: finalResult.data as string };
        } else {
          // Return combined result even if final processing fails
          return { success: true, data: combinedResult };
        }
      }

      return { success: true, data: combinedResult };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Chunking processing failed'
      };
    }
  }

  /**
   * Get chunking options for a specific API
   */
  public static getOptions(apiKey: APIKey): ChunkingOptions {
    return API_TOKEN_LIMITS[apiKey];
  }
}
