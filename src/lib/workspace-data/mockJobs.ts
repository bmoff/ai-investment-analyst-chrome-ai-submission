export interface JobStep {
  id: string;
  name: string;
  description: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  isAuto: boolean;
}

export interface Job {
  id: string;
  name: string;
  type: 'task';
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  totalSteps?: number;
  startTime: string;
  endTime?: string;
  description: string;
  steps?: JobStep[];
}

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    name: 'Elevator Pitch',
    type: 'task',
    status: 'running',
    progress: 65,
    currentStep: 'step-1',
    totalSteps: 1,
    startTime: '2024-10-18T10:30:00Z',
    description: 'Generate a 30-second company summary',
    steps: [
      {
        id: 'step-1',
        name: 'Generate Analysis',
        description: 'AI generates elevator pitch',
        status: 'running',
        isAuto: false,
      },
    ],
  },
  {
    id: 'job-2',
    name: 'Bull and Bear Case',
    type: 'task',
    status: 'completed',
    progress: 100,
    currentStep: 'step-1',
    totalSteps: 1,
    startTime: '2024-10-18T09:15:00Z',
    endTime: '2024-10-18T09:45:00Z',
    description: 'Comprehensive investment analysis with bull and bear scenarios',
    steps: [
      {
        id: 'step-1',
        name: 'Generate Analysis',
        description: 'AI generates bull and bear case',
        status: 'completed',
        isAuto: false,
      },
    ],
  },
  {
    id: 'job-3',
    name: 'Earnings Call Analysis',
    type: 'task',
    status: 'completed',
    progress: 100,
    startTime: '2024-10-18T08:45:00Z',
    endTime: '2024-10-18T08:52:00Z',
    description: 'Extract insights from earnings call transcript',
    steps: [
      {
        id: 'step-1',
        name: 'Process Transcript',
        description: 'Parse earnings call transcript',
        status: 'completed',
        isAuto: true,
      },
      {
        id: 'step-2',
        name: 'Extract Key Insights',
        description: 'AI extracts main points',
        status: 'completed',
        isAuto: false,
      },
    ],
  },
  {
    id: 'job-4',
    name: 'Key Debates',
    type: 'task',
    status: 'failed',
    progress: 40,
    currentStep: 'step-1',
    totalSteps: 1,
    startTime: '2024-10-18T07:30:00Z',
    endTime: '2024-10-18T07:45:00Z',
    description: 'Identify core investment debates and questions',
    steps: [
      {
        id: 'step-1',
        name: 'Generate Analysis',
        description: 'AI generates key debates',
        status: 'failed',
        isAuto: false,
      },
    ],
  },
  {
    id: 'job-5',
    name: 'Meeting Prep',
    type: 'task',
    status: 'completed',
    progress: 100,
    startTime: '2024-10-18T06:15:00Z',
    endTime: '2024-10-18T06:18:00Z',
    description: 'Prepare pre-meeting briefing',
    steps: [
      {
        id: 'step-1',
        name: 'Generate Briefing',
        description: 'AI generates meeting prep',
        status: 'completed',
        isAuto: false,
      },
    ],
  },
];

export const getJobsByStatus = (status: Job['status']) =>
  mockJobs.filter(job => job.status === status);

export const getJobsByType = (type: Job['type']) =>
  mockJobs.filter(job => job.type === type);

export const getRunningJobs = () => 
  mockJobs.filter(job => job.status === 'running' || job.status === 'queued');

export const getCompletedJobs = () => 
  mockJobs.filter(job => job.status === 'completed' || job.status === 'failed');
