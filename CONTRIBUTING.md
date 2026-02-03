# Contributing to StepSheet

Thank you for your interest in contributing to StepSheet! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in the [issue tracker](../../issues)
2. If not, create a new issue using the bug report template
3. Include steps to reproduce, expected behavior, and actual behavior
4. Add screenshots or screen recordings if applicable

### Suggesting Features

1. Check existing issues for similar feature requests
2. Create a new issue using the feature request template
3. Describe the use case and proposed solution
4. Be open to discussion and alternative approaches

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the coding standards below
4. Test your changes locally
5. Commit with clear, descriptive messages
6. Push to your fork and open a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/scdozier/stepsheet.git
cd stepsheet

# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run dist
```

## Coding Standards

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Follow existing code style
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic
- **Types**: Prefer explicit types over `any`

## Project Structure

```
├── main.ts           # Electron main process
├── preload.ts        # Preload script for IPC
├── src/              # React renderer code
│   ├── components/   # React components
│   ├── parser/       # Markdown parsing
│   └── state/        # State management
├── assets/           # Icons and images
└── sample/           # Example markdown files
```

## Testing

Before submitting a PR:

1. Run the test suite: `npm test`
2. Ensure linting passes: `npm run lint`
3. Check code formatting: `npm run format:check`
4. Run the app and verify your changes work
5. Test on macOS (the target platform)
6. Verify keyboard shortcuts still function
7. Check both light and dark themes

**Note:** The CI workflow will automatically run tests, linting, and builds when you open a PR.

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add keyboard shortcut for reset`
- `fix: resolve overlay positioning on external displays`
- `docs: update README with new features`
- `refactor: simplify markdown parser logic`

## CI/CD and Releases

This project uses GitHub Actions for continuous integration and automated releases.

- **CI Workflow**: Runs tests, linting, and builds on every push and PR
- **Release Workflow**: Automatically creates releases with binaries when version tags are pushed

For more details, see:
- [Workflow Documentation](.github/WORKFLOWS.md)
- [Release Process](.github/RELEASE.md)

## Questions?

If you have questions, feel free to:

1. Open a discussion or issue
2. Ask in your pull request

Thank you for contributing!

