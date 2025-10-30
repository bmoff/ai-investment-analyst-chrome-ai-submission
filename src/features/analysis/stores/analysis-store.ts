import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AgentOutput } from '@/features/analysis/agents/agents';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';

interface AnalysisData {
  overview: AgentOutput | null;
  agentOutputs: Record<string, AgentOutput>;
  lastUpdated: number;
}

interface AnalysisState {
  // State
  analysisData: Record<string, AnalysisData>;
  
  // Actions
  getAnalysisData: (ticker: string) => AnalysisData;
  saveOverview: (ticker: string, overview: AgentOutput) => void;
  saveAgentOutput: (ticker: string, agentId: string, output: AgentOutput) => void;
  removeAgentOutput: (ticker: string, agentId: string) => void;
  clearAnalysisData: (ticker: string) => void;
  hasData: (ticker: string) => boolean;
  clearAllAnalysisData: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      // Initial state
      analysisData: {},

      // Get analysis data for a ticker
      getAnalysisData: (ticker: string) => {
        const state = get();
        console.log('getAnalysisData called for ticker:', ticker, 'Raw state:', state.analysisData[ticker]);
        const data = state.analysisData[ticker] || {
          overview: null,
          agentOutputs: {},
          lastUpdated: 0
        };
        
        console.log('getAnalysisData - data.agentOutputs keys:', Object.keys(data.agentOutputs));

        // Convert timestamp strings back to Date objects after localStorage deserialization
        const processedData = {
          ...data,
          overview: data.overview ? {
            ...data.overview,
            timestamp: new Date(data.overview.timestamp)
          } : null,
          agentOutputs: Object.fromEntries(
            Object.entries(data.agentOutputs).map(([key, output]) => [
              key,
              {
                ...output,
                timestamp: new Date(output.timestamp)
              }
            ])
          )
        };
        
        console.log('getAnalysisData - processed agentOutputs keys:', Object.keys(processedData.agentOutputs));

        return processedData;
      },

      // Save overview for a ticker
      saveOverview: (ticker: string, overview: AgentOutput) => {
        console.log('AnalysisStore: Saving overview for', ticker, ':', overview);
        set((state) => ({
          analysisData: {
            ...state.analysisData,
            [ticker]: {
              ...state.analysisData[ticker],
              overview,
              lastUpdated: Date.now()
            }
          }
        }));
      },

      // Save agent output for a ticker
      saveAgentOutput: (ticker: string, agentId: string, output: AgentOutput) => {
        console.log('AnalysisStore: Saving agent output for', ticker, agentId, ':', output);
        console.log('Content length:', output.content.length);
        console.log('Content preview:', output.content.substring(0, 100));
        console.log('Has newlines:', output.content.includes('\n'));
        
        set((state) => {
          const currentData = state.analysisData[ticker];
          const existingAgentOutputs = currentData?.agentOutputs || {};
          
          console.log('Existing agentOutputs before save:', Object.keys(existingAgentOutputs));
          
          const updatedData = {
            ...state.analysisData,
            [ticker]: {
              ...currentData,
              agentOutputs: {
                ...existingAgentOutputs,
                [agentId]: output
              },
              lastUpdated: Date.now()
            }
          };
          
          console.log('Updated agentOutputs keys:', Object.keys(updatedData[ticker].agentOutputs));
          
          return { analysisData: updatedData };
        });
        
        // Verify it was saved
        setTimeout(() => {
          const state = get();
          const savedData = state.analysisData[ticker];
          console.log('SaveAgentOutput - Verification after save:', {
            ticker,
            agentId,
            existsInStore: agentId in (savedData?.agentOutputs || {}),
            allKeys: Object.keys(savedData?.agentOutputs || {})
          });
        }, 100);
      },

      // Remove agent output for a ticker
      removeAgentOutput: (ticker: string, agentId: string) => {
        set((state) => {
          const currentData = state.analysisData[ticker];
          if (!currentData) return state;
          
          const newAgentOutputs = { ...currentData.agentOutputs };
          delete newAgentOutputs[agentId];
          
          return {
            analysisData: {
              ...state.analysisData,
              [ticker]: {
                ...currentData,
                agentOutputs: newAgentOutputs,
                lastUpdated: Date.now()
              }
            }
          };
        });
      },

      // Clear analysis data for a ticker
      clearAnalysisData: (ticker: string) => {
        set((state) => {
          const newData = { ...state.analysisData };
          delete newData[ticker];
          return { analysisData: newData };
        });
      },

      // Check if ticker has any data
      hasData: (ticker: string) => {
        const state = get();
        return !!state.analysisData[ticker];
      },

      // Clear all analysis data
      clearAllAnalysisData: () => {
        set({ analysisData: {} });
      }
    }),
    {
      name: STORAGE_KEYS.ANALYSIS,
      version: 1,
      onRehydrateStorage: () => (state) => {
        console.log('AnalysisStore: Rehydrated from localStorage:', state);
        if (state) {
          // Debug content in all agent outputs
          Object.entries(state.analysisData).forEach(([ticker, data]) => {
            Object.entries(data.agentOutputs).forEach(([agentId, output]) => {
              console.log(`Loaded ${ticker} ${agentId}:`, {
                contentLength: output.content.length,
                contentPreview: output.content.substring(0, 100),
                hasNewlines: output.content.includes('\n')
              });
            });
          });
        }
      }
    }
  )
);
