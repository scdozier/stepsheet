import { parseMarkdown } from './markdownParser';
import * as fs from 'fs';
import * as path from 'path';

// Test data
const sampleMarkdown = `# Demo Checklist

<!-- Welcome note -->

## Setup Phase
<!-- Setup notes here -->

- [ ] First task
  - [ ] Subtask 1
  - [x] Subtask 2 (done)
- [x] Completed task

## Second Section

- [ ] Another task
  - [ ] Nested item
    - [ ] Deeply nested
`;

describe('parseMarkdown', () => {
  describe('basic parsing', () => {
    it('parses document title from H1', () => {
      const result = parseMarkdown(sampleMarkdown);
      expect(result.title).toBe('Demo Checklist');
    });

    it('parses sections from headings', () => {
      const result = parseMarkdown(sampleMarkdown);
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].title).toBe('Setup Phase');
      expect(result.sections[1].title).toBe('Second Section');
    });

    it('parses task items with correct checked state', () => {
      const result = parseMarkdown(sampleMarkdown);
      const setupItems = result.sections[0].items;
      expect(setupItems).toHaveLength(2);
      expect(setupItems[0].checked).toBe(false);
      expect(setupItems[1].checked).toBe(true);
    });

    it('parses nested task items', () => {
      const result = parseMarkdown(sampleMarkdown);
      const firstTask = result.sections[0].items[0];
      expect(firstTask.children).toHaveLength(2);
      expect(firstTask.children[0].text).toBe('Subtask 1');
      expect(firstTask.children[1].checked).toBe(true);
    });

    it('extracts HTML comments as notes', () => {
      const result = parseMarkdown(sampleMarkdown);
      expect(result.sections[0].notes).toBe('Welcome note');
    });

    it('handles deeply nested items', () => {
      const result = parseMarkdown(sampleMarkdown);
      const deepItem = result.sections[1].items[0].children[0].children[0];
      expect(deepItem.text).toBe('Deeply nested');
    });
  });

  describe('edge cases - empty input', () => {
    it('handles empty string', () => {
      const result = parseMarkdown('');
      expect(result.sections).toHaveLength(0);
      expect(result.title).toBeUndefined();
    });

    it('handles whitespace only', () => {
      const result = parseMarkdown('   \n\n   \t  ');
      expect(result.sections).toHaveLength(0);
      expect(result.title).toBeUndefined();
    });
  });

  describe('edge cases - malformed markdown', () => {
    it('handles missing checkbox brackets', () => {
      const md = `## Section\n- Item without checkbox\n- [ ] Item with checkbox`;
      const result = parseMarkdown(md);
      expect(result.sections[0].items).toHaveLength(2);
      expect(result.sections[0].items[0].checked).toBe(false);
    });

    it('handles unclosed HTML comments', () => {
      const md = `## Section\n<!-- unclosed comment\n- [ ] Task`;
      const result = parseMarkdown(md);
      expect(result.sections).toHaveLength(1);
    });

    it('handles heading without content', () => {
      const md = `# Title\n## Empty Section`;
      const result = parseMarkdown(md);
      expect(result.title).toBe('Title');
      expect(result.sections[0].title).toBe('Empty Section');
      expect(result.sections[0].items).toHaveLength(0);
    });

    it('handles items before any heading', () => {
      const md = `- [ ] Task before heading\n## Section\n- [ ] Task after`;
      const result = parseMarkdown(md);
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].title).toBe('');
      expect(result.sections[0].items[0].text).toBe('Task before heading');
    });
  });

  describe('edge cases - special characters', () => {
    it('handles special characters in task text', () => {
      // Note: <html> is parsed as HTML element and removed from text
      const md = `## Section\n- [ ] Task with & "quotes" and 'apostrophes'`;
      const result = parseMarkdown(md);
      expect(result.sections[0].items[0].text).toBe(`Task with & "quotes" and 'apostrophes'`);
    });

    it('preserves angle brackets in escaped form', () => {
      const md = `## Section\n- [ ] Task with \\<brackets\\> in text`;
      const result = parseMarkdown(md);
      expect(result.sections[0].items[0].text).toContain('brackets');
    });

    it('handles unicode characters', () => {
      const md = `## 日本語セクション\n- [ ] タスク with émojis 🎉`;
      const result = parseMarkdown(md);
      expect(result.sections[0].title).toBe('日本語セクション');
      expect(result.sections[0].items[0].text).toBe('タスク with émojis 🎉');
    });

    it('handles backticks (inline code) in task text', () => {
      const md = '## Section\n- [ ] Run `npm test` command';
      const result = parseMarkdown(md);
      expect(result.sections[0].items[0].text).toBe('Run `npm test` command');
    });

    it('handles bold text in task', () => {
      const md = '## Section\n- [ ] This is **bold** text';
      const result = parseMarkdown(md);
      expect(result.sections[0].items[0].text).toBe('This is bold text');
    });

    it('handles italic text in task', () => {
      const md = '## Section\n- [ ] This is *italic* text';
      const result = parseMarkdown(md);
      expect(result.sections[0].items[0].text).toBe('This is italic text');
    });
  });

  describe('images', () => {
    it('extracts inline image from task', () => {
      const md = '## Section\n- [ ] Task with image ![alt text](image.png)';
      const result = parseMarkdown(md);
      expect(result.sections[0].items[0].image).toBeDefined();
      expect(result.sections[0].items[0].image?.src).toBe('image.png');
      expect(result.sections[0].items[0].image?.alt).toBe('alt text');
    });

    it('handles image with empty alt text', () => {
      const md = '## Section\n- [ ] Task ![](image.png)';
      const result = parseMarkdown(md);
      expect(result.sections[0].items[0].image?.alt).toBe('');
    });
  });

  describe('HTML comments', () => {
    it('handles comment attached to item', () => {
      const md = `## Section\n- [ ] Task\n  <!-- Item note -->`;
      const result = parseMarkdown(md);
      expect(result.sections[0].items[0].notes).toBe('Item note');
    });

    it('handles comment before section', () => {
      const md = `<!-- Section note -->\n## Section\n- [ ] Task`;
      const result = parseMarkdown(md);
      expect(result.sections[0].notes).toBe('Section note');
    });

    it('handles empty comment', () => {
      const md = `## Section\n<!---->\n- [ ] Task`;
      const result = parseMarkdown(md);
      expect(result.sections[0].items).toHaveLength(1);
    });
  });

  describe('heading levels', () => {
    it('handles H2 and H3 sections', () => {
      const md = `# Title\n## H2 Section\n### H3 Section\n- [ ] Task`;
      const result = parseMarkdown(md);
      expect(result.title).toBe('Title');
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].level).toBe(2);
      expect(result.sections[1].level).toBe(3);
    });

    it('handles multiple H1 headings', () => {
      const md = `# First Title\n## Section 1\n# Second Title\n## Section 2`;
      const result = parseMarkdown(md);
      expect(result.title).toBe('First Title');
      expect(result.sections.some((s) => s.title === 'Second Title')).toBe(true);
    });
  });

  describe('sample file parsing', () => {
    it('parses sample/tech-demo.md if exists', () => {
      const samplePath = path.join(process.cwd(), 'sample/tech-demo.md');
      if (fs.existsSync(samplePath)) {
        const content = fs.readFileSync(samplePath, 'utf-8');
        const result = parseMarkdown(content);
        expect(result).toBeDefined();
        expect(result.sections).toBeDefined();
      }
    });
  });
});
