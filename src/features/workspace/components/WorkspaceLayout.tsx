'use client';

import { useState } from 'react';
import { CompanyWorkspace } from './CompanyWorkspace';
import { DocumentManager } from '@/features/documents/components/DocumentManager';
import { TaskLibrary } from './TaskLibrary';
import { Job } from './JobCard';
import { getCompanyByTicker } from '@/lib/workspace-data/mockCompanies';
import { mockTasks } from '@/lib/workspace-data/mockTasks';
import { executeTask } from '@/features/workspace/services/workspace-tasks';
import { useAnalysisStore } from '@/features/analysis/stores/analysis-store';
import { useJobs } from '@/shared/contexts/JobsContext';
import { useFavorites } from '@/shared/hooks/useFavorites';

interface WorkspaceLayoutProps {
  ticker: string;
  initialNote?: string;
}

export function WorkspaceLayout({ ticker, initialNote }: WorkspaceLayoutProps) {
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);
  const [isTaskLibraryOpen, setIsTaskLibraryOpen] = useState(false);
  
  const { saveAgentOutput } = useAnalysisStore();
  const { addJob, updateJob, setActivityDockOpen } = useJobs();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Normalize ticker to lowercase for consistent storage
  const normalizedTicker = ticker.toLowerCase();
  const company = getCompanyByTicker(normalizedTicker);

  // Real task execution
  const handleStartTask = async (taskId: string, params: Record<string, unknown>) => {
    const task = mockTasks.find(t => t.id === taskId);
    if (!task) return;

    const newJob: Job = {
      id: `job-${Date.now()}`,
      name: task.name,
      type: 'task',
      status: 'running',
      progress: 0,
      currentStep: 'Initializing...',
      totalSteps: 1,
      startTime: new Date().toISOString(),
      description: task.description,
      taskId: taskId,
      ticker: normalizedTicker,
    };

    addJob(newJob);
    
    // Automatically open the Activity Dock when a task starts
    setActivityDockOpen(true);

    try {
      // Execute the actual task
      const result = await executeTask(taskId, normalizedTicker, params, (stage, progress) => {
        updateJob(newJob.id, {
          currentStep: stage,
          progress: progress ? Math.round((progress.current / progress.total) * 100) : undefined
        });
      });

      // Save to analysis store
      console.log('Saving agent output to store:', { ticker: normalizedTicker, taskId, contentLength: result.content.length, timestamp: result.timestamp });
      saveAgentOutput(normalizedTicker, taskId, result);
      
      // Verify it was saved
      const savedData = useAnalysisStore.getState().getAnalysisData(normalizedTicker);
      console.log('Agent output saved. Current agentOutputs:', Object.keys(savedData.agentOutputs));
      console.log('Agent output details:', savedData.agentOutputs[taskId]);
      console.log('Full agentOutputs object:', savedData.agentOutputs);
      console.log('Checking if taskId exists:', taskId in savedData.agentOutputs);

      // Mark job as completed
      updateJob(newJob.id, {
        status: 'completed',
        progress: 100,
        endTime: new Date().toISOString(),
        output: result.content
      });

      console.log('Task completed:', taskId, result);
    } catch (error) {
      console.error('Task failed:', taskId, error);
      
      // Mark job as failed
      updateJob(newJob.id, {
        status: 'failed',
        endTime: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  if (!company) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
          <p className="text-muted-foreground">The ticker &ldquo;{ticker}&rdquo; was not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <CompanyWorkspace 
        ticker={normalizedTicker} 
        companyName={company.name}
        isFavorite={isFavorite(normalizedTicker)}
        onToggleFavorite={() => toggleFavorite(normalizedTicker)}
        onOpenDocuments={() => setIsDocumentsOpen(true)}
        documentCount={0} // Will be connected to actual document count
        onOpenTaskLibrary={() => {
          console.log('Opening TaskLibrary');
          setIsTaskLibraryOpen(true);
        }}
        initialNote={initialNote}
      />

      {/* Modals */}
      <DocumentManager
        ticker={normalizedTicker}
        isOpen={isDocumentsOpen}
        onClose={() => setIsDocumentsOpen(false)}
        mode="manage"
      />

      <TaskLibrary
        isOpen={isTaskLibraryOpen}
        onClose={() => setIsTaskLibraryOpen(false)}
        onStartTask={(taskId: string) => handleStartTask(taskId, {})}
      />
    </div>
  );
}
