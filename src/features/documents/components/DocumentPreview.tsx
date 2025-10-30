'use client';

import { FileText, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { DocumentStorageService } from '@/features/documents/services/document-storage-service';
import type { CompanyDocument, DocumentType } from '@/features/documents/types/document';

interface DocumentPreviewProps {
  document: CompanyDocument;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  className?: string;
}

export const DocumentPreview = ({
  document,
  onRemove,
  showRemoveButton = true,
  className = ''
}: DocumentPreviewProps) => {
  const getDocumentTypeColor = (type: DocumentType): string => {
    switch (type) {
      case 'financial-analysis': return 'text-blue-500 bg-blue-500/10';
      case 'regulatory-filing': return 'text-green-500 bg-green-500/10';
      case 'market-research': return 'text-purple-500 bg-purple-500/10';
      case 'other': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getDocumentTypeLabel = (type: DocumentType): string => {
    switch (type) {
      case 'financial-analysis': return 'Financial Analysis';
      case 'regulatory-filing': return 'Regulatory Filing';
      case 'market-research': return 'Market Research';
      case 'other': return 'Other';
      default: return 'Unknown';
    }
  };

  return (
    <div className={`p-3 bg-muted/20 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate" title={document.name}>
            {document.name}
          </span>
          <span className={`px-2 py-0.5 text-xs rounded-full ${getDocumentTypeColor(document.type)}`}>
            {getDocumentTypeLabel(document.type)}
          </span>
        </div>
        {showRemoveButton && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
        <span>{DocumentStorageService.formatFileSize(document.size)}</span>
        <span>{DocumentStorageService.formatDate(document.uploadedAt)}</span>
      </div>
    </div>
  );
};
