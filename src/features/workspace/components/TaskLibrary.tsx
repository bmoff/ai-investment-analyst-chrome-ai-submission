'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Search, Play, Clock, ArrowLeft, X } from 'lucide-react';
import { mockTasks, Task } from '@/lib/workspace-data/mockTasks';

interface TaskLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTask: (taskId: string, params: Record<string, unknown>) => void;
}

export function TaskLibrary({ isOpen, onClose, onStartTask }: TaskLibraryProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  console.log('TaskLibrary render:', { isOpen });

  const filteredTasks = searchQuery
    ? mockTasks.filter(task =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockTasks;

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    // Initialize form with default values
    const defaults: Record<string, unknown> = {};
    task.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        defaults[param.name] = param.defaultValue;
      }
    });
    setFormData(defaults);
  };

  const handleStartTask = () => {
    if (selectedTask) {
      onStartTask(selectedTask.id, formData);
      setSelectedTask(null);
      setFormData({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="glass rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border/30 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Task Library</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a task to run for your analysis
              </p>
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
          <div className="flex h-[50dvh] min-h-[400px]">
            {/* Task List */}
            <div className="w-1/2 border-r border-border p-6">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Task List */}
                <div className="space-y-2 max-h-[45dvh] overflow-y-auto">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleSelectTask(task)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedTask?.id === task.id
                          ? 'border-primary bg-primary/5 shadow-glow'
                          : 'border-border hover:bg-muted/50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{task.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {task.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {task.estimatedTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          {/* Task Details */}
          <div className="w-1/2 pl-4">
            {selectedTask ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTask(null)}
                    className="p-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="font-semibold">{selectedTask.name}</h3>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedTask.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3 h-3" />
                    Estimated time: {selectedTask.estimatedTime}
                  </div>

                  {selectedTask.exampleOutput && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Example Output:</h4>
                      <div className="bg-muted p-3 rounded-lg text-xs font-mono whitespace-pre-wrap">
                        {selectedTask.exampleOutput}
                      </div>
                    </div>
                  )}

                  {/* Parameters */}
                  {selectedTask.parameters.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Parameters:</h4>
                      {selectedTask.parameters.map((param) => (
                        <div key={param.name} className="space-y-1">
                          <label className="text-xs font-medium">
                            {param.name}
                            {param.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {param.type === 'text' && (
                            <Input
                              placeholder={param.name}
                              value={formData[param.name] as string || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, [param.name]: e.target.value }))}
                              className="text-xs"
                            />
                          )}
                          {param.type === 'number' && (
                            <Input
                              type="number"
                              placeholder={param.name}
                              value={formData[param.name] as number || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, [param.name]: Number(e.target.value) }))}
                              className="text-xs"
                            />
                          )}
                          {param.type === 'select' && param.options && (
                            <select
                              value={formData[param.name] as string || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, [param.name]: e.target.value }))}
                              className="w-full px-3 py-2 text-xs border border-border rounded-md bg-background"
                            >
                              <option value="">Select {param.name}</option>
                              {param.options.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleStartTask} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Start Task
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTask(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">Select a task to view details</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
  );
}
