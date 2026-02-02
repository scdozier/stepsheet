import { parseMarkdown, ParsedMarkdown } from './markdownParser';

// Simple test runner for Node.js
function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

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

// Tests
test('parses document title from H1', () => {
  const result = parseMarkdown(sampleMarkdown);
  assert(result.title === 'Demo Checklist', `Expected title "Demo Checklist", got "${result.title}"`);
});

test('parses sections from headings', () => {
  const result = parseMarkdown(sampleMarkdown);
  assert(result.sections.length === 2, `Expected 2 sections, got ${result.sections.length}`);
  assert(result.sections[0].title === 'Setup Phase', `Expected "Setup Phase", got "${result.sections[0].title}"`);
  assert(result.sections[1].title === 'Second Section', `Expected "Second Section", got "${result.sections[1].title}"`);
});

test('parses task items with correct checked state', () => {
  const result = parseMarkdown(sampleMarkdown);
  const setupItems = result.sections[0].items;
  assert(setupItems.length === 2, `Expected 2 items in setup, got ${setupItems.length}`);
  assert(setupItems[0].checked === false, 'First task should be unchecked');
  assert(setupItems[1].checked === true, 'Second task should be checked');
});

test('parses nested task items', () => {
  const result = parseMarkdown(sampleMarkdown);
  const firstTask = result.sections[0].items[0];
  assert(firstTask.children.length === 2, `Expected 2 subtasks, got ${firstTask.children.length}`);
  assert(firstTask.children[0].text === 'Subtask 1', `Expected "Subtask 1", got "${firstTask.children[0].text}"`);
  assert(firstTask.children[1].checked === true, 'Subtask 2 should be checked');
});

test('extracts HTML comments as notes', () => {
  const result = parseMarkdown(sampleMarkdown);
  // The comment before the section heading gets attached to the section
  // "Welcome note" appears before "Setup Phase" heading
  assert(result.sections[0].notes === 'Welcome note', `Expected section notes "Welcome note", got "${result.sections[0].notes}"`);
});

test('handles deeply nested items', () => {
  const result = parseMarkdown(sampleMarkdown);
  const deepItem = result.sections[1].items[0].children[0].children[0];
  assert(deepItem.text === 'Deeply nested', `Expected "Deeply nested", got "${deepItem.text}"`);
});

test('parses the sample cogops-demo.md correctly', async () => {
  const fs = await import('fs');
  const path = await import('path');
  // When bundled with esbuild, we need to use process.cwd() instead of __dirname
  const samplePath = path.join(process.cwd(), 'sample/cogops-demo.md');
  const content = fs.readFileSync(samplePath, 'utf-8');
  
  const result = parseMarkdown(content);
  
  assert(result.title === 'CogOps Demo Checklist', `Expected title "CogOps Demo Checklist", got "${result.title}"`);
  assert(result.sections.length === 5, `Expected 5 sections, got ${result.sections.length}`);
  assert(result.sections[0].title === 'Setup Phase', `First section should be "Setup Phase"`);
  assert(result.sections[0].items.length === 4, `Setup Phase should have 4 items`);
  assert(result.sections[0].items[3].checked === true, 'Fourth item should be checked');
});

console.log('\n--- Markdown Parser Tests ---\n');

