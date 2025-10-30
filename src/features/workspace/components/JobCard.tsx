'use client';

import { useState } from 'react';
import { X, CheckCircle, Clock, Loader2, ChevronDown, ChevronUp, Eye, Copy } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface JobStep {
  id: string;
  name: string;
  description?: string;
  status: JobStatus;
  isAuto?: boolean;
}

export interface Job {
  id: string;
  name: string;
  type: 'task';
  status: JobStatus;
  progress?: number;
  currentStep?: string;
  totalSteps?: number;
  startTime?: string;
  endTime?: string;
  description?: string;
  steps?: JobStep[];
  output?: string;
  error?: string;
  taskId?: string; // ID of the task that created this job (e.g., 'elevator-pitch')
  ticker?: string; // Ticker symbol for the company
}

interface JobCardProps {
  job: Job;
  onCancel?: (id: string) => void;
  onRemove?: (id: string) => void;
  onViewOutput?: (id: string) => void;
  onCopyOutput?: (id: string) => void;
}

export function JobCard({ job, onCancel, onRemove, onViewOutput, onCopyOutput }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (job.status) {
      case 'queued':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'queued':
        return 'bg-muted text-muted-foreground';
      case 'running':
        return 'bg-blue-500/20 text-blue-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'failed':
        return 'bg-red-500/20 text-red-500';
    }
  };

  const getProgressColor = () => {
    switch (job.status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return '';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.round(duration / 60)}m`;
    return `${Math.round(duration / 3600)}h`;
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-background">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{job.name}</h4>
              {job.ticker && (
                <Badge variant="outline" className="text-xs font-mono shrink-0">
                  {job.ticker}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{job.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
            {job.status}
          </Badge>
          {job.steps && job.steps.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {job.progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>
              {job.currentStep || 'Processing...'}
              {job.progress !== undefined && ` (${job.progress}%)`}
            </span>
            {job.status === 'running' && (
              <span className="text-xs text-muted-foreground/70">
                This may take 10-30 seconds...
              </span>
            )}
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${job.progress || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps */}
      {isExpanded && job.steps && (
        <div className="mb-3 space-y-2">
          {job.steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2 text-xs">
              <div className="flex-shrink-0">
                {step.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                {step.status === 'running' && <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                {step.status === 'failed' && <X className="w-3 h-3 text-red-500" />}
                {step.status === 'queued' && <Clock className="w-3 h-3 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{step.name}</div>
                {step.description && (
                  <div className="text-muted-foreground truncate">{step.description}</div>
                )}
              </div>
              {step.isAuto && (
                <Badge variant="outline" className="text-xs">
                  Auto
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatDuration(job.startTime, job.endTime)}
        </div>
        
        <div className="flex items-center gap-1">
          {job.status === 'running' && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(job.id)}
              className="h-6 px-2 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          )}
          
          {job.status === 'completed' && (
            <>
              {onViewOutput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewOutput(job.id)}
                  className="h-6 px-2 text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
              {onCopyOutput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyOutput(job.id)}
                  className="h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              )}
            </>
          )}
          
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(job.id)}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
