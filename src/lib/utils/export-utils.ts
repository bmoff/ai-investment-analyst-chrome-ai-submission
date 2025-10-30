import { Note } from '@/lib/workspace-data/mockNotes';
import { generatePDFDocument, generateWordDocument, generateMultiplePDFDocuments, generateMultipleWordDocuments } from './document-generation';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'word' | 'csv';
  includeMetadata: boolean;
}

/**
 * Export a note to a downloadable file
 * @param note - The note to export
 * @param options - Export configuration options
 */
export async function exportNote(note: Note, options: ExportOptions = { format: 'pdf', includeMetadata: true }): Promise<void> {
  try {
    switch (options.format) {
      case 'pdf':
        await generatePDFDocument(note, options.includeMetadata);
        break;
      case 'excel':
        const excelContent = generateExcelContent(note, options.includeMetadata);
        const timestamp = new Date().toISOString().split('T')[0];
        const safeTitle = note.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
        const filename = `${safeTitle}-${timestamp}.csv`;
        downloadFile(excelContent, filename, 'text/csv');
        break;
      case 'word':
        await generateWordDocument(note, options.includeMetadata);
        break;
      case 'csv':
        const csvContent = generateCSVContent(note, options.includeMetadata);
        const csvTimestamp = new Date().toISOString().split('T')[0];
        const csvSafeTitle = note.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
        const csvFilename = `${csvSafeTitle}-${csvTimestamp}.csv`;
        downloadFile(csvContent, csvFilename, 'text/csv');
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export note: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Old HTML generation functions removed - now using proper document generation

/**
 * Generate Excel-compatible CSV content
 */
function generateExcelContent(note: Note, includeMetadata: boolean): string {
  let csv = '';
  
  if (includeMetadata) {
    csv += 'Field,Value\n';
    csv += `Title,"${note.title}"\n`;
    csv += `Source,"${note.sourceName}"\n`;
    csv += `Created,"${new Date(note.createdAt).toLocaleString()}"\n`;
    csv += `Updated,"${new Date(note.updatedAt).toLocaleString()}"\n`;
    csv += `Tags,"${note.tags.join(', ')}"\n`;
    csv += '\n';
  }
  
  csv += 'Content\n';
  csv += `"${note.content.replace(/"/g, '""')}"\n`;
  
  return csv;
}

// Old HTML generation functions removed - now using proper document generation

/**
 * Generate Excel-compatible CSV content
 */

/**
 * Generate CSV content for data analysis
 */
function generateCSVContent(note: Note, includeMetadata: boolean): string {
  let csv = '';
  
  if (includeMetadata) {
    csv += 'Field,Value\n';
    csv += `Title,"${note.title}"\n`;
    csv += `Source,"${note.sourceName}"\n`;
    csv += `Created,"${new Date(note.createdAt).toLocaleString()}"\n`;
    csv += `Updated,"${new Date(note.updatedAt).toLocaleString()}"\n`;
    csv += `Tags,"${note.tags.join(', ')}"\n`;
    csv += '\n';
  }
  
  // Split content into lines for better CSV structure
  const lines = note.content.split('\n');
  csv += 'Line,Content\n';
  lines.forEach((line, index) => {
    csv += `${index + 1},"${line.replace(/"/g, '""')}"\n`;
  });
  
  return csv;
}


// Old HTML generation functions removed - now using proper document generation

/**
 * Generate multiple Excel content
 */

/**
 * Generate multiple Excel content
 */
function generateMultipleExcelContent(notes: Note[]): string {
  let csv = 'Note,Title,Source,Created,Updated,Tags,Content\n';
  
  notes.forEach((note, index) => {
    const row = [
      index + 1,
      `"${note.title.replace(/"/g, '""')}"`,
      `"${note.sourceName.replace(/"/g, '""')}"`,
      `"${new Date(note.createdAt).toLocaleString()}"`,
      `"${new Date(note.updatedAt).toLocaleString()}"`,
      `"${note.tags.join(', ').replace(/"/g, '""')}"`,
      `"${note.content.replace(/"/g, '""')}"`
    ].join(',');
    csv += row + '\n';
  });
  
  return csv;
}

// Old HTML generation functions removed - now using proper document generation

/**
 * Generate multiple Excel content
 */

/**
 * Generate multiple CSV content
 */
function generateMultipleCSVContent(notes: Note[]): string {
  let csv = 'Note,Title,Source,Created,Updated,Tags,Content\n';
  
  notes.forEach((note, index) => {
    const row = [
      index + 1,
      `"${note.title.replace(/"/g, '""')}"`,
      `"${note.sourceName.replace(/"/g, '""')}"`,
      `"${new Date(note.createdAt).toLocaleString()}"`,
      `"${new Date(note.updatedAt).toLocaleString()}"`,
      `"${note.tags.join(', ').replace(/"/g, '""')}"`,
      `"${note.content.replace(/"/g, '""')}"`
    ].join(',');
    csv += row + '\n';
  });
  
  return csv;
}

/**
 * Download a file with the given content
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export multiple notes as a single file
 */
export async function exportMultipleNotes(notes: Note[], options: ExportOptions = { format: 'pdf', includeMetadata: true }): Promise<void> {
  try {
    switch (options.format) {
      case 'pdf':
        await generateMultiplePDFDocuments(notes, options.includeMetadata);
        break;
      case 'excel':
        const excelContent = generateMultipleExcelContent(notes);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `investment-research-${timestamp}.csv`;
        downloadFile(excelContent, filename, 'text/csv');
        break;
      case 'word':
        await generateMultipleWordDocuments(notes, options.includeMetadata);
        break;
      case 'csv':
        const csvContent = generateMultipleCSVContent(notes);
        const csvTimestamp = new Date().toISOString().split('T')[0];
        const csvFilename = `investment-research-${csvTimestamp}.csv`;
        downloadFile(csvContent, csvFilename, 'text/csv');
        break;
      default:
        throw new Error(`Unsupported export format for multiple notes: ${options.format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
