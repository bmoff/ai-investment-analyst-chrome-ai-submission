// app/api/pdf/clean/route.ts
export const runtime = 'nodejs';
import 'server-only';
import PDFParser from 'pdf2json';

/**
 * Clean extracted PDF text to remove noise and preserve meaningful content
 * Optimized for earnings call transcripts and financial documents
 */
function cleanPdfText(text: string): string {
  if (!text || text.length === 0) return '';
  
  const originalLength = text.length;
  let cleaned = text;
  
  // 1. Remove URLs and email addresses
  cleaned = cleaned
    .replace(/https?:\/\/[^\s]+/gi, '')
    .replace(/www\.[^\s]+/gi, '')
    .replace(/[\w.-]+@[\w.-]+\.[a-z]{2,}/gi, '');
  
  // 2. Remove common PDF metadata and copyright notices
  cleaned = cleaned
    .replace(/©\s*\d{4}.*?(?:\.|$)/gi, '')
    .replace(/Copyright\s+©?\s*\d{4}.*?(?:\.|$)/gi, '')
    .replace(/All rights reserved\.?/gi, '')
    .replace(/Proprietary and Confidential\.?/gi, '');
  
  // 3. Remove timestamps and dates (unless part of transcript context)
  cleaned = cleaned
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\b/g, '')
    .replace(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi, '')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '')
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '');
  
  // 4. Remove page numbers and navigation
  cleaned = cleaned
    .replace(/\bPage\s+\d+\s+of\s+\d+\b/gi, '')
    .replace(/\b\d+\s+of\s+\d+\b/g, '')
    .replace(/^\s*\d+\s*$/gm, '') // Standalone page numbers
    .replace(/\[\s*\d+\s*\]/g, ''); // [1], [2], etc.
  
  // 5. Identify and remove repeated headers/footers
  const lines = cleaned.split('\n');
  const lineFrequency = new Map<string, number>();
  
  // Count occurrences of each line
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.length > 15 && trimmed.length < 150) { // Headers/footers are typically short-medium length
      lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1);
    }
  });
  
  // Identify likely headers/footers (appear more than 2 times)
  const likelyHeadersFooters = new Set<string>();
  lineFrequency.forEach((count, line) => {
    if (count > 2) {
      // Additional checks to avoid removing legitimate repeated content
      const isLikelyMetadata = 
        /^[A-Z\s&]{5,}$/i.test(line) || // All caps text
        /(?:transcript|earnings|call|quarter|conference|investor|relations)/i.test(line) ||
        /^Q\d+\s+\d{4}$/i.test(line) || // Q1 2024, etc.
        /Motley Fool|Seeking Alpha|Yahoo Finance/i.test(line);
      
      if (isLikelyMetadata) {
        likelyHeadersFooters.add(line);
      }
    }
  });
  
  // Filter out identified headers/footers
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    return trimmed.length === 0 || !likelyHeadersFooters.has(trimmed);
  });
  
  cleaned = filteredLines.join('\n');
  
  // 6. Remove excessive whitespace while preserving paragraph structure
  cleaned = cleaned
    .replace(/[ \t]+/g, ' ')           // Multiple spaces to single space
    .replace(/\n\s*\n\s*\n+/g, '\n\n') // Multiple line breaks to max 2
    .replace(/^\s+|\s+$/gm, '')        // Trim each line
    .trim();
  
  // 7. Remove common financial document artifacts
  cleaned = cleaned
    .replace(/\bFINANCIAL\s+INFORMATION\b/gi, '')
    .replace(/\bSAFE\s+HARBOR\s+STATEMENT\b/gi, '')
    .replace(/\bFORWARD-?LOOKING\s+STATEMENTS?\b/gi, '')
    .replace(/\bNON-GAAP\s+DISCLOSURE\b/gi, '');
  
  // 8. Final cleanup: remove any remaining isolated single characters or numbers
  cleaned = cleaned
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      // Keep lines that are substantial or are speaker indicators
      return trimmed.length > 3 || /^[A-Z][a-z]+:/.test(trimmed);
    })
    .join('\n')
    .trim();
  
  const finalLength = cleaned.length;
  const reduction = ((originalLength - finalLength) / originalLength * 100).toFixed(1);
  
  console.log('PDF text cleaning:', {
    originalLength,
    finalLength,
    reduction: `${reduction}%`,
    headersFootersRemoved: likelyHeadersFooters.size
  });
  
  return cleaned;
}

export async function POST(req: Request) {
  try {
    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || typeof file === "string") {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await (file as File).arrayBuffer());
    
    if (!buffer.length) {
      return Response.json({ error: "Empty file" }, { status: 400 });
    }

    console.log('Processing PDF:', { size: buffer.length, name: file.name });

    // Extract text using pdf2json (Node.js native, no workers needed)
    const pdfParser = new PDFParser();
    
    // Parse PDF and extract text
    const rawText = await new Promise<string>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: Error | { parserError: Error }) => {
        const errorMessage = errData instanceof Error ? errData.message : errData.parserError.message;
        console.error('PDF parsing error from pdf2json:', errorMessage);
        reject(new Error(errorMessage));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        console.log('PDF data ready, extracting text...');
        console.log('PDF has pages:', pdfData?.Pages?.length || 0);
        
        // Try getRawTextContent() first
        let text = pdfParser.getRawTextContent();
        console.log('getRawTextContent() result length:', text?.length || 0);
        
        // If getRawTextContent() returns empty, manually extract from pdfData
        if (!text || text.trim().length === 0) {
          console.log('getRawTextContent() empty, extracting manually from pdfData...');
          
          if (pdfData?.Pages && Array.isArray(pdfData.Pages)) {
            const extractedText: string[] = [];
            
            pdfData.Pages.forEach((page: { Texts?: Array<{ R?: Array<{ T?: string }> }> }, pageNum: number) => {
              console.log(`Processing page ${pageNum + 1}, has ${page.Texts?.length || 0} text elements`);
              
              if (page.Texts && Array.isArray(page.Texts)) {
                page.Texts.forEach((textItem: { R?: Array<{ T?: string }> }) => {
                  if (textItem.R && Array.isArray(textItem.R)) {
                    textItem.R.forEach((run: { T?: string }) => {
                      if (run.T) {
                        // Decode URI-encoded text
                        const decodedText = decodeURIComponent(run.T);
                        extractedText.push(decodedText);
                      }
                    });
                  }
                });
              }
            });
            
            text = extractedText.join(' ');
            console.log('Manually extracted text length:', text.length);
          }
        }
        
        resolve(text);
      });
      
      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    });
    
    // Apply intelligent cleaning
    const fullText = cleanPdfText(rawText);
    
    // Get page count from parsed data
    const pageCount = (pdfParser as { data?: { Pages?: unknown[] } }).data?.Pages?.length || 0;
    
    console.log('PDF parsed successfully:', {
      pages: pageCount,
      rawTextLength: rawText.length,
      cleanedTextLength: fullText.length
    });

    return Response.json({
      meta: {
        pages: pageCount,
        cleaned: true,
        originalLength: rawText.length,
        cleanedLength: fullText.length,
      },
      pages: [fullText],
      fullText,
    });
  } catch (e: unknown) {
    console.error('PDF processing error:', e);
    const errorMessage = e instanceof Error ? e.message : "Failed to process PDF";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}