class Stepsheet < Formula
  desc "Menu bar app for always-on-top checklist overlay for demos"
  homepage "https://github.com/scdozier/stepsheet"
  url "https://github.com/scdozier/stepsheet/archive/refs/tags/v0.1.0.tar.gz"
  sha256 "93b8e0f6fefc7953bdd47c56c8091fd74923a997f0e96db835000fda99a1793b"
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
    end
  end

  def caveats
    <<~EOS
      StepSheet has been installed to:
        #{prefix}/StepSheet.app
      
      To add to your Applications folder:
        ln -sf #{prefix}/StepSheet.app /Applications/StepSheet.app
      
      To launch:
        open #{prefix}/StepSheet.app
    EOS
  end

  test do
    assert_predicate prefix/"StepSheet.app", :exist?
  end
end

