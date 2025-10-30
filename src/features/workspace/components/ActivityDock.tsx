'use client';

import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { JobCard, Job } from './JobCard';

interface ActivityDockProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  ticker?: string;
  onCancelJob?: (id: string) => void;
  onRemoveJob?: (id: string) => void;
  onViewOutput?: (id: string) => void;
  onCopyOutput?: (id: string) => void;
}

export function ActivityDock({
  isOpen,
  onClose,
  jobs,
  ticker,
  onCancelJob,
  onRemoveJob,
  onViewOutput,
  onCopyOutput,
}: ActivityDockProps) {
  const runningJobs = jobs.filter(j => j.status === 'running' || j.status === 'queued');
  const completedJobs = jobs.filter(j => j.status === 'completed' || j.status === 'failed');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - transparent, no blur */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-xl z-40 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/30 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground">Activity Dock</h3>
            {ticker && (
              <p className="text-sm text-muted-foreground truncate mt-1">
                {ticker}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {/* Running Jobs */}
            {runningJobs.length > 0 && (
              <div className="p-6 border-b border-border/30">
                <h4 className="text-sm font-medium text-foreground mb-4">
                  Running ({runningJobs.length})
                </h4>
                <div className="space-y-3">
                  {runningJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onCancel={() => onCancelJob?.(job.id)}
                      onRemove={() => onRemoveJob?.(job.id)}
                      onViewOutput={() => onViewOutput?.(job.id)}
                      onCopyOutput={() => onCopyOutput?.(job.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Jobs */}
            {completedJobs.length > 0 && (
              <div className="p-6">
                <h4 className="text-sm font-medium text-foreground mb-4">
                  Completed ({completedJobs.length})
                </h4>
                <div className="space-y-3">
                  {completedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onCancel={() => onCancelJob?.(job.id)}
                      onRemove={() => onRemoveJob?.(job.id)}
                      onViewOutput={() => onViewOutput?.(job.id)}
                      onCopyOutput={() => onCopyOutput?.(job.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {jobs.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <p className="text-sm">No active tasks</p>
                <p className="text-xs mt-1">Run a task to see activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
