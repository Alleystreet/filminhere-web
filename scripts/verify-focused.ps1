param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$TargetPath
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
  Write-Error $Message
  exit 1
}

Write-Host "== FilmInHere Focused Verify =="
Write-Host "Target: $TargetPath"
Write-Host ""

Write-Host "== Changed files =="
$changedFiles = @(git --no-pager diff --name-only)
if ($LASTEXITCODE -ne 0) { Fail "git diff --name-only failed." }

if ($changedFiles.Count -eq 0) {
  Write-Host "No unstaged working-tree diff found. Checking staged diff..."
  $changedFiles = @(git --no-pager diff --cached --name-only)
  if ($LASTEXITCODE -ne 0) { Fail "git diff --cached --name-only failed." }
}

if ($changedFiles.Count -eq 0) {
  Write-Host "No changed files found."
} else {
  $changedFiles | ForEach-Object { Write-Host $_ }
}

Write-Host ""
Write-Host "== Focused ESLint =="
npx eslint $TargetPath
if ($LASTEXITCODE -ne 0) { Fail "Focused ESLint failed for $TargetPath." }

Write-Host ""
Write-Host "== Whitespace / conflict-marker check =="
git --no-pager diff --check
if ($LASTEXITCODE -ne 0) { Fail "git diff --check failed." }

Write-Host ""
Write-Host "Focused verify passed."
