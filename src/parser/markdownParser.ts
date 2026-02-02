import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root, Content, List, ListItem, Paragraph, Text, Heading, Html, Image } from 'mdast';

// Types for structured output
export interface ImageData {
  src: string;
  alt: string;
}

export interface ChecklistItem {
  text: string;
  checked: boolean;
  children: ChecklistItem[];
  notes?: string; // Hidden presenter notes from HTML comments
  image?: ImageData; // Optional inline image
}

export interface Section {
  title: string;
  level: number;
  items: ChecklistItem[];
  notes?: string; // Section-level notes from HTML comments
}

export interface ParsedMarkdown {
  sections: Section[];
  title?: string; // Top-level H1 if present
}

// Extract text content from a paragraph or inline content (excluding images)
function extractText(node: Paragraph | Content): string {
  if (node.type === 'text') {
    return (node as Text).value;
  }
  if (node.type === 'image') {
    // Skip images in text extraction
    return '';
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map((child) => extractText(child as Content)).join('');
  }
  return '';
}

// Extract image data from a paragraph node
function extractImage(node: Paragraph | Content): ImageData | undefined {
  if (node.type === 'image') {
    const img = node as Image;
    return { src: img.url, alt: img.alt || '' };
  }
  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      const image = extractImage(child as Content);
      if (image) return image;
    }
  }
  return undefined;
}

// Extract HTML comment content
function extractComment(html: string): string | undefined {
  const match = html.match(/<!--\s*([\s\S]*?)\s*-->/);
  return match ? match[1].trim() : undefined;
}

// Parse list items recursively
function parseListItems(list: List, pendingNote?: string): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  let currentNote: string | undefined = pendingNote;

  for (const listItem of list.children as ListItem[]) {
    const item: ChecklistItem = {
      text: '',
      checked: listItem.checked ?? false,
      children: [],
    };

    // Assign pending note to this item
    if (currentNote) {
      item.notes = currentNote;
      currentNote = undefined;
    }

    for (const child of listItem.children || []) {
      if (child.type === 'paragraph') {
        item.text = extractText(child).trim();
        // Also extract any inline image
        const image = extractImage(child);
        if (image) {
          item.image = image;
        }
      } else if (child.type === 'list') {
        item.children = parseListItems(child as List);
      } else if (child.type === 'html') {
        const comment = extractComment((child as Html).value);
        if (comment) {
          item.notes = item.notes ? `${item.notes}\n${comment}` : comment;
        }
      }
    }

    if (item.text) {
      items.push(item);
    }
  }

  return items;
}

// Main parser function
export function parseMarkdown(markdownContent: string): ParsedMarkdown {
  const processor = unified().use(remarkParse).use(remarkGfm);
  const tree = processor.parse(markdownContent) as Root;

  const result: ParsedMarkdown = {
    sections: [],
  };

  let currentSection: Section | null = null;
  let pendingNote: string | undefined;

  for (const node of tree.children) {
    if (node.type === 'heading') {
      const heading = node as Heading;
      const title = extractText(heading).trim();

      if (heading.depth === 1 && !result.title) {
        // First H1 is the document title
        result.title = title;
      } else {
        // Create new section for H2+ or subsequent H1s
        if (currentSection) {
          result.sections.push(currentSection);
        }
        currentSection = {
          title,
          level: heading.depth,
          items: [],
        };
        if (pendingNote) {
          currentSection.notes = pendingNote;
          pendingNote = undefined;
        }
      }
    } else if (node.type === 'list') {
      const items = parseListItems(node as List, pendingNote);
      pendingNote = undefined;

      if (currentSection) {
        currentSection.items.push(...items);
      } else {
        // Items before any heading go into an untitled section
        if (result.sections.length === 0 || result.sections[0].title !== '') {
          result.sections.unshift({ title: '', level: 0, items: [] });
        }
        result.sections[0].items.push(...items);
      }
    } else if (node.type === 'html') {
      const comment = extractComment((node as Html).value);
      if (comment) {
        pendingNote = pendingNote ? `${pendingNote}\n${comment}` : comment;
      }
    }
  }

  // Push the last section
  if (currentSection) {
    result.sections.push(currentSection);
  }

  return result;
}

export default parseMarkdown;

