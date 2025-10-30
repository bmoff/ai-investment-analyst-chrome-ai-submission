/**
 * Markdown parsing utilities for document generation
 */

export interface ParsedMarkdown {
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'bold' | 'italic' | 'text';
  content: string;
  level?: number; // For headings (1-6)
  items?: string[]; // For lists
  children?: ParsedMarkdown[]; // For nested content
}

/**
 * Parse markdown content into structured elements
 */
export function parseMarkdown(content: string): ParsedMarkdown[] {
  const lines = content.split('\n');
  const elements: ParsedMarkdown[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line) {
      i++;
      continue;
    }

    // Headings (# ## ### etc.)
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '');
      elements.push({
        type: 'heading',
        content: text,
        level: Math.min(level, 6)
      });
    }
    // Unordered lists (- or *)
    else if (line.match(/^[-*]\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[-*]\s+/)) {
        const item = lines[i].trim().replace(/^[-*]\s+/, '');
        listItems.push(item);
        i++;
      }
      i--; // Back up one since we'll increment at the end
      elements.push({
        type: 'list',
        content: '',
        items: listItems
      });
    }
    // Ordered lists (1. 2. etc.)
    else if (line.match(/^\d+\.\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        const item = lines[i].trim().replace(/^\d+\.\s+/, '');
        listItems.push(item);
        i++;
      }
      i--; // Back up one since we'll increment at the end
      elements.push({
        type: 'list',
        content: '',
        items: listItems
      });
    }
    // Blockquotes (>)
    else if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '');
      elements.push({
        type: 'quote',
        content: quoteText
      });
    }
    // Code blocks (```)
    else if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++; // Skip the opening ```
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push({
        type: 'code',
        content: codeLines.join('\n')
      });
    }
    // Regular paragraphs
    else {
      const paragraphLines: string[] = [line];
      i++;
      // Collect consecutive non-empty lines that aren't special markdown
      while (i < lines.length && lines[i].trim() && 
             !lines[i].trim().startsWith('#') &&
             !lines[i].trim().match(/^[-*]\s+/) &&
             !lines[i].trim().match(/^\d+\.\s+/) &&
             !lines[i].trim().startsWith('>') &&
             !lines[i].trim().startsWith('```')) {
        paragraphLines.push(lines[i].trim());
        i++;
      }
      i--; // Back up one since we'll increment at the end
      
      const paragraphText = paragraphLines.join(' ');
      elements.push({
        type: 'paragraph',
        content: paragraphText
      });
    }
    
    i++;
  }

  return elements;
}

/**
 * Parse inline markdown formatting (bold, italic) within text
 */
export function parseInlineMarkdown(text: string): ParsedMarkdown[] {
  const elements: ParsedMarkdown[] = [];
  let currentText = '';
  let i = 0;

  while (i < text.length) {
    // Bold text (**text** or __text__)
    if (text.slice(i, i + 2) === '**' || text.slice(i, i + 2) === '__') {
      if (currentText) {
        elements.push({ type: 'text', content: currentText });
        currentText = '';
      }
      
      const closingIndex = text.indexOf(text.slice(i, i + 2), i + 2);
      if (closingIndex !== -1) {
        const boldText = text.slice(i + 2, closingIndex);
        elements.push({ type: 'bold', content: boldText });
        i = closingIndex + 2;
      } else {
        currentText += text[i];
        i++;
      }
    }
    // Italic text (*text* or _text_)
    else if (text[i] === '*' || text[i] === '_') {
      if (currentText) {
        elements.push({ type: 'text', content: currentText });
        currentText = '';
      }
      
      const closingIndex = text.indexOf(text[i], i + 1);
      if (closingIndex !== -1) {
        const italicText = text.slice(i + 1, closingIndex);
        elements.push({ type: 'italic', content: italicText });
        i = closingIndex + 1;
      } else {
        currentText += text[i];
        i++;
      }
    }
    else {
      currentText += text[i];
      i++;
    }
  }

  if (currentText) {
    elements.push({ type: 'text', content: currentText });
  }

  return elements;
}

/**
 * Convert markdown elements to plain text with basic formatting
 */
export function markdownToPlainText(elements: ParsedMarkdown[]): string {
  return elements.map(element => {
    switch (element.type) {
      case 'heading':
        const prefix = '#'.repeat(element.level || 1);
        return `${prefix} ${element.content}`;
      case 'list':
        return element.items?.map((item, index) => `${index + 1}. ${item}`).join('\n') || '';
      case 'quote':
        return `> ${element.content}`;
      case 'code':
        return `\`\`\`\n${element.content}\n\`\`\``;
      case 'bold':
        return `**${element.content}**`;
      case 'italic':
        return `*${element.content}*`;
      default:
        return element.content;
    }
  }).join('\n\n');
}
