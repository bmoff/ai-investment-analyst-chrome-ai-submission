'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface FeedbackData {
  category: 'documentation' | 'api-behavior' | 'developer-experience' | 'feature-request';
  issue: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export default function ChromeAIFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    category: 'api-behavior',
    issue: '',
    description: '',
    impact: 'medium'
  });

  const handleSubmit = async () => {
    // In a real implementation, this would send to a feedback API
    console.log('Chrome AI Feedback:', feedback);
    
    // For now, just show success and reset
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsOpen(false);
      setFeedback({
        category: 'api-behavior',
        issue: '',
        description: '',
        impact: 'medium'
      });
    }, 2000);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        onClick={() => setIsOpen(true)}
        title="Report Chrome AI API Issues"
      >
        <MessageSquare className="w-5 h-5" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50 w-80 bg-background border border-border rounded-lg shadow-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Chrome AI Feedback</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Category
              </label>
              <select
                value={feedback.category}
                onChange={(e) => setFeedback(prev => ({ ...prev, category: e.target.value as 'documentation' | 'api-behavior' | 'developer-experience' | 'feature-request' }))}
                className="w-full text-sm bg-muted border border-input rounded px-2 py-1"
              >
                <option value="documentation">Documentation Issue</option>
                <option value="api-behavior">API Behavior</option>
                <option value="developer-experience">Developer Experience</option>
                <option value="feature-request">Feature Request</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Issue Title
              </label>
              <input
                type="text"
                value={feedback.issue}
                onChange={(e) => setFeedback(prev => ({ ...prev, issue: e.target.value }))}
                placeholder="Brief description of the issue"
                className="w-full text-sm bg-muted border border-input rounded px-2 py-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Description
              </label>
              <textarea
                value={feedback.description}
                onChange={(e) => setFeedback(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue, workaround, and suggestions"
                rows={3}
                className="w-full text-sm bg-muted border border-input rounded px-2 py-1 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Impact
              </label>
              <select
                value={feedback.impact}
                onChange={(e) => setFeedback(prev => ({ ...prev, impact: e.target.value as 'low' | 'medium' | 'high' | 'critical' }))}
                className="w-full text-sm bg-muted border border-input rounded px-2 py-1"
              >
                <option value="low">Low - Minor inconvenience</option>
                <option value="medium">Medium - Slows development</option>
                <option value="high">High - Blocks implementation</option>
              </select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!feedback.issue.trim() || !feedback.description.trim()}
              className="w-full text-sm"
            >
              <Send className="w-3 h-3 mr-2" />
              Submit Feedback
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Feedback submitted!</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Thank you for helping improve Chrome AI APIs
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
