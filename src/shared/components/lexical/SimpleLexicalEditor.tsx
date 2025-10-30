'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { LinkNode } from '@lexical/link';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
// import { useTheme } from 'next-themes';
import { $getRoot, $createTextNode, $createParagraphNode, ElementNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@/shared/components/ui/button';
import { Download } from 'lucide-react';
import './index.css';

// Function to serialize editor content preserving line breaks
function serializeEditorContent(root: ElementNode): string {
  const children = root.getChildren();
  const lines: string[] = [];
  
  children.forEach((child) => {
    const textContent = child.getTextContent();
    // Always include the line, even if empty (preserves line breaks)
    lines.push(textContent);
  });
  
  return lines.join('\n');
}

// Component to initialize and update editor content
function ContentInitializer({ initialContent, forceUpdateKey }: { initialContent?: string; forceUpdateKey?: string }) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  const lastContentRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!editor) return;

    const currentContent = initialContent || '';
    const previousContent = lastContentRef.current;

    // First initialization when editor is empty
    if (!initializedRef.current) {
      if (currentContent && editor) {
        editor.update(() => {
          const root = $getRoot();
          const currentText = root.getTextContent();
          
          // Only initialize if the editor is empty
          if (currentText === '') {
            root.clear();
            
            // Simple text conversion - preserve line breaks
            const lines = currentContent.split('\n');
            lines.forEach((line) => {
              const paragraphNode = $createParagraphNode();
              if (line) {
                paragraphNode.append($createTextNode(line));
              }
              root.append(paragraphNode);
            });
            
            // If no content was added, add one empty paragraph
            if (root.getChildrenSize() === 0) {
              const paragraphNode = $createParagraphNode();
              root.append(paragraphNode);
            }
          }
        });
        
        initializedRef.current = true;
        lastContentRef.current = currentContent;
      }
    } 
    // Force update when forceUpdateKey changes (e.g., after rewrite)
    else if (forceUpdateKey && currentContent !== previousContent) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        
        // Simple text conversion - preserve line breaks
        const lines = currentContent.split('\n');
        lines.forEach((line) => {
          const paragraphNode = $createParagraphNode();
          if (line) {
            paragraphNode.append($createTextNode(line));
          }
          root.append(paragraphNode);
        });
        
        // If no content was added, add one empty paragraph
        if (root.getChildrenSize() === 0) {
          const paragraphNode = $createParagraphNode();
          root.append(paragraphNode);
        }
      });
      
      lastContentRef.current = currentContent;
    }
  }, [editor, initialContent, forceUpdateKey]);

  return null;
}

// Simple toolbar component - minimal implementation to avoid conflicts
function SimpleToolbar({ hideMarkdownShortcuts = false }: { hideMarkdownShortcuts?: boolean }) {
  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/50">
      {!hideMarkdownShortcuts && (
        <div className="text-xs text-muted-foreground">
          Markdown formatting: **bold**, *italic*, # heading, - list, 1. numbered list, &gt; quote, `code`
        </div>
      )}
    </div>
  );
}

interface SimpleLexicalEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  showExportButton?: boolean;
  hideMarkdownShortcuts?: boolean;
  forceUpdateKey?: string; // Key to force content update (e.g., after rewrite)
}

export function SimpleLexicalEditor({
  initialContent,
  onChange,
  placeholder = "Start writing...",
  className = "",
  showToolbar = true,
  showExportButton = false,
  hideMarkdownShortcuts = false,
  forceUpdateKey
}: SimpleLexicalEditorProps) {
  // const { theme } = useTheme();

  const initialConfig = {
    namespace: 'SimpleLexicalEditor',
    theme: {
      root: 'p-4 min-h-[200px] focus:outline-none',
      paragraph: 'mb-2',
      heading: {
        h1: 'text-2xl font-bold mb-4',
        h2: 'text-xl font-semibold mb-3',
        h3: 'text-lg font-medium mb-2',
      },
      list: {
        nested: {
          listitem: 'list-none',
        },
        ol: 'list-decimal list-inside mb-2',
        ul: 'list-disc list-inside mb-2',
        listitem: 'mb-1',
      },
      quote: 'border-l-4 border-muted-foreground pl-4 italic mb-2',
      code: 'bg-muted px-1 py-0.5 rounded text-sm font-mono',
      codeHighlight: {
        atrule: 'text-purple-600',
        attr: 'text-blue-600',
        boolean: 'text-purple-600',
        builtin: 'text-blue-600',
        cdata: 'text-gray-600',
        char: 'text-green-600',
        class: 'text-blue-600',
        'class-name': 'text-blue-600',
        comment: 'text-gray-600',
        constant: 'text-purple-600',
        deleted: 'text-red-600',
        doctype: 'text-gray-600',
        entity: 'text-orange-600',
        function: 'text-blue-600',
        important: 'text-red-600',
        inserted: 'text-green-600',
        keyword: 'text-purple-600',
        namespace: 'text-blue-600',
        number: 'text-purple-600',
        operator: 'text-gray-600',
        prolog: 'text-gray-600',
        property: 'text-blue-600',
        punctuation: 'text-gray-600',
        regex: 'text-orange-600',
        selector: 'text-blue-600',
        string: 'text-green-600',
        symbol: 'text-purple-600',
        tag: 'text-blue-600',
        url: 'text-blue-600',
        variable: 'text-purple-600',
      },
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      LinkNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback((editorState: { read: (fn: () => void) => void }) => {
    if (onChange) {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Debounce the onChange call to prevent excessive re-renders
      timeoutRef.current = setTimeout(() => {
        editorState.read(() => {
          const root = $getRoot();
          // Serialize content preserving line breaks and structure
          const serializedContent = serializeEditorContent(root);
          onChange(serializedContent);
        });
      }, 300); // 300ms debounce
    }
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`border border-border rounded-lg bg-background ${className}`}>
      {showToolbar && <SimpleToolbar hideMarkdownShortcuts={hideMarkdownShortcuts} />}
      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[200px] p-4 focus:outline-none"
              />
            }
            placeholder={<div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleChange} />
          <HistoryPlugin />
          <ListPlugin />
          <CheckListPlugin />
          <TablePlugin />
          <TabIndentationPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <ContentInitializer initialContent={initialContent} forceUpdateKey={forceUpdateKey} />
        </div>
      </LexicalComposer>
      {showExportButton && (
        <div className="flex justify-end p-2 border-t border-border">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      )}
    </div>
  );
}
