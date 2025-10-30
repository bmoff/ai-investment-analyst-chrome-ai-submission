/**
 * Task and Agent ID constants
 * All task/agent identifiers should be defined here for consistency
 */

export const TASK_IDS = {
  COMPANY_OVERVIEW: 'company-overview',
  ELEVATOR_PITCH: 'elevator-pitch',
  BULL_BEAR_CASE: 'bull-bear-case',
  KEY_DEBATES: 'key-debates',
  MEETING_PREP: 'meeting-prep',
  EARNINGS_CALL_ANALYSIS: 'earnings-call-analysis',
  BRIEF: 'brief',
} as const;

export type TaskId = typeof TASK_IDS[keyof typeof TASK_IDS];

/**
 * Map agent IDs to display names
 */
export const AGENT_DISPLAY_NAMES: Record<TaskId, string> = {
  [TASK_IDS.COMPANY_OVERVIEW]: 'Company Overview',
  [TASK_IDS.ELEVATOR_PITCH]: 'Elevator Pitch',
  [TASK_IDS.BULL_BEAR_CASE]: 'Bull and Bear Case',
  [TASK_IDS.KEY_DEBATES]: 'Key Debates',
  [TASK_IDS.MEETING_PREP]: 'Meeting Prep',
  [TASK_IDS.EARNINGS_CALL_ANALYSIS]: 'Earnings Call Analysis',
  [TASK_IDS.BRIEF]: 'Investment Brief',
} as const;

/**
 * Map agent IDs to categories for tags
 */
export const AGENT_CATEGORIES: Record<TaskId, string[]> = {
  [TASK_IDS.COMPANY_OVERVIEW]: ['overview', 'company'],
  [TASK_IDS.ELEVATOR_PITCH]: ['screening', 'summary'],
  [TASK_IDS.BULL_BEAR_CASE]: ['analysis', 'investment'],
  [TASK_IDS.KEY_DEBATES]: ['analysis', 'debates'],
  [TASK_IDS.MEETING_PREP]: ['monitoring', 'preparation'],
  [TASK_IDS.EARNINGS_CALL_ANALYSIS]: ['analysis', 'earnings'],
  [TASK_IDS.BRIEF]: ['brief', 'investment', 'summary'],
} as const;

