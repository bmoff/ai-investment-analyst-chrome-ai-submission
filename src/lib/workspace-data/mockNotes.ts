export interface Note {
  id: string;
  title: string;
  content: string; // markdown content
  sourceType: 'task';
  sourceId: string; // ID of the Task that created it
  sourceName: string; // Name of the Task
  companyTicker: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

// Mock data removed - workspace now uses only Chrome AI generated content
