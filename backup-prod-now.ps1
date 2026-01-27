# Quick PROD Backup Script
# Run this to backup critical PROD files

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = Join-Path $PSScriptRoot "PROD-BACKUP-$timestamp"

Write-Host "`n=== PROD Backup Script ===" -ForegroundColor Cyan
Write-Host "Creating backup in: $backupDir" -ForegroundColor Yellow

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup critical files
Write-Host "`n[1/3] Backing up login.js..." -ForegroundColor Cyan
Copy-Item -Path "pages\life-sciences\app\login.js" -Destination "$backupDir\login.js" -Force
Write-Host "✅ login.js backed up" -ForegroundColor Green

Write-Host "`n[2/3] Backing up TOTPGenerator.jsx..." -ForegroundColor Cyan
Copy-Item -Path "components\TOTPGenerator.jsx" -Destination "$backupDir\TOTPGenerator.jsx" -Force
Write-Host "✅ TOTPGenerator.jsx backed up" -ForegroundColor Green

Write-Host "`n[3/3] Creating backup README..." -ForegroundColor Cyan
$readme = @"
# PROD Code Backup - $timestamp

## What's Backed Up

1. **login.js** - Consolidated production login page (646 lines)
   - All 4 user credentials displayed
   - MFA codes for Approvers
   - User-specific login buttons
   - GxP disclaimers

2. **TOTPGenerator.jsx** - MFA code generator component

## To Restore

Copy files back to:
- `login.js` → `vdc-prod-deployment\pages\life-sciences\app\login.js`
- `TOTPGenerator.jsx` → `vdc-prod-deployment\components\TOTPGenerator.jsx`

## Full PROD Location

C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
"@
$readme | Out-File -FilePath "$backupDir\README.md" -Encoding UTF8

Write-Host "✅ README created" -ForegroundColor Green

Write-Host "`n=== Backup Complete ===" -ForegroundColor Green
Write-Host "Backup location: $backupDir" -ForegroundColor Cyan
Write-Host "`nTo restore, copy files from backup folder back to PROD folder." -ForegroundColor Yellow
