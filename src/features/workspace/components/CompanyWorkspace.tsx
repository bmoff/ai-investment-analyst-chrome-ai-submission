'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Star, Folder, CheckSquare } from 'lucide-react';
import { ResearchNotesView } from './ResearchNotesView';
import { Note } from '@/lib/workspace-data/mockNotes';
import { getNotesFromAnalysisData, deleteNoteFromAnalysisData } from '@/features/analysis/services/notes-service';

interface CompanyWorkspaceProps {
  ticker: string;
  companyName?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onOpenDocuments?: () => void;
  documentCount?: number;
  onOpenTaskLibrary?: () => void;
  initialNote?: string;
}

export function CompanyWorkspace({
  ticker,
  companyName,
  isFavorite = false,
  onToggleFavorite,
  onOpenDocuments,
  documentCount = 0,
  onOpenTaskLibrary,
  initialNote,
}: CompanyWorkspaceProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  // Auto-open the initial note if provided
  useEffect(() => {
    if (initialNote && !selectedNote) {
      // Find the note that matches the taskId
      const notes = getNotesFromAnalysisData(ticker, companyName);
      const note = notes.find(n => n.sourceId === initialNote);
      if (note) {
        setSelectedNote(note);
      }
    }
  }, [initialNote, ticker, companyName, selectedNote]);

  const handleOpenNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleBackToNotes = () => {
    setSelectedNote(null);
  };

  const handleDeleteNote = (note: Note) => {
    // Don't allow deleting the brief
    if (note.sourceId === 'brief') {
      return;
    }

    // Delete the note from the analysis store
    deleteNoteFromAnalysisData(note);
    
    // If the deleted note is currently open, close it
    if (selectedNote?.id === note.id) {
      setSelectedNote(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex-shrink-0 border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Company name and ticker */}
          <div className="flex items-center gap-2">
            {companyName && (
              <>
                <h1 className="text-lg font-semibold">{companyName}</h1>
                <span className="text-sm text-muted-foreground">({ticker})</span>
              </>
            )}
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            {/* Favorite button */}
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleFavorite}
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite ? 'fill-yellow-500 text-yellow-500' : ''
                  }`}
                />
              </Button>
            )}

            {/* Documents button */}
            {onOpenDocuments && (
              <Button variant="outline" size="sm" onClick={onOpenDocuments}>
                <Folder className="w-4 h-4 mr-2" />
                Documents
                {documentCount > 0 && (
                  <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                    {documentCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Run Task button */}
            {onOpenTaskLibrary && (
              <Button variant="outline" size="sm" onClick={onOpenTaskLibrary}>
                <CheckSquare className="w-4 h-4 mr-2" />
                Run Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Research Notes Content */}
      <div className="flex-1 overflow-hidden">
        <ResearchNotesView
          ticker={ticker}
          companyName={companyName}
          onOpenNote={handleOpenNote}
          selectedNote={selectedNote}
          onBackToNotes={handleBackToNotes}
          onDeleteNote={handleDeleteNote}
        />
      </div>
    </div>
  );
}
