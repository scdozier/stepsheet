# DemoOverlay

A macOS menu bar app that displays an always-on-top checklist overlay for live demos and presentations. Load markdown files with task lists and track your progress during demos with keyboard shortcuts.

## Features

- **Always-on-top overlay** — stays visible over other applications
- **Markdown-based checklists** — create task lists in plain markdown
- **Keyboard shortcuts** — navigate and complete items without mouse
- **Progress persistence** — checked items survive app restarts
- **Light/dark themes** — toggle to match your presentation
- **Adjustable text size** — scale from 80% to 150%
- **File library** — quick access to frequently used checklists
- **Click-through mode** — interact with apps behind the overlay

## Requirements

- **macOS** (tested on macOS 12+)
- **Node.js 18+**
- npm or compatible package manager

## Installation

```bash
git clone <repository-url>
cd demo_overlay
npm install
```

## Running

### Development

```bash
npm start          # Build and launch the app
npm run build      # Build TypeScript and bundle React
npm run watch      # Watch mode for TypeScript
```

### Production Distribution

```bash
npm run dist       # Create .dmg installer in release/ folder
```

This generates a signed `.app` bundle using electron-builder.

## Creating Markdown Files

DemoOverlay parses standard markdown with GitHub-style task lists.

### Format Guide

| Element | Syntax | Description |
|---------|--------|-------------|
| Title | `# Title` | Becomes the window title |
| Section | `## Section` | Groups related tasks |
| Task | `- [ ] Task` | Unchecked item |
| Completed | `- [x] Task` | Pre-checked item |
| Nested | `  - [ ] Subtask` | Indent with 2 spaces |
| Note | `<!-- comment -->` | Hidden presenter notes |
| Image | `![Alt](path.png)` | Embedded images |

### Example Markdown File

```markdown
# Product Demo -- Customer Name

<!-- Remember to mute Slack before starting -->

## Setup
- [ ] Open IDE with project
  - [ ] Load workspace
  - [ ] Verify extensions loaded
- [ ] Start dev server
- [x] Seed test data

## Feature Demo
<!-- Keep this section to 5 minutes -->
- [ ] Show dashboard
- [ ] Navigate to user settings
  - [ ] Create new user
  - [ ] Assign permissions
- [ ] Demonstrate search
  - [ ] Full-text search
  - [ ] Filter by category

## Q&A
- [ ] Have benchmarks ready
- [ ] Roadmap slides available

## Wrap-up
- [ ] Share follow-up link
- [ ] Collect feedback
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+Shift+N` | Jump to next unchecked item |
| `Cmd+Shift+X` | Mark current item complete |
| `Cmd+Shift+H` | Toggle overlay visibility |
| `Cmd+Shift+R` | Reload current markdown file |

## Settings

Access settings via the ⚙️ button in the header:

- **Theme toggle** (☀️/🌙) — Switch between light and dark mode
- **Highlight current step** — Visual indicator on the active item
- **Text size** — Adjust from 80% to 150%
- **Markdown Files** — File library for quick access to checklists

## Menu Bar

Click the menu bar icon for:

- **Load Markdown File...** — Open file picker
- **Toggle Overlay** — Show/hide the window
- **Click-Through Mode** — Allow clicks to pass through
- **Reset Checklist** — Uncheck all items
- **Quit** — Exit the application

## License

MIT
