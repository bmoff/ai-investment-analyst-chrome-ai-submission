'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface ChromeAIErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Specialized error boundary for Chrome AI operations
 * Provides helpful guidance when Chrome AI features fail
 */
export function ChromeAIErrorBoundary({
  children,
}: ChromeAIErrorBoundaryProps) {
  const chromeAIFallback = (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive" />
            <CardTitle>Chrome AI Unavailable</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chrome Built-in AI is not available. Please ensure you have:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            <li>Chrome 127+ (Dev or Canary)</li>
            <li>Chrome AI enabled in browser settings</li>
            <li>~20GB free storage space</li>
            <li>Restarted Chrome after enabling</li>
          </ul>
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Zap className="w-4 h-4" />
            <span>Check the Chrome AI status indicator in the header for more details.</span>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="default"
            className="w-full"
          >
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ErrorBoundary fallback={chromeAIFallback}>
      {children}
    </ErrorBoundary>
  );
}

