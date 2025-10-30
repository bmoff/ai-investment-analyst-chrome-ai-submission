'use client';

import type { DocumentType } from '@/features/documents/types/document';

interface DocumentTypeSelectorProps {
  selectedType: DocumentType;
  onTypeChange: (type: DocumentType) => void;
  className?: string;
  label?: string;
}

export const DocumentTypeSelector = ({
  selectedType,
  onTypeChange,
  className = '',
  label = 'Document Type'
}: DocumentTypeSelectorProps) => {
  const getDocumentTypeLabel = (type: DocumentType): string => {
    switch (type) {
      case 'financial-analysis': return 'Financial Analysis';
      case 'regulatory-filing': return 'Regulatory Filing';
      case 'market-research': return 'Market Research';
      case 'other': return 'Other';
      default: return 'Unknown';
    }
  };

  const documentTypes: DocumentType[] = ['financial-analysis', 'regulatory-filing', 'market-research', 'other'];

  return (
    <div className={`mb-4 ${className}`}>
      <label className="text-xs font-medium text-muted-foreground mb-2 block">
        {label}
      </label>
      <div className="flex space-x-1 bg-muted/20 p-1 rounded-lg">
        {documentTypes.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              selectedType === type
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {getDocumentTypeLabel(type)}
          </button>
        ))}
      </div>
    </div>
  );
};
