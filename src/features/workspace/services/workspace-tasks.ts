import { mockTasks } from '@/lib/workspace-data/mockTasks';
import { runAgent, runEarningsCallAnalysis, AgentOutput } from '@/features/analysis/agents/agents';
import { TASK_IDS } from '@/lib/constants/task-ids';

/**
 * Map task IDs to their corresponding agent functions
 */
export const taskAgentMap: Record<string, (ticker: string, ...args: unknown[]) => Promise<AgentOutput>> = {
  [TASK_IDS.ELEVATOR_PITCH]: (ticker: string) => runAgent(TASK_IDS.ELEVATOR_PITCH, ticker),
  [TASK_IDS.BULL_BEAR_CASE]: (ticker: string) => runAgent(TASK_IDS.BULL_BEAR_CASE, ticker),
  [TASK_IDS.KEY_DEBATES]: (ticker: string) => runAgent(TASK_IDS.KEY_DEBATES, ticker),
  [TASK_IDS.MEETING_PREP]: (ticker: string) => runAgent(TASK_IDS.MEETING_PREP, ticker),
  [TASK_IDS.EARNINGS_CALL_ANALYSIS]: (ticker: string, ...args: unknown[]) => {
    const file = args[0] as File;
    return runEarningsCallAnalysis(ticker, file);
  },
};

/**
 * Get task by ID
 */
export function getTaskById(taskId: string) {
  return mockTasks.find(task => task.id === taskId);
}

/**
 * Get tasks by category
 */
export function getTasksByCategory(category: string) {
  return mockTasks.filter(task => task.category === category);
}

/**
 * Execute a task with the given parameters
 */
export async function executeTask(
  taskId: string, 
  ticker: string, 
  params: Record<string, unknown> = {},
  onProgress?: (stage: string, progress?: { current: number; total: number; stage: string }) => void
): Promise<AgentOutput> {
  const task = getTaskById(taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const agentFunction = taskAgentMap[taskId];
  if (!agentFunction) {
    throw new Error(`No agent function mapped for task ${taskId}`);
  }

  // Handle special cases
  if (taskId === TASK_IDS.EARNINGS_CALL_ANALYSIS) {
    const file = params.file as File;
    if (!file) {
      throw new Error('Earnings call analysis requires a file parameter');
    }
    return await agentFunction(ticker, file, onProgress);
  }

  // For other tasks, just pass the ticker
  return await agentFunction(ticker, onProgress);
}

/**
 * Get all available tasks
 */
export function getAllTasks() {
  return mockTasks;
}

/**
 * Get task categories
 */
export function getTaskCategories() {
  const categories = new Set(mockTasks.map(task => task.category));
  return Array.from(categories);
}
