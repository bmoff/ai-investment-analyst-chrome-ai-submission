import { AgentOutput } from '@/features/analysis/agents/agents';
import { Note } from '@/lib/workspace-data/mockNotes';
import { useAnalysisStore } from '@/features/analysis/stores/analysis-store';
import { TASK_IDS, AGENT_DISPLAY_NAMES, AGENT_CATEGORIES } from '@/lib/constants/task-ids';

export function convertAgentOutputToNote(
  agentId: string,
  output: AgentOutput,
  ticker: string
): Note {
  const now = new Date().toISOString();
  
  // Create a deterministic ID based on the content hash and timestamp
  // This ensures the same note always gets the same ID
  const contentHash = output.content.slice(0, 50).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const timestamp = output.timestamp.getTime();
  
  return {
    id: `note-${agentId}-${ticker}-${timestamp}-${contentHash}`,
    title: `${ticker} - ${AGENT_DISPLAY_NAMES[agentId as keyof typeof AGENT_DISPLAY_NAMES] || agentId}`,
    content: output.content,
    sourceType: 'task',
    sourceId: agentId,
    sourceName: AGENT_DISPLAY_NAMES[agentId as keyof typeof AGENT_DISPLAY_NAMES] || agentId,
    companyTicker: ticker,
    createdAt: output.timestamp.toISOString(),
    updatedAt: now,
    tags: AGENT_CATEGORIES[agentId as keyof typeof AGENT_CATEGORIES] || ['analysis'],
  };
}

export function getNotesFromAnalysisData(ticker: string, companyName?: string): Note[] {
  const analysisStore = useAnalysisStore.getState();
  const analysisData = analysisStore.getAnalysisData(ticker);
  const notes: Note[] = [];

  console.log('getNotesFromAnalysisData called:', { ticker, agentOutputs: Object.keys(analysisData.agentOutputs) });

  // Convert overview to note if it exists
  if (analysisData.overview) {
    notes.push(convertAgentOutputToNote(TASK_IDS.COMPANY_OVERVIEW, analysisData.overview, ticker));
  }

  // Convert agent outputs to notes (excluding 'brief' which we handle separately)
  Object.entries(analysisData.agentOutputs).forEach(([agentId, output]) => {
    console.log('Processing agent output:', { agentId, hasContent: !!output.content, timestamp: output.timestamp, isBrief: agentId === TASK_IDS.BRIEF });
    if (agentId !== TASK_IDS.BRIEF) {
      const note = convertAgentOutputToNote(agentId, output, ticker);
      console.log('Created note from agent output:', { id: note.id, title: note.title, agentId });
      notes.push(note);
    } else {
      console.log('Skipping brief agent output (will be handled separately)');
    }
  });
  
  console.log('Total notes before adding brief:', notes.length);

  // Always show the brief note - create it first so it appears at the top
  const briefInStore = analysisData.agentOutputs[TASK_IDS.BRIEF];
  
  if (briefInStore) {
    // Convert the brief from the store to a note
    const briefNote = convertAgentOutputToNote(TASK_IDS.BRIEF, briefInStore, ticker);
    notes.unshift(briefNote); // Add to beginning of array
  } else {
    // Create a new brief note and save it
    const briefNote = createBriefNote(ticker, companyName);
    saveNoteToAnalysisData(briefNote);
    notes.unshift(briefNote); // Add to beginning of array
  }

  console.log('getNotesFromAnalysisData returning notes:', notes.map(n => ({ id: n.id, title: n.title, sourceId: n.sourceId })));
  return notes;
}

export function saveNoteToAnalysisData(note: Note): void {
  const analysisStore = useAnalysisStore.getState();
  
  // Convert note back to agent output format
  const agentOutput: AgentOutput = {
    content: note.content,
    timestamp: new Date(note.updatedAt),
  };

  // Save to analysis store
  if (note.sourceId === TASK_IDS.COMPANY_OVERVIEW) {
    analysisStore.saveOverview(note.companyTicker, agentOutput);
  } else {
    analysisStore.saveAgentOutput(note.companyTicker, note.sourceId, agentOutput);
  }
}

export function deleteNoteFromAnalysisData(note: Note): void {
  // Don't allow deleting the brief
  if (note.sourceId === TASK_IDS.BRIEF) {
    return;
  }

  // Remove the note from the analysis store
  const analysisStore = useAnalysisStore.getState();
  analysisStore.removeAgentOutput(note.companyTicker, note.sourceId);
}

export function createBriefNote(ticker: string, companyName?: string): Note {
  const now = new Date().toISOString();
  
  return {
    id: `brief-${ticker}`,
    title: `${companyName || ticker} - Investment Brief`,
    content: `# ${companyName || ticker} - Investment Brief

This is your investment brief. Compile your research findings, key insights, and investment thesis here.`,
    sourceType: 'task',
    sourceId: TASK_IDS.BRIEF,
    sourceName: AGENT_DISPLAY_NAMES[TASK_IDS.BRIEF],
    companyTicker: ticker,
    createdAt: now,
    updatedAt: now,
    tags: AGENT_CATEGORIES[TASK_IDS.BRIEF],
  };
}
