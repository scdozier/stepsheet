// Types for checklist data structure
// These will be provided by the markdown parser in the future

export interface ImageData {
  src: string;
  alt: string;
}

export interface ChecklistItemData {
  id: string;
  text: string;
  isCompleted: boolean;
  isActive?: boolean;
  children?: ChecklistItemData[];
  image?: ImageData; // Optional inline image
  notes?: string; // Hidden presenter notes from HTML comments
}

export interface SectionData {
  id: string;
  title: string;
  items: ChecklistItemData[];
  isCollapsed?: boolean;
}

export interface ChecklistData {
  title?: string;
  sections: SectionData[];
}
