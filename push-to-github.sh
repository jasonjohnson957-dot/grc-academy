#!/usr/bin/env bash
# ============================================================
#  push-to-github.sh  (macOS / Linux / Git Bash)
#  One-command helper to publish GRC Academy to your GitHub.
#
#  PREREQS (one time):
#    1. Install Git and (recommended) GitHub CLI: https://cli.github.com/
#    2. Run:  gh auth login   (if using GitHub CLI)
#
#  USAGE (from this folder):
#    chmod +x push-to-github.sh
#    ./push-to-github.sh grc-academy public
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"

REPO_NAME="${1:-grc-academy}"
VISIBILITY="${2:-public}"   # public | private
DESC="Executive-friendly training app for IT, cybersecurity, privacy & AI governance frameworks."

echo "==> Initializing git repository..."
[ -d .git ] || git init >/dev/null
git add .
git commit -m "Initial commit: GRC Academy framework training app" >/dev/null 2>&1 || true
git branch -M main

if command -v gh >/dev/null 2>&1; then
  echo "==> Creating GitHub repo with GitHub CLI ($VISIBILITY)..."
  gh repo create "$REPO_NAME" --"$VISIBILITY" --source "." --description "$DESC" --push
  echo "Done. Your repo is live."
else
  echo "GitHub CLI not found. Create an EMPTY repo named '$REPO_NAME' at https://github.com/new"
  read -rp "Enter your GitHub username: " USER
  git remote remove origin 2>/dev/null || true
  git remote add origin "https://github.com/$USER/$REPO_NAME.git"
  echo "==> Pushing..."
  git push -u origin main
  echo "Done. Your repo is live."
fi
