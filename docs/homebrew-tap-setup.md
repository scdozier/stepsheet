# Homebrew Distribution

The Homebrew formula is located at `Formula/stepsheet.rb` in this repository.

## Installation

```bash
brew tap scdozier/stepsheet
brew install stepsheet
```

## Updating for New Releases

When releasing a new version:

1. Tag the new version: `git tag v0.2.0 && git push --tags`
2. Get the new SHA256:
   ```bash
   curl -sL https://github.com/scdozier/stepsheet/archive/refs/tags/v0.2.0.tar.gz | shasum -a 256
   ```
3. Update `Formula/stepsheet.rb` with the new version and sha256

## Notes

- Build time is approximately 2-5 minutes due to npm install and electron-builder
- The formula depends on node@18 which Homebrew will install if needed
- No code signing is required since the app is built locally
