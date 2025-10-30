/**
 * Simplified Chrome AI Service - Based on official Chrome AI documentation
 * https://developer.chrome.com/docs/ai/get-started
 */

import { ChunkingService } from './chunking-service';

export interface ChromeAIAvailability {
  available: boolean;
  summarizer: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  writer: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  rewriter: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  translator: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  languageModel: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  error?: string;
}

export interface ChromeAIResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Extend the global scope to include Chrome AI APIs
declare global {
         interface Window {
           LanguageModel?: {
             availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
             create(options?: unknown): Promise<unknown>;
           };
           Writer?: {
             availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
             create(options?: unknown): Promise<unknown>;
           };
           Summarizer?: {
             availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
             create(options?: unknown): Promise<unknown>;
           };
           Proofreader?: {
             availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
             create(options?: unknown): Promise<unknown>;
           };
           Translator?: {
             availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
             create(options?: unknown): Promise<unknown>;
           };
           Rewriter?: {
             availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
             create(options?: unknown): Promise<unknown>;
           };
         }
         
         // Chrome AI APIs are available globally (not via window, but as ambient globals)
         // These are declared as ambient globals that exist at runtime
         var LanguageModel: {
           availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
           create(options?: unknown): Promise<unknown>;
         };
         var Writer: {
           availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
           create(options?: unknown): Promise<unknown>;
         };
         var Summarizer: {
           availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
           create(options?: unknown): Promise<unknown>;
         };
         var Proofreader: {
           availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
           create(options?: unknown): Promise<unknown>;
         };
         var Translator: {
           availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
           create(options?: unknown): Promise<unknown>;
         };
         var Rewriter: {
           availability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
           create(options?: unknown): Promise<unknown>;
         };
}

export class ChromeAIService {
  private static instance: ChromeAIService;

  private constructor() {
    // No initialization needed
  }

  public static getInstance(): ChromeAIService {
    if (!ChromeAIService.instance) {
      ChromeAIService.instance = new ChromeAIService();
    }
    return ChromeAIService.instance;
  }

  /**
   * Check if Chrome AI LanguageModel is available
   * Uses the global LanguageModel object as confirmed by console testing
   */
  private async checkAvailability(): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported'> {
    if (typeof window === 'undefined') {
      return 'unsupported';
    }

    try {
      // Check if LanguageModel exists globally (as confirmed by console testing)
      // Use dynamic check since these are runtime globals
      if (typeof (globalThis as unknown as { LanguageModel?: unknown }).LanguageModel === 'undefined') {
        return 'unsupported';
      }

      // Access via globalThis to avoid TypeScript errors
      const LanguageModelAPI = (globalThis as unknown as { LanguageModel: { availability: () => Promise<string> } }).LanguageModel;
      const status = await LanguageModelAPI.availability();
      return status as 'available' | 'downloadable' | 'downloading' | 'unavailable';
    } catch (error) {
      console.error('Error checking Chrome AI availability:', error);
      return 'unsupported';
    }
  }

  /**
   * Get current availability status
   * Check each API individually for accurate status
   */
  public async getAvailabilityStatus(): Promise<ChromeAIAvailability> {
    if (typeof window === 'undefined') {
      return {
        available: false,
        summarizer: 'unavailable',
        writer: 'unavailable',
        rewriter: 'unavailable',
        translator: 'unavailable',
        languageModel: 'unavailable',
        error: 'Cannot check Chrome AI availability on server side'
      };
    }

    try {
      // Check each API individually
      const [summarizerStatus, writerStatus, rewriterStatus, translatorStatus, languageModelStatus] = await Promise.allSettled([
        this.checkApiAvailability('Summarizer'),
        this.checkApiAvailability('Writer'),
        this.checkApiAvailability('Rewriter'),
        this.checkApiAvailability('Translator'),
        this.checkApiAvailability('LanguageModel')
      ]);

      const summarizer = summarizerStatus.status === 'fulfilled' ? summarizerStatus.value : 'unavailable';
      const writer = writerStatus.status === 'fulfilled' ? writerStatus.value : 'unavailable';
      const rewriter = rewriterStatus.status === 'fulfilled' ? rewriterStatus.value : 'unavailable';
      const translator = translatorStatus.status === 'fulfilled' ? translatorStatus.value : 'unavailable';
      const languageModel = languageModelStatus.status === 'fulfilled' ? languageModelStatus.value : 'unavailable';

      // Overall available if at least one API is available
      const available = summarizer === 'available' || writer === 'available' || rewriter === 'available' || translator === 'available' || languageModel === 'available';

      // Determine the main issue if not available
      let error: string | undefined;
      if (!available) {
        const unavailableCount = [summarizer, writer, rewriter, translator, languageModel].filter(status => status === 'unavailable').length;
        if (unavailableCount === 5) {
          error = 'All AI models are unavailable. This is usually due to insufficient storage space (need ~20GB free) or Chrome AI not being enabled.';
        } else {
          error = `${unavailableCount} out of 5 AI models are unavailable. This may be due to insufficient storage space or incomplete downloads.`;
        }
      }

      return {
        available,
        summarizer,
        writer,
        rewriter,
        translator,
        languageModel,
        error
      };
    } catch (error) {
      console.error('Error checking Chrome AI availability:', error);
      return {
        available: false,
        summarizer: 'unavailable',
        writer: 'unavailable',
        rewriter: 'unavailable',
        translator: 'unavailable',
        languageModel: 'unavailable',
        error: 'Failed to check Chrome AI availability. Please ensure Chrome AI is enabled in your browser settings.'
      };
    }
  }

  /**
   * Check detailed download status of all Chrome AI models
   */
  public async getDetailedDownloadStatus(): Promise<Record<string, unknown>> {
    if (typeof window === 'undefined') {
      return { error: 'Cannot check on server side' };
    }

    const status: Record<string, unknown> = {};
    
    const apis = ['Summarizer', 'Writer', 'Rewriter', 'Translator', 'LanguageModel'];
    
    for (const apiName of apis) {
      try {
        const api = (window as unknown as Record<string, unknown>)[apiName] as { availability: (options?: unknown) => Promise<string>; getDownloadStatus?: () => Promise<unknown> } | undefined;
        if (api && typeof api.availability === 'function') {
          const availability = await api.availability();
          status[apiName] = {
            available: availability,
            apiExists: true,
            hasAvailabilityMethod: true
          };
          
          // Try to get more detailed info if available
          if (api.getDownloadStatus && typeof api.getDownloadStatus === 'function') {
            try {
              const downloadStatus = await api.getDownloadStatus();
              status[apiName] = {
                ...status[apiName] as Record<string, unknown>,
                downloadStatus
              };
            } catch (e) {
              status[apiName] = {
                ...status[apiName] as Record<string, unknown>,
                downloadStatusError: (e as Error).message
              };
            }
          }
        } else {
          status[apiName] = {
            available: 'unavailable',
            apiExists: !!api,
            hasAvailabilityMethod: api && typeof api.availability === 'function'
          };
        }
        } catch (error) {
          status[apiName] = {
            error: (error as Error).message,
            available: 'error'
          };
        }
    }
    
    return status;
  }

  /**
   * Check availability of a specific Chrome AI API
   */
  private async checkApiAvailability(apiName: string): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported'> {
    try {
      const api = (window as unknown as Record<string, unknown>)[apiName] as { availability: (options?: unknown) => Promise<string> } | undefined;
      if (!api || typeof api.availability !== 'function') {
        return 'unavailable';
      }
      
      // Translator API requires a TranslatorCreateCoreOptions object
      if (apiName === 'Translator') {
        const result = await api.availability({
          sourceLanguage: 'en',
          targetLanguage: 'es'
        });
        return result as 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
      }
      
      const result = await api.availability();
      return result as 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
    } catch (error) {
      console.error(`Error checking ${apiName} availability:`, error);
      return 'unavailable';
    }
  }

  /**
   * Download a specific API model
   */
  public async downloadSpecificAPI(apiName: string): Promise<ChromeAIResult<{ status: string }>> {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: {
          code: 'SSR_ERROR',
          message: 'Cannot access Chrome AI APIs on server side'
        }
      };
    }

    try {
      const api = (window as unknown as Record<string, unknown>)[apiName] as { create: (options?: unknown) => Promise<unknown>; availability?: (options?: unknown) => Promise<string> } | undefined;
      if (!api || typeof api.create !== 'function') {
        return {
          success: false,
          error: {
            code: 'API_UNAVAILABLE',
            message: `${apiName} API is not available`
          }
        };
      }

      // Check availability first
      let availability;
      if (api?.availability) {
        if (apiName === 'Translator') {
          availability = await api.availability({
            sourceLanguage: 'en',
            targetLanguage: 'es'
          });
        } else {
          availability = await api.availability();
        }
      } else {
        availability = 'unavailable';
      }
      if (availability === 'available') {
        return {
          success: true,
          data: {
            status: `${apiName} model is already available`
          }
        };
      }

      if (availability === 'unavailable') {
        return {
          success: false,
          error: {
            code: 'API_UNAVAILABLE',
            message: `${apiName} API is not available on this device`
          }
        };
      }

      // Check user activation
      if (!navigator.userActivation?.isActive) {
        return {
          success: false,
          error: {
            code: 'USER_ACTIVATION_REQUIRED',
            message: 'User activation required to download model. Please click a button or interact with the page.'
          }
        };
      }

      // Create the API instance to trigger download
      if (apiName === 'Translator') {
        await api.create({
          sourceLanguage: 'en',
          targetLanguage: 'es'
        } as unknown);
      } else if (apiName === 'Writer') {
        await api.create({
          tone: 'neutral',
          format: 'plain-text',
          length: 'medium'
        } as unknown);
      } else {
        await api.create();
      }

      return {
        success: true,
        data: {
          status: `${apiName} model download triggered successfully`
        }
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          code: 'DOWNLOAD_ERROR',
          message: `Failed to download ${apiName} model: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      };
    }
  }

         /**
          * Trigger model download by calling LanguageModel.create()
          * Requires user activation (click, tap, key press)
          */
         public async triggerModelDownload(): Promise<ChromeAIResult<{ status: string }>> {
           if (typeof window === 'undefined') {
             return {
               success: false,
               error: {
                 code: 'SSR_ERROR',
                 message: 'Cannot access Chrome AI APIs on server side'
               }
             };
           }

           try {
             // Check if LanguageModel exists
             const LanguageModelAPI = (globalThis as unknown as { LanguageModel?: { create: (options?: unknown) => Promise<unknown> } }).LanguageModel;
             if (!LanguageModelAPI) {
               return {
                 success: false,
                 error: {
                   code: 'API_UNAVAILABLE',
                   message: 'Chrome AI LanguageModel is not available. Please enable Chrome AI flags.'
                 }
               };
             }

             // Check if user activation is required
             if (!navigator.userActivation?.isActive) {
               return {
                 success: false,
                 error: {
                   code: 'USER_ACTIVATION_REQUIRED',
                   message: 'User activation required to download model. Please click a button or interact with the page.'
                 }
               };
             }

             // Call create() to trigger model download
             await LanguageModelAPI.create();
             
             return {
               success: true,
               data: {
                 status: 'Model created successfully'
               }
             };
           } catch (error: unknown) {
             return {
               success: false,
               error: {
                 code: 'DOWNLOAD_ERROR',
                 message: error instanceof Error ? error.message : 'Failed to create model',
                 details: error
               }
             };
           }
         }

         /**
          * Trigger Writer model download specifically
          * This will download the Writer model if it's in 'downloadable' status
          */
         public async triggerWriterDownload(): Promise<ChromeAIResult<{ status: string }>> {
           if (typeof window === 'undefined') {
             return {
               success: false,
               error: {
                 code: 'SSR_ERROR',
                 message: 'Cannot access Chrome AI APIs on server side'
               }
             };
           }

           try {
             if (typeof Writer === 'undefined') {
               return {
                 success: false,
                 error: {
                   code: 'API_UNAVAILABLE',
                   message: 'Chrome AI Writer is not available'
                 }
               };
             }

             // Check availability
             const WriterAPI = (globalThis as unknown as { Writer?: { availability: () => Promise<string> } }).Writer;
             if (!WriterAPI) {
               return {
                 success: false,
                 error: {
                   code: 'API_UNAVAILABLE',
                   message: 'Chrome AI Writer is not available'
                 }
               };
             }
             const availability = await WriterAPI.availability();
             if (availability === 'unavailable') {
               return {
                 success: false,
                 error: {
                   code: 'API_UNAVAILABLE',
                   message: 'Writer API is not available on this device'
                 }
               };
             }

             if (availability === 'available') {
               return {
                 success: true,
                 data: {
                   status: 'Writer model is already available'
                 }
               };
             }

             // Check if user activation is required
             if (!navigator.userActivation?.isActive) {
               return {
                 success: false,
                 error: {
                   code: 'USER_ACTIVATION_REQUIRED',
                   message: 'User activation required to download model. Please click a button or interact with the page.'
                 }
               };
             }

             // Create writer with monitor to trigger download
             const WriterCreateAPI = (globalThis as unknown as { Writer?: { create: (options: unknown) => Promise<unknown> } }).Writer;
             if (!WriterCreateAPI) {
               return {
                 success: false,
                 error: {
                   code: 'API_UNAVAILABLE',
                   message: 'Chrome AI Writer is not available'
                 }
               };
             }
             await WriterCreateAPI.create({
               tone: 'neutral',
               format: 'plain-text',
               length: 'medium',
               monitor: (monitor: unknown) => {
                 if (monitor && typeof monitor === 'object' && 'addEventListener' in monitor) {
                   (monitor as { addEventListener: (event: string, handler: (e: unknown) => void) => void })
                     .addEventListener("downloadprogress", (e: unknown) => {
                       if (e && typeof e === 'object' && 'loaded' in e && typeof (e as { loaded: unknown }).loaded === 'number') {
                         console.log(`Writer model downloaded ${Math.round((e as { loaded: number }).loaded * 100)}%`);
                       }
                     });
                 }
               }
             } as unknown);

             return {
               success: true,
               data: {
                 status: 'Writer model download triggered successfully'
               }
             };
           } catch (error: unknown) {
             return {
               success: false,
               error: {
                 code: 'DOWNLOAD_ERROR',
                 message: error instanceof Error ? error.message : 'Failed to trigger Writer model download',
                 details: error
               }
             };
           }
         }

  /**
   * Summarize text using Chrome AI Summarizer API
   */
  public async summarizeText(text: string, options?: { language?: string; onProgress?: (message: string) => void }): Promise<ChromeAIResult<{ summary: string }>> {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: {
          code: 'SSR_ERROR',
          message: 'Cannot access Chrome AI APIs on server side'
        }
      };
    }

    try {
      if (typeof Summarizer === 'undefined') {
        return {
          success: false,
          error: {
            code: 'API_UNAVAILABLE',
            message: 'Chrome AI Summarizer is not available'
          }
        };
      }

      // Check availability
      const SummarizerAPI = (globalThis as unknown as { Summarizer?: { availability: () => Promise<string> } }).Summarizer;
      if (!SummarizerAPI) {
        return {
          success: false,
          error: {
            code: 'API_UNAVAILABLE',
            message: 'Chrome AI Summarizer is not available'
          }
        };
      }
      const availability = await SummarizerAPI.availability();
      console.log(`Chrome AI Summarizer: Availability status: ${availability}`);
      
      if (availability !== 'available') {
        console.log(`Chrome AI Summarizer: API reported as ${availability}, but attempting to use anyway...`);
        // Don't return error immediately - try to use the API anyway
        // Sometimes Chrome reports unavailable but the API still works
      }

      console.log('Starting summarization:', {
        textLength: text.length,
        chunkSize: 20000,
        willChunk: text.length > 20000
      });

      // Use chunking service for large content
      const result = await ChunkingService.processWithChunking(
        text,
        'summarizer',
        async (chunk: string) => {
          console.log('Summarizing chunk:', { chunkLength: chunk.length });
          
          const SummarizerAPI = (globalThis as unknown as { Summarizer?: { create: (options: { language: string }) => Promise<{ summarize: (text: string) => Promise<string> }> } }).Summarizer;
          if (!SummarizerAPI) {
            return { success: false, error: 'Summarizer API not available' };
          }
          const summarizer = await SummarizerAPI.create({
            language: options?.language || 'en'
          });
          const summary = await summarizer.summarize(chunk);
          console.log('Chunk summarized:', { summaryLength: summary.length });
          return { success: true, data: summary };
        },
        options?.onProgress
      );
      
      console.log('Summarization result:', { 
        success: result.success, 
        error: result.error,
        dataLength: result.data?.length 
      });

      if (result.success) {
        return {
          success: true,
          data: {
            summary: result.data!
          }
        };
      } else {
        return {
          success: false,
          error: {
            code: 'SUMMARIZE_ERROR',
            message: result.error || 'Failed to summarize text'
          }
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
               error: {
                 code: 'SUMMARIZE_ERROR',
                 message: error instanceof Error ? error.message : 'Failed to summarize text',
                 details: error
               }
      };
    }
  }

         /**
          * Generate text using Chrome AI Writer API
          */
         public async generateText(prompt: string, options?: { tone?: string; format?: string; length?: string; onProgress?: (message: string) => void }): Promise<ChromeAIResult<{ text: string }>> {
           if (typeof window === 'undefined') {
             return {
               success: false,
               error: {
                 code: 'SSR_ERROR',
                 message: 'Cannot access Chrome AI APIs on server side'
               }
             };
           }

           try {
             console.log('Chrome AI Writer: Starting text generation...');
             
             if (typeof Writer === 'undefined') {
               console.error('Chrome AI Writer: Writer API not available');
               return {
                 success: false,
                 error: {
                   code: 'API_UNAVAILABLE',
                   message: 'Chrome AI Writer is not available'
                 }
               };
             }

             // Check availability
             console.log('Chrome AI Writer: Checking availability...');
             const WriterAPI = (globalThis as unknown as { Writer?: { availability: () => Promise<string>; create: (options: unknown) => Promise<unknown> } }).Writer;
             if (!WriterAPI) {
               return {
                 success: false,
                 error: {
                   code: 'API_UNAVAILABLE',
                   message: 'Chrome AI Writer is not available'
                 }
               };
             }
             const availability = await WriterAPI.availability();
             console.log(`Chrome AI Writer: Availability status: ${availability}`);
             
             if (availability === 'unavailable') {
               console.log('Chrome AI Writer: API reported as unavailable, but attempting to use anyway...');
               // Don't return error immediately - try to use the API anyway
               // Sometimes Chrome reports unavailable but the API still works
             }

             // Create writer instance with monitor for download progress
             const writerOptions: Record<string, unknown> = {
               tone: options?.tone || 'neutral',
               format: options?.format || 'plain-text',
               length: options?.length || 'medium',
               language: 'en' // Add language to fix the warning
             };

             // If downloadable, add monitor to track download progress
             if (availability === 'downloadable') {
               console.log('Chrome AI Writer: Model is downloadable, adding progress monitor...');
               writerOptions.monitor = (monitor: unknown) => {
                 if (monitor && typeof monitor === 'object' && 'addEventListener' in monitor) {
                   (monitor as { addEventListener: (event: string, handler: (e: unknown) => void) => void })
                     .addEventListener("downloadprogress", (e: unknown) => {
                       if (e && typeof e === 'object' && 'loaded' in e && typeof (e as { loaded: unknown }).loaded === 'number') {
                         console.log(`Writer model downloaded ${Math.round((e as { loaded: number }).loaded * 100)}%`);
                       }
                     });
                 }
               };
             }

             console.log('Chrome AI Writer: Creating writer instance...');
             // Create a writer instance (for chunking, we'll create per-chunk instances)
             if (!WriterAPI) {
               return {
                 success: false,
                 error: {
                   code: 'API_UNAVAILABLE',
                   message: 'Chrome AI Writer is not available'
                 }
               };
             }
             await WriterAPI.create(writerOptions as unknown);
             console.log('Chrome AI Writer: Writer instance created, generating text...');

      // Use chunking service for large content
      const result = await ChunkingService.processWithChunking(
        prompt,
        'writer',
        async (chunk: string) => {
          const WriterAPI = (globalThis as unknown as { Writer?: { create: (options: unknown) => Promise<{ write: (prompt: string) => Promise<string> }> } }).Writer;
          if (!WriterAPI) {
            return { success: false, error: 'Writer API not available' };
          }
          const writer = await WriterAPI.create(writerOptions);
          const text = await writer.write(chunk);
          return { success: true, data: text };
        },
        options?.onProgress
      );

      if (result.success) {
        return {
          success: true,
          data: {
            text: result.data!
          }
        };
      } else {
        return {
          success: false,
          error: {
            code: 'WRITE_ERROR',
            message: result.error || 'Failed to generate text'
          }
        };
      }
           } catch (error: unknown) {
             return {
               success: false,
               error: {
                 code: 'WRITE_ERROR',
                 message: error instanceof Error ? error.message : 'Failed to generate text',
                 details: error
               }
             };
           }
         }

  /**
   * Proofread text using Chrome AI Proofreader API
   */
  public async proofreadText(text: string, options?: { language?: string; onProgress?: (message: string) => void }): Promise<ChromeAIResult<{ correctedText: string }>> {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: {
          code: 'SSR_ERROR',
          message: 'Cannot access Chrome AI APIs on server side'
        }
      };
    }

    try {
      if (typeof window.Proofreader === 'undefined') {
        return {
          success: false,
          error: {
            code: 'API_UNAVAILABLE',
            message: 'Chrome AI Proofreader is not available'
          }
        };
      }

      // Check availability
      const availability = await window.Proofreader.availability();
      if (availability !== 'available') {
        return {
          success: false,
          error: {
            code: 'API_NOT_READY',
            message: `Proofreader is ${availability}. Please wait for model to be ready.`
          }
        };
      }

      // Use chunking for large texts
      const result = await ChunkingService.processWithChunking(
        text,
        'proofreader',
        async (chunk: string) => {
          if (typeof window.Proofreader === 'undefined') {
            return { success: false, error: 'Proofreader API not available' };
          }
          const proofreader = await window.Proofreader.create({
            language: options?.language || 'en'
          }) as { proofread: (text: string) => Promise<string> };
          const correctedText = await proofreader.proofread(chunk);
          return { success: true, data: correctedText };
        },
        options?.onProgress
      );

      if (result.success && result.data) {
        return {
          success: true,
          data: {
            correctedText: result.data
          }
        };
      } else {
        return {
          success: false,
          error: {
            code: 'PROOFREAD_ERROR',
            message: result.error ?? 'Failed to proofread text'
          }
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          code: 'PROOFREAD_ERROR',
          message: error instanceof Error ? error.message : 'Failed to proofread text',
          details: error
        }
      };
    }
  }

  /**
   * Translate text using Chrome AI Translator API
   */
  public async translateText(text: string, targetLanguage: string, sourceLanguage?: string, onProgress?: (message: string) => void): Promise<ChromeAIResult<{ translatedText: string }>> {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: {
          code: 'SSR_ERROR',
          message: 'Cannot access Chrome AI APIs on server side'
        }
      };
    }

    try {
      if (typeof window.Translator === 'undefined') {
        return {
          success: false,
          error: {
            code: 'API_UNAVAILABLE',
            message: 'Chrome AI Translator is not available'
          }
        };
      }

      // Check availability
      const availability = await window.Translator.availability();
      if (availability !== 'available') {
        return {
          success: false,
          error: {
            code: 'API_NOT_READY',
            message: `Translator is ${availability}. Please wait for model to be ready.`
          }
        };
      }

      // Use chunking for large texts
      const result = await ChunkingService.processWithChunking(
        text,
        'translator',
        async (chunk: string) => {
          if (typeof window.Translator === 'undefined') {
            return { success: false, error: 'Translator API not available' };
          }
          const translator = await window.Translator.create({
            sourceLanguage: sourceLanguage || 'auto',
            targetLanguage: targetLanguage
          }) as { translate: (text: string) => Promise<string> };
          const translatedText = await translator.translate(chunk);
          return { success: true, data: translatedText };
        },
        onProgress
      );

      if (result.success && result.data) {
        return {
          success: true,
          data: {
            translatedText: result.data
          }
        };
      } else {
        return {
          success: false,
          error: {
            code: 'TRANSLATE_ERROR',
            message: result.error ?? 'Failed to translate text'
          }
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          code: 'TRANSLATE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to translate text',
          details: error
        }
      };
    }
  }

  /**
   * Rewrite text using Chrome AI Rewriter API
   */
  public async rewriteText(text: string, options?: { tone?: 'more-formal' | 'as-is' | 'more-casual'; format?: 'as-is' | 'markdown' | 'plain-text'; length?: 'shorter' | 'as-is' | 'longer'; onProgress?: (message: string) => void }): Promise<ChromeAIResult<{ rewrittenText: string }>> {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: {
          code: 'SSR_ERROR',
          message: 'Cannot access Chrome AI APIs on server side'
        }
      };
    }

    try {
      if (typeof window.Rewriter === 'undefined') {
        return {
          success: false,
          error: {
            code: 'API_UNAVAILABLE',
            message: 'Chrome AI Rewriter is not available'
          }
        };
      }

      // Check availability
      const availability = await window.Rewriter.availability();
      if (availability !== 'available') {
        return {
          success: false,
          error: {
            code: 'API_NOT_READY',
            message: `Rewriter is ${availability}. Please wait for model to be ready.`
          }
        };
      }

      // Use chunking for large texts
      const result = await ChunkingService.processWithChunking(
        text,
        'rewriter',
        async (chunk: string) => {
          if (typeof window.Rewriter === 'undefined') {
            return { success: false, error: 'Rewriter API not available' };
          }
          const rewriterOptions: Record<string, unknown> = {};
          
          // Only include tone if provided (defaults to 'as-is' if not specified)
          if (options?.tone) {
            rewriterOptions.tone = options.tone;
          }
          
          // Only include format if provided (defaults to 'as-is' if not specified)
          if (options?.format) {
            rewriterOptions.format = options.format;
          }
          
          // Only include length if provided (defaults to 'as-is' if not specified)
          if (options?.length) {
            rewriterOptions.length = options.length;
          }
          
          const rewriter = await window.Rewriter.create(rewriterOptions) as { rewrite: (text: string) => Promise<string> };
          const rewrittenText = await rewriter.rewrite(chunk);
          return { success: true, data: rewrittenText };
        },
        options?.onProgress
      );

      if (result.success && result.data) {
        return {
          success: true,
          data: {
            rewrittenText: result.data
          }
        };
      } else {
        return {
          success: false,
          error: {
            code: 'REWRITE_ERROR',
            message: result.error ?? 'Failed to rewrite text'
          }
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: {
          code: 'REWRITE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to rewrite text',
          details: error
        }
      };
    }
  }
}

// Export singleton instance
export const chromeAIService = ChromeAIService.getInstance();
