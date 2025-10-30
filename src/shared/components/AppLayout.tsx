'use client';

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { TickerSearch } from "@/features/companies/components/TickerSearch";
import ChromeAIStatus from "@/features/analysis/components/ChromeAIStatus";
import { ActivityDock } from '@/features/workspace/components/ActivityDock';
import { AnalystSidebar } from '@/features/workspace/components/AnalystSidebar';
import { useJobs } from '@/shared/contexts/JobsContext';
import { Button } from '@/shared/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { jobs, cancelJob, removeJob, isActivityDockOpen, setActivityDockOpen } = useJobs();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleViewOutput = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job?.ticker && job?.taskId) {
      // Navigate to the workspace page for this ticker with the taskId as a query param
      router.push(`/workspace/${job.ticker.toLowerCase()}?note=${job.taskId}`);
      // Close the activity dock
      setActivityDockOpen(false);
    }
  };

  const handleCopyOutput = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job?.output) {
      navigator.clipboard.writeText(job.output);
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - AnalystSidebar */}
      <AnalystSidebar
        currentTicker=""
        currentView="company"
        onViewChange={() => {}} // Will be handled by page routing
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Right Side - Header + Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-border/50 backdrop-blur-sm bg-background/80 flex items-center justify-between px-4 relative z-50">
          <div className="flex items-center gap-4">
            <TickerSearch 
              variant="compact" 
              placeholder="Search ticker or company..."
              className="hidden sm:block"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivityDockOpen(!isActivityDockOpen)}
              className="relative flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>Activity Dock</span>
              {jobs.filter(j => j.status === 'running').length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </Button>
            <ChromeAIStatus variant="compact" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

             {/* Activity Dock - Drawer/Sidebar */}
             {isActivityDockOpen && (
               <ActivityDock
                 isOpen={isActivityDockOpen}
                 onClose={() => setActivityDockOpen(false)}
          jobs={jobs}
          ticker={''} // Empty since it's global
          onCancelJob={cancelJob}
          onRemoveJob={removeJob}
          onViewOutput={handleViewOutput}
          onCopyOutput={handleCopyOutput}
        />
      )}
    </div>
  );
};
