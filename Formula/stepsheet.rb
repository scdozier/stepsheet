class Stepsheet < Formula
  desc "Menu bar app for always-on-top checklist overlay for demos"
  homepage "https://github.com/scdozier/stepsheet"
  head "https://github.com/scdozier/stepsheet.git", branch: "main"
  license "MIT"

  # Stable version - update SHA when releasing
  stable do
    url "https://github.com/scdozier/stepsheet/archive/refs/tags/v0.1.0.tar.gz"
    sha256 "338f3f035e79b6138b7e9c41fe940e3a63e5261da30dfed2463ef642b5cfbe03"
  end

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

