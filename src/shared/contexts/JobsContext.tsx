'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Job } from '@/features/workspace/components/JobCard';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { localStorageService } from '@/lib/services/local-storage-service';

interface JobsContextType {
  jobs: Job[];
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  removeJob: (jobId: string) => void;
  cancelJob: (jobId: string) => void;
  isActivityDockOpen: boolean;
  setActivityDockOpen: (open: boolean) => void;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isActivityDockOpen, setIsActivityDockOpen] = useState(false);

  // Load jobs from localStorage on mount
  useEffect(() => {
    const stored = localStorageService.get<Job[]>(STORAGE_KEYS.JOBS);
    if (stored) {
      setJobs(stored);
    }
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.JOBS, jobs);
  }, [jobs]);

  const addJob = (job: Job) => {
    setJobs(prev => [...prev, job]);
  };

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const removeJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const cancelJob = (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'cancelled' as const } : job
    ));
  };

  return (
    <JobsContext.Provider value={{ 
      jobs, 
      addJob, 
      updateJob, 
      removeJob, 
      cancelJob,
      isActivityDockOpen,
      setActivityDockOpen: setIsActivityDockOpen
    }}>
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within JobsProvider');
  }
  return context;
}
