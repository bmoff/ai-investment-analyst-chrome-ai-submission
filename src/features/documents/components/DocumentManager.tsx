'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FileUpload } from '@/features/documents/components/FileUpload';
import { DocumentTypeSelector } from '@/features/documents/components/DocumentTypeSelector';
import { DocumentPreview } from '@/features/documents/components/DocumentPreview';
import { documentStorageService, DocumentStorageService } from '@/features/documents/services/document-storage-service';
import type { CompanyDocument, DocumentType } from '@/features/documents/types/document';

interface DocumentManagerProps {
  ticker: string;
  isOpen: boolean;
  onClose: () => void;
  onDocumentSelect?: (document: CompanyDocument) => void;
  mode?: 'manage' | 'select'; // 'manage' for viewing/uploading, 'select' for choosing existing
}

export const DocumentManager = ({ 
  ticker, 
  isOpen, 
  onClose, 
  onDocumentSelect,
  mode = 'manage' 
}: DocumentManagerProps) => {
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<CompanyDocument | null>(null);
  const [filter, setFilter] = useState<DocumentType | 'all'>('all');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<DocumentType>('other');

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = documentStorageService.getCompanyDocuments(ticker);
      setDocuments(response.documents);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [ticker]);

  // Load documents when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, loadDocuments]);

  const handleFileUpload = async (file: File) => {
    setUploadFile(file);
    setIsUploading(true);
    
    try {
      // Use the selected type instead of auto-detecting
      const document = await documentStorageService.storeDocument(ticker, file, uploadType);
      
      if (document) {
        setDocuments(prev => [document, ...prev]);
        setUploadFile(null);
        setUploadType('other'); // Reset to default
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileRemove = () => {
    setUploadFile(null);
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const success = documentStorageService.deleteDocument(ticker, documentId);
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(null);
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleSelectDocument = (document: CompanyDocument) => {
    if (mode === 'select') {
      onDocumentSelect?.(document);
      onClose();
    } else {
      setSelectedDocument(document);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    filter === 'all' || doc.type === filter
  );

  const getDocumentTypeLabel = (type: DocumentType): string => {
    switch (type) {
      case 'financial-analysis': return 'Financial Analysis';
      case 'regulatory-filing': return 'Regulatory Filing';
      case 'market-research': return 'Market Research';
      case 'other': return 'Other';
      default: return 'Unknown';
    }
  };

  const getDocumentTypeColor = (type: DocumentType): string => {
    switch (type) {
      case 'financial-analysis': return 'text-blue-500 bg-blue-500/10';
      case 'regulatory-filing': return 'text-green-500 bg-green-500/10';
      case 'market-research': return 'text-purple-500 bg-purple-500/10';
      case 'other': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
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
          className="bg-background border border-border rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">
                {mode === 'select' ? 'Select Document' : 'Company Documents'} - {ticker}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'select' 
                  ? 'Choose a document for analysis' 
                  : `Manage documents for ${ticker} (${documents.length} total)`
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row h-[70vh] min-h-[500px]">
            {/* Left Panel - Document List */}
            <div className="flex-1 flex flex-col border-r-0 lg:border-r border-b lg:border-b-0 border-border/50">
              {/* Filter Tabs */}
              <div className="px-4 sm:px-6 py-3 border-b border-border/50">
                <div className="flex space-x-1 overflow-x-auto pb-1">
                  {['all', 'financial-analysis', 'regulatory-filing', 'market-research', 'other'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType as DocumentType | 'all')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        filter === filterType
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {filterType === 'all' ? 'All' : getDocumentTypeLabel(filterType as DocumentType)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {filter === 'all' ? 'No documents uploaded yet' : `No ${filter} documents`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDocuments.map((document) => (
                      <motion.div
                        key={document.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border border-border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                          selectedDocument?.id === document.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/20'
                        }`}
                        onClick={() => handleSelectDocument(document)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium text-foreground truncate">
                                {document.name}
                              </span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getDocumentTypeColor(document.type)}`}>
                                {getDocumentTypeLabel(document.type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{DocumentStorageService.formatFileSize(document.size)}</span>
                              <span>{DocumentStorageService.formatDate(document.uploadedAt)}</span>
                            </div>
                          </div>
                          {mode === 'manage' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(document.id);
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Upload or Selected Document */}
            <div className="w-full lg:w-80 flex flex-col">
              {mode === 'manage' ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <h3 className="text-sm font-medium mb-4">Upload New Document</h3>
                  
                  {/* Document Type Selector */}
                  <DocumentTypeSelector
                    selectedType={uploadType}
                    onTypeChange={setUploadType}
                  />

                  <FileUpload
                    onFileSelect={handleFileUpload}
                    onFileRemove={handleFileRemove}
                    selectedFile={uploadFile}
                    isProcessing={isUploading}
                    className="mb-4"
                    title="Upload new document"
                    description="Drag and drop your file here, or click to browse"
                    processingText="Uploading document..."
                  />
                  
                  {/* Show selected file preview */}
                  {uploadFile && (
                    <DocumentPreview
                      document={{
                        id: 'temp',
                        ticker: ticker,
                        name: uploadFile.name,
                        type: uploadType,
                        file: uploadFile,
                        uploadedAt: new Date(),
                        size: uploadFile.size
                      }}
                      onRemove={() => {
                        setUploadFile(null);
                        setUploadType('other');
                      }}
                      className="mb-4"
                    />
                  )}
                  {selectedDocument && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <h3 className="text-sm font-medium mb-3">Selected Document</h3>
                      <DocumentPreview
                        document={selectedDocument}
                        showRemoveButton={false}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <h3 className="text-sm font-medium mb-4">Select Document for Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a document from the list to use for analysis.
                  </p>
                  {selectedDocument && (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Selected for Analysis</span>
                      </div>
                      <div className="text-sm text-foreground">{selectedDocument.name}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-border/50 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {documents.length} document{documents.length !== 1 ? 's' : ''} stored
            </div>
            <div className="flex items-center gap-2">
              {mode === 'select' && selectedDocument && (
                <Button onClick={() => onDocumentSelect?.(selectedDocument)}>
                  Use Selected Document
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                {mode === 'select' ? 'Cancel' : 'Close'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
