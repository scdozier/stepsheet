# Homebrew Tap Setup

This document describes how to set up the Homebrew tap for distributing StepSheet on macOS.

## Overview

Since StepSheet is not code-signed, macOS users would normally need to run `xattr -cr` commands to bypass Gatekeeper. By distributing via Homebrew with a formula that builds from source, users can install without any security warnings since locally-built apps aren't quarantined.

## Setup Instructions

### 1. Create the Homebrew Tap Repository

Create a new GitHub repository named `homebrew-tap` at:
```
https://github.com/scdozier/homebrew-tap
```

### 2. Add the Formula

Create `Formula/stepsheet.rb` in that repository with the following content:

```ruby
class Stepsheet < Formula
  desc "Menu bar app for always-on-top checklist overlay for demos"
  homepage "https://github.com/scdozier/stepsheet"
  url "https://github.com/scdozier/stepsheet/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "0019dfc4b32d63c1392aa264aed2253c1e0c2fb09216f8e2cc269bbfb8bb49b5"
  license "MIT"

  depends_on "node@18"

  def install
    system "npm", "ci"
    system "npm", "run", "build"
    system "npm", "run", "dist:mac"
    
    # Find and install the .app bundle
    app = Dir["release/mac*/*.app"].first
    if app
      prefix.install app
      bin.write_exec_script prefix/"StepSheet.app/Contents/MacOS/StepSheet"
    end
  end

  def caveats
    <<~EOS
      StepSheet has been installed. To launch:
        open #{prefix}/StepSheet.app
      
      Or add to your Applications folder:
        ln -sf #{prefix}/StepSheet.app /Applications/StepSheet.app
    EOS
  end

  test do
    assert_predicate prefix/"StepSheet.app", :exist?
  end
end
```

### 3. Update for New Releases

When releasing a new version:

1. Tag the new version in stepsheet repo: `git tag v0.2.0 && git push --tags`
2. Get the new SHA256:
   ```bash
   curl -sL https://github.com/scdozier/stepsheet/archive/refs/tags/v0.2.0.tar.gz | shasum -a 256
   ```
3. Update the formula in homebrew-tap with new version and sha256

## User Installation

Users install with:

```bash
brew tap scdozier/tap
brew install stepsheet
```

## Notes

- Build time is approximately 2-5 minutes due to npm install and electron-builder
- The formula depends on node@18 which Homebrew will install if needed
- No code signing is required since the app is built locally

