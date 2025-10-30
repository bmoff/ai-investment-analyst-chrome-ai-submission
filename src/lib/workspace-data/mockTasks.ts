export interface TaskParameter {
  name: string;
  type: 'text' | 'number' | 'select' | 'date' | 'multiselect';
  options?: string[];
  defaultValue?: string | number;
  required?: boolean;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  category: 'screening' | 'analysis' | 'research' | 'monitoring';
  icon: string;
  parameters: TaskParameter[];
  estimatedTime: string;
  exampleOutput?: string;
}

export const mockTasks: Task[] = [
  {
    id: 'elevator-pitch',
    name: 'Elevator Pitch',
    description: '30-second company summary',
    category: 'screening',
    icon: 'Zap',
    estimatedTime: '30s',
    exampleOutput: `Apple Inc. is a technology leader that designs and manufactures consumer electronics, software, and services. The company's ecosystem of iPhone, Mac, iPad, and Services creates strong customer loyalty and recurring revenue streams.`,
    parameters: [],
  },
  {
    id: 'bull-bear-case',
    name: 'Bull and Bear Case',
    description: 'Comprehensive investment analysis with bull and bear scenarios',
    category: 'analysis',
    icon: 'TrendingUp',
    estimatedTime: '2-3 min',
    exampleOutput: `## Bull Case
1. Strong ecosystem lock-in drives customer retention
2. Services revenue growth at 23.5% of total revenue
3. AI investments positioning for next growth phase

## Bear Case
1. iPhone revenue growth slowing in mature markets
2. Increased competition in services segment
3. Regulatory headwinds in key markets`,
    parameters: [],
  },
  {
    id: 'key-debates',
    name: 'Key Debates',
    description: 'Core investment debates and questions',
    category: 'analysis',
    icon: 'MessageSquare',
    estimatedTime: '2-3 min',
    exampleOutput: `## Core Debates
1. **AI Strategy Impact**: Will Apple's AI investments drive meaningful revenue growth?
2. **Services Growth**: Can services maintain 20%+ growth as base expands?
3. **China Recovery**: How quickly will iPhone sales recover in China?`,
    parameters: [],
  },
  {
    id: 'meeting-prep',
    name: 'Meeting Prep',
    description: 'Pre-meeting briefing',
    category: 'monitoring',
    icon: 'Calendar',
    estimatedTime: '1-2 min',
    exampleOutput: `## Key Topics to Discuss
• Recent earnings performance and guidance
• AI strategy and competitive positioning
• China market recovery timeline
• Services growth sustainability`,
    parameters: [],
  },
  {
    id: 'earnings-call-analysis',
    name: 'Earnings Call Analysis',
    description: 'Upload and analyze earnings transcripts',
    category: 'analysis',
    icon: 'FileText',
    estimatedTime: '3-5 min',
    exampleOutput: `## Key Management Commentary
• "Services revenue hit record high at $22.3B"
• "AI investments across product portfolio"
• "Strong guidance for next quarter"

## Financial Highlights
• Revenue: $94.8B (+1% YoY)
• Gross Margin: 45.2% (up from 43.0% YoY)
• iPhone: $46.2B (48.7% of revenue)`,
    parameters: [
      { name: 'file', type: 'text', required: true },
    ],
  },
];

export const getTasksByCategory = (category: Task['category']) =>
  mockTasks.filter(t => t.category === category);
