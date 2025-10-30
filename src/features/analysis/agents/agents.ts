import { chromeAIService } from '../services/chrome-ai-service-simple';
import { FileParser } from '@/lib/utils/file-parser';
import { TASK_IDS } from '@/lib/constants/task-ids';

export interface AgentOutput {
  content: string;
  timestamp: Date;
}

export async function runEarningsCallAnalysis(ticker: string, file: File, onProgress?: (stage: string, progress?: { current: number; total: number; stage: string }) => void): Promise<AgentOutput> {
  // Check if Chrome AI is available
  const status = await chromeAIService.getAvailabilityStatus();
  
  if (!status.available) {
    return {
      content: `# Earnings Call Analysis\n\nChrome AI is not available. Please enable Chrome Built-in AI to see real analysis.`,
      timestamp: new Date()
    };
  }

  try {
    console.log(`Starting earnings call analysis for ${ticker}...`);
    const startTime = Date.now();
    
    // Step 1: Parse the uploaded file
    onProgress?.('Reading document...');
    const parseResult = await FileParser.parseFile(file);
    if (!parseResult.success) {
      return {
        content: `# Earnings Call Analysis\n\nError parsing file: ${parseResult.error.message}`,
        timestamp: new Date()
      };
    }

    const parsedFile = parseResult.data;
    console.log(`File parsed successfully: ${parsedFile.wordCount} words, ${parsedFile.characterCount} characters`);

    // Step 2: Summarize the earnings call transcript (with automatic chunking)
    onProgress?.('Summarizing document...');
    const summaryResult = await chromeAIService.summarizeText(parsedFile.content, { 
      language: 'en',
      onProgress: (message) => {
        console.log('Summarizer progress message:', message);
        // Parse chunking progress from message
        const chunkMatch = message.match(/Processing section (\d+) of (\d+)/);
        if (chunkMatch) {
          const current = parseInt(chunkMatch[1]);
          const total = parseInt(chunkMatch[2]);
          console.log('Parsed summarizer chunking progress:', { current, total });
          onProgress?.(message, { current, total, stage: 'Summarizing document sections' });
        } else {
          console.log('Regular summarizer progress message:', message);
          onProgress?.(message);
        }
      }
    });
    
    if (!summaryResult.success) {
      const errorMessage = summaryResult.error?.message || 'Unknown error';
      const errorCode = summaryResult.error?.code || 'UNKNOWN';
      
      console.error('Summarization failed:', {
        code: errorCode,
        message: errorMessage,
        contentLength: parsedFile.content.length,
        wordCount: parsedFile.wordCount
      });
      
      // Handle specific error cases
      if (errorMessage.includes('too large') || errorMessage.includes('input is too large')) {
        return {
          content: `Error: Document too large for analysis\n\nThe earnings call transcript is too long for Chrome AI to process.\n\n**Debug Info:**\n- Content length: ${parsedFile.content.length} characters\n- Word count: ${parsedFile.wordCount} words\n- Error: ${errorMessage}\n\n**Solution:** Try using a shorter excerpt or summary of the transcript.`,
          timestamp: new Date()
        };
      }
      
      return {
        content: `Error: ${errorMessage}\n\n**Debug Info:**\n- Error Code: ${errorCode}\n- Content length: ${parsedFile.content.length} characters\n- Word count: ${parsedFile.wordCount} words`,
        timestamp: new Date()
      };
    }
    
    const summary = summaryResult.data?.summary || '';

    console.log('Earnings call summarized successfully');

    // Step 3: Generate structured analysis using Writer API
    onProgress?.('Generating analysis...');
    const analysisPrompt = `You are an AI investment analyst helping financial professionals analyze earnings call transcripts. 

Analyze the following earnings call transcript for ${ticker} and provide a structured investment analysis.

**Transcript Summary:**
${summary}

**Instructions:**
Generate a comprehensive earnings call analysis with the following structure:

## Key Management Commentary
- Extract 3-4 most important statements from management
- Focus on strategic initiatives, market outlook, and operational updates
- Include direct quotes where relevant

## Financial Highlights vs Expectations
- Revenue performance vs previous guidance/expectations
- Profitability metrics and margin trends
- Cash flow generation and capital allocation
- Key financial ratios and operational metrics

## Forward Guidance Analysis
- Management's forward-looking statements
- Revenue and profit guidance for next quarter/year
- Capital expenditure plans and investment priorities
- Market expansion and growth strategies

## Risk Factors & Concerns
- Management-identified risks and challenges
- Market headwinds and competitive threats
- Regulatory or operational concerns mentioned
- Areas of uncertainty or caution

## Key Quotes
- 3-5 most impactful direct quotes from management
- Include speaker name and context where available

**Format Requirements:**
- Use British English throughout
- Write in a professional, analytical tone
- Avoid AI-isms and overly formal language
- Focus on investment-relevant insights
- Keep each section concise but comprehensive

**Context:** This is for investment research purposes and will be used by financial professionals to make investment decisions.`;

    const analysisResult = await chromeAIService.generateText(analysisPrompt, {
      tone: 'formal',
      format: 'plain-text',
      length: 'long',
      onProgress: (message) => {
        // Parse chunking progress from message
        const chunkMatch = message.match(/Processing section (\d+) of (\d+)/);
        if (chunkMatch) {
          const current = parseInt(chunkMatch[1]);
          const total = parseInt(chunkMatch[2]);
          onProgress?.(message, { current, total, stage: 'Generating analysis sections' });
        } else {
          onProgress?.(message);
        }
      }
    });

    if (!analysisResult.success) {
      const errorMessage = analysisResult.error?.message || 'Unknown error';
      return {
        content: `Error: ${errorMessage}`,
        timestamp: new Date()
      };
    }

    let analysis = analysisResult.data?.text || '';

    // Step 4: Proofread the analysis for British English and professional tone
    onProgress?.('Proofreading analysis...');
    const proofreadResult = await chromeAIService.proofreadText(analysis, { 
      language: 'en',
      onProgress: (message) => {
        // Parse chunking progress from message
        const chunkMatch = message.match(/Processing section (\d+) of (\d+)/);
        if (chunkMatch) {
          const current = parseInt(chunkMatch[1]);
          const total = parseInt(chunkMatch[2]);
          onProgress?.(message, { current, total, stage: 'Proofreading analysis sections' });
        } else {
          onProgress?.(message);
        }
      }
    });
    if (proofreadResult.success && proofreadResult.data?.correctedText) {
      analysis = proofreadResult.data.correctedText;
      console.log('Analysis proofread successfully');
    }

    const duration = Date.now() - startTime;
    console.log(`Earnings call analysis completed in ${duration}ms`);

    return {
      content: analysis,
      timestamp: new Date()
    };

  } catch (error) {
    console.error(`Error running earnings call analysis:`, error);
    return {
      content: `Error: Unable to analyze earnings call transcript for ${ticker}. Please check your Chrome AI configuration and try again.`,
      timestamp: new Date()
    };
  }
}


export async function runAgent(agentId: string, ticker: string, onProgress?: (stage: string, progress?: { current: number; total: number; stage: string }) => void): Promise<AgentOutput> {
  // Check if Chrome AI is available
  const status = await chromeAIService.getAvailabilityStatus();
  
  if (!status.available) {
    return {
      content: `# ${agentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n\nChrome AI is not available. Please enable Chrome Built-in AI to see real analysis.`,
      timestamp: new Date()
    };
  }

  const prompts: Record<string, string> = {
    [TASK_IDS.COMPANY_OVERVIEW]: `You are an AI investment analyst helping financial professionals analyze public companies. Provide a comprehensive company overview for ${ticker} (the stock ticker symbol). Include: what the company does, their business model, main products/services, target markets, and key business segments. This is for investment research purposes.`,
    [TASK_IDS.ELEVATOR_PITCH]: `You are an AI investment analyst helping financial professionals. Create a compelling 30-second elevator pitch for ${ticker} (the stock ticker symbol). Focus on: what they do, their competitive advantage, market position, and why this company matters to investors. This is for investment research and client presentations.`,
    [TASK_IDS.BULL_BEAR_CASE]: `Role: I want you to act as a professional equity research analyst.

The company/ticker is **${ticker}**.

Instructions:

Generate a structured investment report summarising the bull/bear cases for the company structural fundamentals and investment opportunity.

Consider the most compelling, relevant and impactful positive points, negative points, opportunities, risks, uncertainties, questions, reasons to be cautious, bull and bear hypotheses and arguments

Flag the most relevant factors to the company, which could cover but is not limited to: the structural fundamentals of the company, position and business model, product, differentiation, competitive advantages, brand, cost-advantage, scale or network effects, technology disruption, management, unit economics, cohort and user acquisition/quality, pricing power and elasticity, moat durability and erosion, bargaining power, regulation, and durable drivers.

Consider both short-term (next 2 years) and long-term (2-10 years) factors and catalysts; consider the view of different investor styles (growth, quality, value, contrarian, short-term hedge funds, long-term thematic long-only and short sellers) and surface the most important determinants and topics.

Points should focus on specific key mechanisms (core drivers), not symptoms.

Rules:

Cover the following numbered topics and sub-sections in full with the instructed format - no skipping.

Write concisely with a professional tone suitable for an internal investment memo - focusing on what matters most for investors.

Make sure the analysis reflects the most recent information available (2025) by searching the web and citing sources.

Follow the writing format framework PEES (Point, Evidence, Explain, Signals).

No preamble, methodology, or framework statements.

"Bull Case" - discuss/summarise the most positive bullish views, evidence and hypotheses on the stock (6-10 numbered headlines with 2-4 explanation sentences).

"Bear Case" - discuss/summarise the most negative bearish views, evidence and hypotheses on the stock (6-10 numbered headlines with 2-4 explanation sentences).

Summary (central investment factors and determinants).

Summary of the 3 central factors that matter for the stock and will determine the investment outcome (Numbered list with a bold question and explanation on the next line).`,
    [TASK_IDS.KEY_DEBATES]: `Role: I want you to act as a professional equity research analyst.

The company/ticker is **${ticker}**.

Instructions:

Generate a structured investment report summarising the key debates, bull/bear cases and key determinants for the company structural fundamentals and investment opportunity.

Consider the most compelling, relevant and impactful positive points, negative points, opportunities, risks, uncertainties, questions, reasons to be cautious, bull and bear hypotheses and arguments

Flag the most relevant factors to the company, which could cover but is not limited to: the structural fundamentals of the company, position and business model, product, differentiation, competitive advantages, brand, cost-advantage, scale or network effects, technology disruption, management, unit economics, cohort and user acquisition/quality, pricing power and elasticity, moat durability and erosion, bargaining power, regulation, and durable drivers.

Consider both short-term (next 2 years) and long-term (2-10 years) factors and catalysts; consider the view of different investor styles (growth, quality, value, contrarian, short-term hedge funds, long-term thematic long-only and short sellers) and surface the most important determinants and topics.

Points should focus on specific key mechanisms (core drivers), not symptoms.

Rules:

Cover the following numbered topics and sub-sections in full with the instructed format - no skipping.

Write concisely with a professional tone suitable for an internal investment memo - focusing on what matters most for investors.

Make sure the analysis reflects the most recent information available (2025) by searching the web and citing sources.

Follow the writing format framework PEES (Point, Evidence, Explain, Signals).

No preamble, methodology, or framework statements.

"Core Debates" - discuss/summarise the most relevant and impactful debates on the stock (6-10 numbered headlines, with bullet points of 2-3 sentences of the "Bull" view, 2-3 sentences of the "Bear" view and 2-3 sentences summarising and flagging any "Key signals" (evidence, catalysts and watch-points - data points, events, dates).

"Other Relevant Key Topics" - list any other relevant and impactful key topics, opportunities, risks, questions and uncertainties not mentioned above (3-5 bullet points of bold label followed immediately by 2-3 sentences)

"Potentially Overlooked but Material Debates" - Most relevant topics, determinants of success, debates, questions/uncertainties and under-appreciated long-tail risks that are potentially overlooked (positive or negative). 3-5 points; headline statement short sentence in bold and explanation / supporting detail of 1-2 sentences.

"Short-term (0-2 years)" - specifically on the near-term (next 24 months) views/topics not mentioned above. 3-5 bullet point sentences.

"Long-term (2-10 years)" - Long-term (2-10 years) hypotheses and likely scenario paths. 3-5 bullet point sentences. 3-5 positive points; headline statement short sentence in bold and explanation / supporting detail of 1-2 sentences followed by 3-5 negatives/risks; headline statement short sentence in bold and explanation / supporting detail of 1-2 sentences.

"Key debates" summary (central investment debates and questions)

Summary of the 3 central questions that will determine the investment outcome (Numbered list with a bold question and explanation on the next line).`,
    [TASK_IDS.MEETING_PREP]: `You are an AI investment analyst helping financial professionals prepare for investor meetings. Prepare a pre-meeting briefing for ${ticker} (the stock ticker symbol). Include recent developments, key metrics to watch, important questions to ask management, and areas of focus for the discussion. This is for investment research and meeting preparation.`,
  };

  const prompt = prompts[agentId] || `Analyze ${ticker}`;

  try {
    console.log(`Starting ${agentId} analysis for ${ticker}...`);
    const startTime = Date.now();
    
    // Use the actual Chrome AI Writer API with progress callback
    onProgress?.('Generating analysis...');
    const result = await chromeAIService.generateText(prompt, {
      tone: 'formal',
      format: 'plain-text',
      length: 'medium',
      onProgress: (message) => {
        console.log('Chrome AI progress message:', message);
        // Parse chunking progress from message
        const chunkMatch = message.match(/Processing section (\d+) of (\d+)/);
        if (chunkMatch) {
          const current = parseInt(chunkMatch[1]);
          const total = parseInt(chunkMatch[2]);
          console.log('Parsed chunking progress:', { current, total });
          onProgress?.(message, { current, total, stage: 'Processing document sections' });
        } else {
          console.log('Regular progress message:', message);
          onProgress?.(message);
        }
      }
    });

    const duration = Date.now() - startTime;
    console.log(`${agentId} completed in ${duration}ms`);

    if (result.success && result.data) {
      return {
        content: result.data.text || 'Analysis completed successfully.',
        timestamp: new Date()
      };
    } else {
      console.error(`Chrome AI error for ${agentId}:`, result.error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Unable to generate analysis. ';
      if (result.error?.message?.includes('storage') || result.error?.message?.includes('space')) {
        errorMessage += 'Insufficient storage space (need ~20GB free). Please free up disk space and try again.';
      } else if (result.error?.message?.includes('unavailable')) {
        errorMessage += 'Chrome AI models are not available. Please enable Chrome AI in your browser settings and ensure you have sufficient storage space.';
      } else if (result.error?.message?.includes('download')) {
        errorMessage += 'Chrome AI models are downloading. Please wait for the download to complete and try again.';
      } else {
        errorMessage += 'Please check your Chrome AI configuration and ensure Chrome AI is properly enabled.';
      }
      
      return {
        content: `# ${agentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n\n**Error:** ${errorMessage}\n\n**Quick Fix:**\n1. Ensure you have ~20GB free storage\n2. Enable Chrome AI in Chrome settings\n3. Restart Chrome after enabling\n4. Wait for models to download`,
        timestamp: new Date()
      };
    }
  } catch (error) {
    console.error(`Error running agent ${agentId}:`, error);
    
    return {
      content: `# ${agentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n\n**Error:** Failed to run analysis. This may be due to Chrome AI configuration issues.\n\n**Quick Fix:**\n1. Ensure you have ~20GB free storage\n2. Enable Chrome AI in Chrome settings\n3. Restart Chrome after enabling\n4. Check Chrome AI status in the top-right corner`,
      timestamp: new Date()
    };
  }
}
