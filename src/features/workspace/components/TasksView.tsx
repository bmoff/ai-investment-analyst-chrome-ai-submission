'use client';

import { useState } from 'react';
import { Search, Play, Clock } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { mockTasks } from '@/lib/workspace-data/mockTasks';

interface TasksViewProps {
  onRunTask?: (taskId: string) => void;
}

export function TasksView({ onRunTask }: TasksViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = searchQuery
    ? mockTasks.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockTasks;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">
            Run individual research tasks to generate specific insights
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} available
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">{task.name}</h3>
                <Badge variant="outline">{task.category}</Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {task.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Clock className="w-3 h-3" />
                {task.estimatedTime}
              </div>

              {task.exampleOutput && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium mb-2">Example Output:</h4>
                  <div className="bg-muted p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-20 overflow-y-auto">
                    {task.exampleOutput}
                  </div>
                </div>
              )}

              <Button
                onClick={() => onRunTask?.(task.id)}
                className="w-full"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Task
              </Button>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No tasks found</p>
            <p className="text-xs mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
