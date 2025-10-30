import { Note } from '@/lib/workspace-data/mockNotes';
import { getNotesFromAnalysisData } from '@/features/analysis/services/notes-service';
import { TASK_IDS } from '@/lib/constants/task-ids';

/**
 * Generate a comprehensive investment brief using all research notes
 */
export async function generateInvestmentBrief(
  ticker: string, 
  companyName?: string, 
  allNotes?: Note[]
): Promise<string> {
  try {
    // Get all research notes (excluding the brief itself)
    const notes = allNotes || getNotesFromAnalysisData(ticker, companyName);
    const researchNotes = notes.filter(note => note.sourceId !== TASK_IDS.BRIEF);
    
    if (researchNotes.length === 0) {
      return `# ${companyName || ticker} - Investment Brief

## Executive Summary
No research notes available yet. Run analysis tasks to generate research insights.

## Next Steps
1. Run company overview analysis
2. Generate elevator pitch
3. Analyze bull and bear cases
4. Review key debates
5. Prepare for meetings

This brief will be automatically updated as you complete research tasks.`;
    }

    // Extract key information from each note
    const noteSummaries = researchNotes.map(note => {
      return `### ${note.title}
**Source:** ${note.sourceName}
**Analysis Type:** ${note.tags.join(', ')}

${note.content}

---`;
    }).join('\n\n');

    // Generate comprehensive brief
    const brief = `# ${companyName || ticker} - Investment Brief

## Executive Summary
This investment brief synthesizes insights from ${researchNotes.length} research analyses conducted on ${companyName || ticker}. The analysis covers multiple dimensions of the investment thesis, including company fundamentals, market positioning, and key investment considerations.

## Key Research Areas Covered
${researchNotes.map(note => `- **${note.sourceName}**: ${note.tags.join(', ')}`).join('\n')}

## Detailed Analysis

${noteSummaries}

## Investment Thesis Summary
Based on the comprehensive analysis above, the investment thesis for ${companyName || ticker} should consider:

### Strengths
- [To be filled based on research findings]

### Risks & Concerns  
- [To be filled based on research findings]

### Key Catalysts
- [To be filled based on research findings]

## Recommendation
[Investment recommendation to be determined based on complete analysis]

---
*This brief was automatically generated from ${researchNotes.length} research notes. Last updated: ${new Date().toLocaleDateString()}*`;

    return brief;
  } catch (error) {
    console.error('Failed to generate investment brief:', error);
    throw new Error('Failed to generate investment brief. Please try again.');
  }
}

/**
 * Generate a brief using Chrome AI if available
 */
export async function generateBriefWithAI(
  ticker: string,
  companyName?: string,
  allNotes?: Note[]
): Promise<string> {
  try {
    // Try to use Chrome AI service
    const { chromeAIService } = await import('@/features/analysis/services/chrome-ai-service-simple');
    
    const notes = allNotes || getNotesFromAnalysisData(ticker, companyName);
    const researchNotes = notes.filter(note => note.sourceId !== TASK_IDS.BRIEF);
    
    if (researchNotes.length === 0) {
      return generateInvestmentBrief(ticker, companyName, allNotes);
    }

    // Combine all research notes into a single text
    const combinedContent = researchNotes.map(note => 
      `## ${note.title}\n**Source:** ${note.sourceName}\n**Type:** ${note.tags.join(', ')}\n\n${note.content}`
    ).join('\n\n---\n\n');

    const prompt = `You are an expert investment analyst. Create a comprehensive investment brief for ${companyName || ticker} based on the following research notes. 

The brief should include:
1. Executive Summary
2. Key Investment Highlights
3. Strengths and Opportunities
4. Risks and Concerns
5. Investment Recommendation
6. Next Steps

Format the output in markdown with clear headings and bullet points. Be professional and concise.

Research Notes:
${combinedContent}`;

    const result = await chromeAIService.generateText(prompt);
    return result.data?.text || generateInvestmentBrief(ticker, companyName, allNotes);
  } catch (error) {
    console.error('Chrome AI brief generation failed:', error);
    // Fallback to basic generation
    return generateInvestmentBrief(ticker, companyName, allNotes);
  }
}
