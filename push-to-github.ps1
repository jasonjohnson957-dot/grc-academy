# ============================================================
#  push-to-github.ps1  (Windows / PowerShell)
#  One-command helper to publish GRC Academy to your GitHub.
#
#  PREREQS (one time):
#    1. Install Git:        https://git-scm.com/download/win
#    2. Install GitHub CLI: https://cli.github.com/   (optional but easiest)
#    3. Run:  gh auth login   (if using GitHub CLI)
#
#  USAGE (from this folder):
#    powershell -ExecutionPolicy Bypass -File .\push-to-github.ps1 -RepoName "grc-academy"
# ============================================================
param(
  [string]$RepoName = "grc-academy",
  [string]$Description = "Executive-friendly training app for IT, cybersecurity, privacy & AI governance frameworks.",
  [ValidateSet("public","private")] [string]$Visibility = "public",
  [string]$GitName = "Jason",
  [string]$GitEmail = "gamingbishop@gmail.com"
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "==> Initializing git repository..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) { git init | Out-Null }

# Ensure a git author identity exists (required before committing).
$existingName  = (git config user.name) 2>$null
$existingEmail = (git config user.email) 2>$null
if ([string]::IsNullOrWhiteSpace($existingName))  { git config user.name  "$GitName";  Write-Host "    set user.name  = $GitName"  -ForegroundColor DarkGray }
if ([string]::IsNullOrWhiteSpace($existingEmail)) { git config user.email "$GitEmail"; Write-Host "    set user.email = $GitEmail" -ForegroundColor DarkGray }

# Normalize line endings quietly (silences the harmless LF/CRLF warnings).
git config core.autocrlf true 2>$null

git add .
git commit -m "Initial commit: GRC Academy framework training app" 2>$null
git branch -M main

# Preferred path: GitHub CLI creates the repo AND pushes in one step.
if (Get-Command gh -ErrorAction SilentlyContinue) {
  Write-Host "==> Creating GitHub repo with GitHub CLI ($Visibility)..." -ForegroundColor Cyan
  gh repo create $RepoName --$Visibility --source "." --description $Description --push
  Write-Host "Done. Your repo is live." -ForegroundColor Green
}
else {
  Write-Host "GitHub CLI not found. Create an EMPTY repo named '$RepoName' at https://github.com/new" -ForegroundColor Yellow
  $user = Read-Host "Enter your GitHub username"
  git remote remove origin 2>$null
  git remote add origin "https://github.com/$user/$RepoName.git"
  Write-Host "==> Pushing to https://github.com/$user/$RepoName ..." -ForegroundColor Cyan
  git push -u origin main
  Write-Host "Done. Your repo is live." -ForegroundColor Green
}
