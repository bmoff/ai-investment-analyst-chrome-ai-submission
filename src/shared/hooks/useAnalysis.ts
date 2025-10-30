/**
 * Analysis state management hook using Zustand
 * Provides persistent storage for analysis data across the app
 */
import { useAnalysisStore } from '@/features/analysis/stores/analysis-store';

export const useAnalysis = () => {
  const {
    getAnalysisData,
    saveOverview,
    saveAgentOutput,
    clearAnalysisData,
    hasData,
    clearAllAnalysisData
  } = useAnalysisStore();

  return {
    getAnalysisData,
    saveOverview,
    saveAgentOutput,
    clearAnalysisData,
    hasData,
    clearAllAnalysisData
  };
};