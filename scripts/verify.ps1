# scripts/verify.ps1 — FilmInHere local verification

# Move to repo root (one directory above this script)
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

Write-Host "=== FilmInHere verify ===" -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"
Write-Host ""

# Restore next-env.d.ts if modified
$nextEnvStatus = git status --porcelain -- next-env.d.ts
if ($nextEnvStatus) {
    Write-Host "Restoring next-env.d.ts..." -ForegroundColor Yellow
    git checkout -- next-env.d.ts
}

# Remove tsconfig.tsbuildinfo if present
$buildInfo = Join-Path $repoRoot "tsconfig.tsbuildinfo"
if (Test-Path $buildInfo) {
    Write-Host "Removing tsconfig.tsbuildinfo..." -ForegroundColor Yellow
    Remove-Item -Force $buildInfo
}

# Build
Write-Host "Running npm run build..." -ForegroundColor Cyan
npm run build
$buildExitCode = $LASTEXITCODE

# Result
Write-Host ""
if ($buildExitCode -ne 0) {
    Write-Host "VERIFY FAILED" -ForegroundColor Red
    exit 1
}

# Post-build cleanup — next build regenerates these files
git restore next-env.d.ts
Remove-Item -Force "tsconfig.tsbuildinfo" -ErrorAction SilentlyContinue

# Git summary
Write-Host ""
Write-Host "--- git status --short ---" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "--- git diff --stat ---" -ForegroundColor Cyan
git --no-pager diff --stat

Write-Host ""
Write-Host "VERIFY PASSED" -ForegroundColor Green
exit 0
