'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Input } from '@/shared/components/ui/input';
import { 
  Search, 
  CheckSquare,
  Clock, 
  FileText,
  Eye,
  Trash2,
  Download,
  ChevronDown,
  FileImage,
  FileSpreadsheet,
  FileType
} from 'lucide-react';
import { Note } from '@/lib/workspace-data/mockNotes';
import { getNotesFromAnalysisData } from '@/features/analysis/services/notes-service';
import { NoteView } from './NoteView';
import { exportMultipleNotes } from '@/lib/utils/export-utils';

interface ResearchNotesViewProps {
  ticker: string;
  companyName?: string;
  onOpenNote?: (note: Note) => void;
  selectedNote?: Note | null;
  onBackToNotes?: () => void;
  onDeleteNote?: (note: Note) => void;
}

export function ResearchNotesView({
  ticker,
  companyName,
  onOpenNote,
  selectedNote,
  onBackToNotes,
  onDeleteNote,
}: ResearchNotesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Normalize ticker to lowercase for consistent storage
  const normalizedTicker = ticker.toLowerCase();
  
  // Subscribe to analysis store changes to re-render when notes are deleted
  // The getNotesFromAnalysisData function already subscribes to the store
  // Get notes from analysis store (real data) - this will re-run when analysisData changes
  const notes = getNotesFromAnalysisData(normalizedTicker, companyName);

  // Separate brief from other notes
  const briefNote = notes.find(note => note.sourceId === 'brief');
  const otherNotes = notes.filter(note => note.sourceId !== 'brief');
  
  const filteredBrief = briefNote && (
    briefNote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    briefNote.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) ? briefNote : null;
  
  const filteredOtherNotes = otherNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getSourceIcon = (sourceType: Note['sourceType']) => {
    switch (sourceType) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-green-500" />;
    }
  };

  const getSourceBadgeColor = (sourceType: Note['sourceType']) => {
    switch (sourceType) {
      case 'task':
        return 'bg-green-500/20 text-green-500';
    }
  };

  const handleExportAll = async (format: 'pdf' | 'excel' | 'word' | 'csv' = 'pdf') => {
    try {
      await exportMultipleNotes(notes, { 
        format, 
        includeMetadata: true 
      });
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export notes. Please try again.');
    }
  };

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

  // If a note is selected, show the note view
  if (selectedNote) {
    return (
      <div key={`note-view-${selectedNote.id}`} className="h-full">
        <NoteView 
          key={`note-view-component-${selectedNote.id}`}
          note={selectedNote}
          onBack={onBackToNotes || (() => {})}
          onDelete={onDeleteNote}
          companyName={companyName}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="flex-shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Export All Button */}
          {notes.length > 0 && (
            <div className="relative export-menu-container">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All
                <ChevronDown className="w-3 h-3" />
              </Button>
              
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleExportAll('pdf')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <FileImage className="w-4 h-4 text-red-500" />
                      Export All as PDF
                    </button>
                    <button
                      onClick={() => handleExportAll('excel')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-500" />
                      Export All as Excel
                    </button>
                    <button
                      onClick={() => handleExportAll('word')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <FileType className="w-4 h-4 text-blue-500" />
                      Export All as Word
                    </button>
                    <button
                      onClick={() => handleExportAll('csv')}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      Export All as CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Brief Note - Pinned at top with distinct styling */}
            {filteredBrief && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Investment Brief</h3>
                <Card 
                  key={filteredBrief.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20" 
                  onClick={() => onOpenNote?.(filteredBrief)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <CardTitle className="text-base text-blue-900 dark:text-blue-100">{filteredBrief.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          Brief
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNote?.(filteredBrief);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400">Source: {filteredBrief.sourceName}</span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">•</span>
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <Clock className="w-3 h-3" />
                          {new Date(filteredBrief.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3">
                      {filteredBrief.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other Research Notes */}
            {filteredOtherNotes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Research Notes</h3>
                <p className="text-muted-foreground">
                  Run tasks to generate research notes for this company
                </p>
              </div>
            ) : (
              <>
                {filteredOtherNotes.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Research Notes</h3>
                )}
                {filteredOtherNotes.map(note => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOpenNote?.(note)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(note.sourceType)}
                          <CardTitle className="text-base">{note.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${getSourceBadgeColor(note.sourceType)}`}>
                            {note.sourceType}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenNote?.(note);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {onDeleteNote && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNote(note);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Source: {note.sourceName}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex items-center gap-2 mb-3">
                        {note.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
