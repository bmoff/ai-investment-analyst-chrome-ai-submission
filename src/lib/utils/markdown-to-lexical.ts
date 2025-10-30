// import { $createHeadingNode, $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
// import { TRANSFORMERS } from '@lexical/markdown';

/**
 * Convert markdown string to Lexical EditorState
 * This is a simplified conversion that handles basic markdown elements
 */
export function convertMarkdownToLexical(markdown: string): string {
  // For now, we'll return the markdown as-is since our SimpleLexicalEditor
  // handles markdown conversion internally through the MarkdownShortcutPlugin
  return markdown;
}

/**
 * Parse markdown content and extract basic structure
 */
export function parseMarkdownStructure(markdown: string) {
  const lines = markdown.split('\n');
  const structure: Array<{ type: string; content: string; level?: number }> = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('# ')) {
      structure.push({ type: 'heading', content: trimmed.substring(2), level: 1 });
    } else if (trimmed.startsWith('## ')) {
      structure.push({ type: 'heading', content: trimmed.substring(3), level: 2 });
    } else if (trimmed.startsWith('### ')) {
      structure.push({ type: 'heading', content: trimmed.substring(4), level: 3 });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      structure.push({ type: 'list-item', content: trimmed.substring(2) });
    } else if (trimmed.startsWith('1. ')) {
      structure.push({ type: 'numbered-item', content: trimmed.substring(3) });
    } else if (trimmed.startsWith('> ')) {
      structure.push({ type: 'quote', content: trimmed.substring(2) });
    } else if (trimmed.startsWith('```')) {
      structure.push({ type: 'code-block', content: trimmed });
    } else if (trimmed.length > 0) {
      structure.push({ type: 'paragraph', content: trimmed });
    } else {
      structure.push({ type: 'empty', content: '' });
    }
  });

  return structure;
}

/**
 * Convert markdown to plain text (for search and preview)
 */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove heading markers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
    .replace(/`(.*?)`/g, '$1') // Remove code markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove link markers
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/^\s*>\s+/gm, '') // Remove quote markers
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n\s*\n/g, '\n') // Remove extra newlines
    .trim();
}

/**
 * Extract title from markdown content
 */
export function extractTitleFromMarkdown(markdown: string): string {
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return trimmed.substring(2);
    }
  }
  
  // If no H1 found, use first non-empty line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && !trimmed.startsWith('#')) {
      return trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed;
    }
  }
  
  return 'Untitled';
}

/**
 * Generate preview text from markdown
 */
export function generatePreviewFromMarkdown(markdown: string, maxLength: number = 150): string {
  const plainText = markdownToPlainText(markdown);
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...'
    : plainText;
}
