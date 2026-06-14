[CmdletBinding()]
param(
  [string]$PrivateDocsDir = "docs-private"
)

$ErrorActionPreference = "Stop"

$repoRoot = (& git rev-parse --show-toplevel).Trim()
$hooksPath = (& git rev-parse --git-path hooks).Trim()

if (-not [System.IO.Path]::IsPathRooted($hooksPath)) {
  $hooksPath = Join-Path $repoRoot $hooksPath
}

$templateDir = Join-Path $repoRoot "scripts/git-hooks"

if (-not (Test-Path $templateDir)) {
  throw "Hook template directory was not found: $templateDir"
}

New-Item -ItemType Directory -Path $hooksPath -Force | Out-Null

$hookNames = @("post-commit", "pre-push")

foreach ($hookName in $hookNames) {
  $source = Join-Path $templateDir $hookName
  $target = Join-Path $hooksPath $hookName

  if (-not (Test-Path $source)) {
    throw "Hook template was not found: $source"
  }

  Copy-Item -Path $source -Destination $target -Force
}

git config --local pagestate.privateDocsDir $PrivateDocsDir

$chmod = Get-Command chmod -ErrorAction SilentlyContinue
if ($chmod) {
  foreach ($hookName in $hookNames) {
    & chmod +x (Join-Path $hooksPath $hookName)
  }
}

Write-Host "Installed PageState Git hooks."
Write-Host "Private docs directory: $PrivateDocsDir"
Write-Host "Hooks directory: $hooksPath"
