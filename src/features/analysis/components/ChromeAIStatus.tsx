'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, ChevronDown, Zap, Download } from 'lucide-react';
import { chromeAIService } from '@/features/analysis/services/chrome-ai-service-simple';
import type { ChromeAIAvailability } from '@/features/analysis/services/chrome-ai-service-simple';

interface ChromeAIStatusProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export default function ChromeAIStatus({ variant = 'full', className = '' }: ChromeAIStatusProps) {
  const [status, setStatus] = useState<ChromeAIAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingAPIs, setDownloadingAPIs] = useState<Set<string>>(new Set());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && variant === 'compact') {
        const target = event.target as Element;
        if (!target.closest('[data-chrome-ai-dropdown]')) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, variant]);

  useEffect(() => {
    const checkStatus = async () => {
      // Call the async getAvailabilityStatus method
      const availability = await chromeAIService.getAvailabilityStatus();
      setStatus(availability);
      setIsLoading(false);
    };

    // Check immediately
    checkStatus();

    // Check again after a short delay to ensure APIs are loaded
    const timer = setTimeout(checkStatus, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCheckDetailedStatus = async () => {
    try {
      console.log('Checking detailed Chrome AI download status...');
      const detailed = await chromeAIService.getDetailedDownloadStatus();
      console.log('Detailed Chrome AI status:', detailed);
      // Status logged for debugging, no need to store in state
    } catch (error) {
      console.error('Error checking detailed status:', error);
    }
  };

  const handleDownloadAll = async () => {
    if (!status) return;
    
    setIsDownloading(true);
    const downloadableAPIs = [
      { name: 'Summarizer', status: status.summarizer },
      { name: 'Writer', status: status.writer },
      { name: 'Rewriter', status: status.rewriter },
      { name: 'Translator', status: status.translator },
      { name: 'LanguageModel', status: status.languageModel }
    ].filter(api => api.status === 'downloadable');

    try {
      for (const api of downloadableAPIs) {
        setDownloadingAPIs(prev => new Set(prev).add(api.name));
        
        const result = await chromeAIService.downloadSpecificAPI(api.name);
        
        if (result.success) {
          console.log(`${api.name} download triggered successfully`);
        } else {
          console.error(`${api.name} download failed:`, result.error);
        }
        
        setDownloadingAPIs(prev => {
          const newSet = new Set(prev);
          newSet.delete(api.name);
          return newSet;
        });
      }
      
      // Re-check status after all downloads
      setTimeout(async () => {
        const availability = await chromeAIService.getAvailabilityStatus();
        setStatus(availability);
      }, 2000);
      
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
      setDownloadingAPIs(new Set());
    }
  };

  const handleDownloadSpecific = async (apiName: string) => {
    setDownloadingAPIs(prev => new Set(prev).add(apiName));
    
    try {
      const result = await chromeAIService.downloadSpecificAPI(apiName);
      
      if (result.success) {
        console.log(`${apiName} download triggered successfully`);
        
        // Re-check status after a delay
        setTimeout(async () => {
          const availability = await chromeAIService.getAvailabilityStatus();
          setStatus(availability);
        }, 2000);
      } else {
        console.error(`${apiName} download failed:`, result.error);
        alert(`Failed to download ${apiName}: ${result.error?.message}`);
      }
    } catch (error) {
      console.error(`${apiName} download error:`, error);
      alert(`Download error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingAPIs(prev => {
        const newSet = new Set(prev);
        newSet.delete(apiName);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`glass rounded-xl px-4 py-2 inline-flex items-center gap-2 ${className}`}
      >
        <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
        <span className="text-xs text-muted-foreground">Checking Chrome AI...</span>
      </motion.div>
    );
  }

  if (!status) return null;

  const availableCount = [
    status.summarizer,
    status.writer,
    status.rewriter,
    status.translator,
    status.languageModel,
  ].filter(status => status === 'available').length;

  const downloadableCount = [
    status.summarizer,
    status.writer,
    status.rewriter,
    status.translator,
    status.languageModel,
  ].filter(status => status === 'downloadable').length;

  const isFullyAvailable = status.available && availableCount === 5;
  const isPartiallyAvailable = status.available && availableCount > 0 && availableCount < 5;

  // Compact variant (for company page header) - now clickable
  if (variant === 'compact') {
    return (
      <div className="relative z-[9999]" data-chrome-ai-dropdown>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`glass rounded-lg px-4 py-2 inline-flex items-center gap-2 cursor-pointer hover:bg-muted/10 transition-colors ${className}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isFullyAvailable ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500 font-medium">Chrome AI Ready</span>
            </>
          ) : isPartiallyAvailable ? (
            <>
              <AlertCircle className="w-4 h-4 text-accent" />
                              <span className="text-sm text-accent font-medium">{availableCount}/5 Models</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">AI Unavailable</span>
            </>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </motion.div>

        {/* Expanded Details for Compact Variant */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full right-0 mt-2 z-[9999] w-80 max-w-[calc(100vw-2rem)]"
            >
              <div className="glass rounded-xl overflow-hidden shadow-lg">
                {/* Header */}
                <div className="px-5 py-3 border-b border-border/50 bg-background/95 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    {isFullyAvailable ? (
                      <div className="relative">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div className="absolute inset-0 animate-pulse-glow">
                          <CheckCircle2 className="w-5 h-5 text-green-500 opacity-50" />
                        </div>
                      </div>
                    ) : isPartiallyAvailable ? (
                      <AlertCircle className="w-5 h-5 text-accent" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive" />
                    )}
                    
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {isFullyAvailable
                            ? 'Chrome AI Connected'
                            : isPartiallyAvailable
                            ? 'Chrome AI Partially Available'
                            : 'Chrome AI Not Available'}
                        </span>
                        {(isFullyAvailable || isPartiallyAvailable) && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isFullyAvailable 
                              ? 'bg-green-500/20 text-green-500 border border-green-500/40'
                              : 'bg-accent/20 text-accent border border-accent/40'
                          }`}>
                            {availableCount}/5 Models
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isFullyAvailable
                          ? 'All AI features are ready to use'
                          : isPartiallyAvailable
                          ? `${availableCount} out of 5 models available`
                          : 'Enable Chrome Built-in AI to use features'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {status?.error && (
                  <div className="px-5 py-4 bg-destructive/10 border border-destructive/20 rounded-lg mx-5 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-destructive mb-1">Chrome AI Issue</h4>
                        <p className="text-xs text-destructive/80 leading-relaxed">{status.error}</p>
                        <div className="mt-2 text-xs text-destructive/70">
                          <strong>Quick Fix:</strong> Free up storage space or enable Chrome AI in browser settings.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Model Status List */}
                <div className="px-5 py-4 space-y-3 bg-background/95 backdrop-blur-sm">
                  <p className="text-xs text-muted-foreground/80 mb-3 font-medium">
                    AI Model Status
                  </p>
                  
                  <div className="space-y-2">
                    <APIStatusItem
                      name="Summarizer"
                      status={status.summarizer}
                      description="Text summarization"
                      onDownload={() => handleDownloadSpecific('Summarizer')}
                      isDownloading={downloadingAPIs.has('Summarizer')}
                    />
                    <APIStatusItem
                      name="Writer"
                      status={status.writer}
                      description="Content generation"
                      onDownload={() => handleDownloadSpecific('Writer')}
                      isDownloading={downloadingAPIs.has('Writer')}
                    />
                    <APIStatusItem
                      name="Rewriter"
                      status={status.rewriter}
                      description="Text refinement"
                      onDownload={() => handleDownloadSpecific('Rewriter')}
                      isDownloading={downloadingAPIs.has('Rewriter')}
                    />
                    <APIStatusItem
                      name="Translator"
                      status={status.translator}
                      description="Language translation"
                      onDownload={() => handleDownloadSpecific('Translator')}
                      isDownloading={downloadingAPIs.has('Translator')}
                    />
                    <APIStatusItem
                      name="Language Detector"
                      status={status.languageModel}
                      description="Language identification"
                      onDownload={() => handleDownloadSpecific('LanguageModel')}
                      isDownloading={downloadingAPIs.has('LanguageModel')}
                    />
                  </div>

                  {/* Download Button */}
                  {downloadableCount > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <button
                        onClick={handleDownloadAll}
                        disabled={isDownloading}
                        className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Downloading {downloadingAPIs.size > 0 ? Array.from(downloadingAPIs).join(', ') : 'Models'}...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" />
                            Download {downloadableCount} Available Model{downloadableCount > 1 ? 's' : ''}
                          </>
                        )}
                      </button>
                      <p className="text-xs text-muted-foreground/60 mt-2 text-center">
                        Downloads all {downloadableCount} downloadable model{downloadableCount > 1 ? 's' : ''} (requires user activation)
                      </p>
                    </div>
                  )}

                  {/* Setup Instructions */}
                  {downloadableCount === 0 && !isFullyAvailable && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <div className="bg-muted/20 rounded-lg p-3">
                        <h4 className="text-xs font-medium text-foreground mb-2">Setup Chrome AI</h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><strong>1.</strong> Enable Chrome AI in Chrome settings</p>
                          <p><strong>2.</strong> Ensure you have ~20GB free storage</p>
                          <p><strong>3.</strong> Restart Chrome after enabling</p>
                          <p><strong>4.</strong> Models will download automatically</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Status Check Button */}
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <button
                      onClick={handleCheckDetailedStatus}
                      className="w-full px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3 h-3" />
                      Check Detailed Download Status
                    </button>
                            <p className="text-xs text-muted-foreground/60 mt-2 text-center">
                              Get detailed information about model status
                            </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full variant (for homepage)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      className={`glass rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 flex items-center justify-between hover:bg-muted/10 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          {isFullyAvailable ? (
            <div className="relative">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div className="absolute inset-0 animate-pulse-glow">
                <CheckCircle2 className="w-5 h-5 text-green-500 opacity-50" />
              </div>
            </div>
          ) : isPartiallyAvailable ? (
            <AlertCircle className="w-5 h-5 text-accent" />
          ) : (
            <AlertCircle className="w-5 h-5 text-destructive" />
          )}
          
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {isFullyAvailable
                  ? 'Chrome AI Connected'
                  : isPartiallyAvailable
                  ? 'Chrome AI Partially Available'
                  : 'Chrome AI Not Available'}
              </span>
              {(isFullyAvailable || isPartiallyAvailable) && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isFullyAvailable 
                    ? 'bg-green-500/20 text-green-500 border border-green-500/40'
                    : 'bg-accent/20 text-accent border border-accent/40'
                }`}>
                  {availableCount}/5 Models
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isFullyAvailable
                ? 'All AI features are ready to use'
                : isPartiallyAvailable
                ? `${availableCount} out of 5 models available`
                : 'Enable Chrome Built-in AI to use features'}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="border-t border-border/50 overflow-hidden"
          >
            <div className="px-5 py-4 space-y-3 bg-background/95 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground/80 mb-3 font-medium">
                AI Model Status
              </p>
              
              {/* AI Model Status List */}
              <div className="space-y-2">
                <APIStatusItem
                  name="Summarizer"
                  status={status.summarizer}
                  description="Text summarization"
                  onDownload={() => handleDownloadSpecific('Summarizer')}
                  isDownloading={downloadingAPIs.has('Summarizer')}
                />
                <APIStatusItem
                  name="Writer"
                  status={status.writer}
                  description="Content generation"
                  onDownload={() => handleDownloadSpecific('Writer')}
                  isDownloading={downloadingAPIs.has('Writer')}
                />
                <APIStatusItem
                  name="Rewriter"
                  status={status.rewriter}
                  description="Text refinement"
                  onDownload={() => handleDownloadSpecific('Rewriter')}
                  isDownloading={downloadingAPIs.has('Rewriter')}
                />
                <APIStatusItem
                  name="Translator"
                  status={status.translator}
                  description="Language translation"
                  onDownload={() => handleDownloadSpecific('Translator')}
                  isDownloading={downloadingAPIs.has('Translator')}
                />
                <APIStatusItem
                  name="Language Detector"
                  status={status.languageModel}
                  description="Language identification"
                  onDownload={() => handleDownloadSpecific('LanguageModel')}
                  isDownloading={downloadingAPIs.has('LanguageModel')}
                />
              </div>

              {/* Help Text */}
              {!isFullyAvailable && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="bg-muted/20 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">Setup Chrome AI</h4>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-accent font-bold">1.</span>
                        <span>Install <strong className="text-accent">Chrome 127+</strong> (Dev or Canary)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent font-bold">2.</span>
                        <span>Enable Chrome AI settings in <code className="text-accent font-mono text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">chrome://flags</code></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent font-bold">3.</span>
                        <span>Ensure you have <strong className="text-accent">~20GB free storage</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent font-bold">4.</span>
                        <span>Restart Chrome after enabling</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground/60 italic">
                      Models will download automatically when Chrome AI is properly configured
                    </div>
                  </div>
                  
                  {/* Download Button */}
                  {downloadableCount > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <button
                        onClick={handleDownloadAll}
                        disabled={isDownloading}
                        className="w-full px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Downloading {downloadingAPIs.size > 0 ? Array.from(downloadingAPIs).join(', ') : 'Models'}...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" />
                            Download {downloadableCount} Available Model{downloadableCount > 1 ? 's' : ''}
                          </>
                        )}
                      </button>
                      <p className="text-xs text-muted-foreground/60 mt-2 text-center">
                        Downloads all {downloadableCount} downloadable model{downloadableCount > 1 ? 's' : ''} (requires user activation)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface APIStatusItemProps {
  name: string;
  status: 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported';
  description: string;
  onDownload?: () => void;
  isDownloading?: boolean;
}

function APIStatusItem({ name, status, description, onDownload, isDownloading = false }: APIStatusItemProps) {
  const getStatusIcon = () => {
    if (isDownloading) {
      return <Loader2 className="w-3.5 h-3.5 text-accent flex-shrink-0 animate-spin" />;
    }
    
    switch (status) {
      case 'available':
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />;
      case 'downloadable':
        return <Download className="w-3.5 h-3.5 text-accent flex-shrink-0" />;
      case 'downloading':
        return <Loader2 className="w-3.5 h-3.5 text-accent flex-shrink-0 animate-spin" />;
      case 'unavailable':
        return <div className="w-3.5 h-3.5 rounded-full border-2 border-muted flex-shrink-0" />;
      case 'unsupported':
        return <div className="w-3.5 h-3.5 rounded-full border-2 border-destructive flex-shrink-0" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full border-2 border-muted flex-shrink-0" />;
    }
  };

  const getStatusText = () => {
    if (isDownloading) {
      return { text: 'Downloading...', className: 'text-accent' };
    }
    
    switch (status) {
      case 'available':
        return { text: 'Ready', className: 'text-green-500' };
      case 'downloadable':
        return { text: 'Downloadable', className: 'text-accent' };
      case 'downloading':
        return { text: 'Downloading...', className: 'text-accent' };
      case 'unavailable':
        return { text: 'Unavailable', className: 'text-muted-foreground' };
      case 'unsupported':
        return { text: 'Unsupported', className: 'text-destructive' };
      default:
        return { text: 'Unknown', className: 'text-muted-foreground' };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <div>
          <span className={`text-xs font-medium ${status === 'available' ? 'text-foreground' : 'text-muted-foreground'}`}>
            {name}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {description}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${statusInfo.className}`}>
          {statusInfo.text}
        </span>
        {status === 'downloadable' && onDownload && (
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="px-2 py-1 text-xs bg-accent/10 hover:bg-accent/20 text-accent rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Download'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
