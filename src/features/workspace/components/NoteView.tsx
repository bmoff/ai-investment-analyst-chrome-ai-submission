'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { 
  ArrowLeft, 
  Clock, 
  CheckSquare, 
  Save,
  Edit3,
  Download,
  Trash2,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileType,
  Sparkles,
  Wand2,
  Loader2
} from 'lucide-react';
import { Note } from '@/lib/workspace-data/mockNotes';
import { SimpleLexicalEditor } from '@/shared/components/lexical/SimpleLexicalEditor';
import { saveNoteToAnalysisData, getNotesFromAnalysisData } from '@/features/analysis/services/notes-service';
import { exportNote } from '@/lib/utils/export-utils';
import { generateBriefWithAI } from '@/features/analysis/services/brief-generation-service';
import { chromeAIService } from '@/features/analysis/services/chrome-ai-service-simple';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onDelete?: (note: Note) => void;
  companyName?: string;
  // onSave?: (note: Note) => void;
}

export function NoteView({ note, onBack, onDelete, companyName }: NoteViewProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [noteTitle, setNoteTitle] = useState(note.title);
  const [noteContent, setNoteContent] = useState(note.content);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [contentUpdateKey, setContentUpdateKey] = useState(0);
  
  // Track the last saved content to prevent infinite loops
  const lastSavedContent = useRef(note.content);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getSourceIcon = (sourceType: Note['sourceType']) => {
    switch (sourceType) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-green-500" />;
    }
  };

  const handleSaveTitle = () => {
    // In a real app, this would save the title
    console.log('Saving title:', noteTitle);
    setIsEditingTitle(false);
  };

  const handleSaveContent = useCallback((content: string) => {
    // Only update state if content actually changed
    if (content !== noteContent) {
      setNoteContent(content);
    }
    
    // Only save if content is different from last saved content
    if (content !== lastSavedContent.current) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce the save operation to prevent excessive saves
      saveTimeoutRef.current = setTimeout(() => {
        const updatedNote = { ...note, content, updatedAt: new Date().toISOString() };
        saveNoteToAnalysisData(updatedNote);
        lastSavedContent.current = content;
        console.log('Saving content:', content);
      }, 500); // 500ms debounce
    }
  }, [note]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu) {
        const target = event.target as Element;
        if (!target.closest('.export-menu-container')) {
          setShowExportMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const handleExport = async (format: 'pdf' | 'excel' | 'word' | 'csv' = 'pdf') => {
    try {
      await exportNote(note, { 
        format, 
        includeMetadata: true 
      });
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      // In a real app, you might want to show a toast notification here
      alert('Failed to export note. Please try again.');
    }
  };

  const handleDelete = () => {
    if (onDelete && note.sourceId !== 'brief') {
      onDelete(note);
    }
  };

  const handleGenerateBrief = async () => {
    if (note.sourceId !== 'brief') return;
    
    setIsGeneratingBrief(true);
    try {
      const allNotes = getNotesFromAnalysisData(note.companyTicker, companyName);
      const generatedBrief = await generateBriefWithAI(note.companyTicker, companyName, allNotes);
      
      // Update the note content
      setNoteContent(generatedBrief);
      
      // Save the updated note
      const updatedNote = { ...note, content: generatedBrief, updatedAt: new Date().toISOString() };
      saveNoteToAnalysisData(updatedNote);
      
    } catch (error) {
      console.error('Failed to generate brief:', error);
      alert('Failed to generate brief. Please try again.');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleRewrite = async () => {
    if (!noteContent.trim()) {
      alert('Please add some content to rewrite.');
      return;
    }

    setIsRewriting(true);
    try {
      const result = await chromeAIService.rewriteText(noteContent, {
        tone: 'more-formal',
        format: 'plain-text',
        length: 'as-is',
        onProgress: (message) => {
          console.log('Rewriter progress:', message);
        }
      });

      if (result.success && result.data?.rewrittenText) {
        const rewrittenText = result.data.rewrittenText;
        setNoteContent(rewrittenText);
        handleSaveContent(rewrittenText);
        // Force editor to update with new content
        setContentUpdateKey(prev => prev + 1);
      } else {
        const errorMessage = result.error?.message || 'Failed to rewrite text. Please try again.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Rewrite failed:', error);
      alert('Failed to rewrite text. Please ensure Chrome AI Rewriter is available.');
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4 bg-background z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Notes
            </Button>
            <div className="h-6 w-px bg-border" />
            {getSourceIcon(note.sourceType)}
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="text-lg font-semibold bg-transparent border-none outline-none flex-1"
                    autoFocus
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') {
                        setNoteTitle(note.title);
                        setIsEditingTitle(false);
                      }
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={handleSaveTitle}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">{noteTitle}</h1>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>Source: {note.sourceName}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Delete Button - Only show if not brief */}
            {note.sourceId !== 'brief' && onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
            
            {/* Generate Brief Button - Only show for brief notes */}
            {note.sourceId === 'brief' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateBrief}
                disabled={isGeneratingBrief}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 dark:border-blue-800"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingBrief ? 'Generating...' : 'Generate Brief'}
              </Button>
            )}
            
            {/* Rewrite Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRewrite}
              disabled={isRewriting}
              className="flex items-center gap-2"
            >
              {isRewriting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Rewrite
                </>
              )}
            </Button>
            
            {/* Export Button with Dropdown */}
            <div className="relative export-menu-container">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-3 h-3" />
              </Button>
              
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-red-500" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-500" />
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('word')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <FileType className="w-4 h-4 text-blue-500" />
                      Export as Word
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      Export as CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <SimpleLexicalEditor
          key={`lexical-editor-${note.id}`}
          initialContent={noteContent}
          onChange={handleSaveContent}
          placeholder="Add your research notes..."
          className="h-full border-0 rounded-none"
          showToolbar={true}
          showExportButton={false}
          hideMarkdownShortcuts={note.sourceId === 'brief'}
          forceUpdateKey={`${contentUpdateKey}`}
        />
      </div>
    </div>
  );
}
