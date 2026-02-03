# Changelog

All notable changes to StepSheet will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD workflows for automated testing and releases
- Automated release process with binary builds for macOS and Windows

## [1.0.0] - 2024-02-03

### Added
- Initial release of StepSheet
- Always-on-top overlay window for checklists
- Markdown-based checklist support with GitHub-style task lists
- Keyboard shortcuts for navigation and task completion
  - `Cmd+Shift+N` - Jump to next unchecked item
  - `Cmd+Shift+X` - Mark current item complete
  - `Cmd+Shift+H` - Toggle overlay visibility
  - `Cmd+Shift+R` - Reload current markdown file
- Progress persistence across app restarts
- Light and dark theme support
- Adjustable text size (80-150%)
- File library for quick access to frequently used checklists
- Click-through mode to interact with apps behind overlay
- Support for nested tasks
- Hidden presenter notes via HTML comments
- Inline image support in checklists
- Menu bar app with system tray integration
- macOS and Windows support

### Technical
- Built with Electron, React 18, and TypeScript
- Markdown parsing with unified/remark and GFM support
- Comprehensive test suite with Jest
- ESLint and Prettier for code quality
- electron-builder for cross-platform packaging

