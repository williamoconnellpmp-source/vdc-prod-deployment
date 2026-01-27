# Backup Strategy - Critical Protection Plan

**Date**: 2026-01-26  
**Status**: ACTIVE PROTECTION MODE

## 🛡️ Critical Requirements

1. **DEV Code (Live Site)**: `C:\Users\willi\RECOVERY\ls-cloud-migration-hub-baseline`
   - **LIVE URL**: https://williamoconnellpmp.com
   - **S3 Bucket**: `ls-cloud-migration-hub-williamoconnellpmp`
   - **CloudFront**: `E3GKP8EZSZFBWI`
   - **Status**: ✅ **MUST NOT BE OVERWRITTEN**
   - **Git**: Yes, in git repository (can restore via git)

2. **PROD Code (New Work)**: `C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment`
   - **Status**: ✅ **MUST NOT BE LOST**
   - **Git**: No, NOT in git repository
   - **Critical Files Changed Today**:
     - `pages/life-sciences/app/login.js` (NEW - consolidated login with credentials)
     - Uses existing: `components/TOTPGenerator.jsx` (already exists)

## 📋 Backup Options

### Option 1: Manual Folder Copy (RECOMMENDED - Safest)
**Pros**: Complete backup, no dependencies, can restore entire folder  
**Cons**: Takes time, uses disk space

**Steps**:
```powershell
# Create timestamped backup
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-backup-$timestamp"

# Copy entire PROD folder (excluding large dirs)
Copy-Item -Path "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment" `
          -Destination $backupPath `
          -Recurse `
          -Exclude @("node_modules", ".next", "out", ".git")
```

### Option 2: Critical Files Only Backup (FASTEST)
**Pros**: Quick, small, focuses on what changed  
**Cons**: Need to know which files changed

**Critical Files to Backup**:
- `pages/life-sciences/app/login.js` (646 lines - NEW consolidated login page)
- `components/TOTPGenerator.jsx` (already exists, but backup anyway)
- `lib/life_sciences_app_lib/auth.js` (if modified)
- `lib/life_sciences_app_lib/config.js` (if modified)

### Option 3: Initialize Git in PROD (BEST LONG-TERM)
**Pros**: Version control, easy rollback, track changes  
**Cons**: Need to set up git

**Steps**:
```powershell
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
git init
git add .
git commit -m "Backup: PROD login page with credentials display - 2026-01-26"
```

### Option 4: Create ZIP Archive
**Pros**: Compressed, easy to store/share  
**Cons**: Need to extract to restore

**Steps**:
```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Compress-Archive -Path "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment\*" `
                 -DestinationPath "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-backup-$timestamp.zip" `
                 -Exclude @("node_modules", ".next", "out")
```

## 🔒 DEV Protection (williamoconnellpmp.com)

### Current Status
- ✅ DEV code is in git repository
- ✅ Can restore via: `git restore <file>`
- ⚠️ One file modified: `lib/life_sciences_app_lib/auth.js` (added CONFIG import)

### To Restore DEV to Original:
```powershell
cd C:\Users\willi\RECOVERY\ls-cloud-migration-hub-baseline
git restore lib/life_sciences_app_lib/auth.js
```

### DEV Deployment Safety
- **NEVER** deploy PROD code to: `ls-cloud-migration-hub-williamoconnellpmp` S3 bucket
- **NEVER** update CloudFront: `E3GKP8EZSZFBWI`
- **ALWAYS** verify bucket/distribution before deploying

## 📝 What We Changed Today (PROD)

### New File Created:
- `pages/life-sciences/app/login.js` - Consolidated login page showing:
  - All 4 user credentials (email + password)
  - MFA codes for Approvers (via TOTPGenerator component)
  - 4 user buttons (one per account)
  - GxP disclaimers
  - Copy-to-clipboard functionality

### Files Used (Already Existed):
- `components/TOTPGenerator.jsx` - MFA code generator (uses otplib)
- `lib/life_sciences_app_lib/config.js` - Cognito configuration
- `lib/life_sciences_app_lib/auth.js` - Auth utilities

## ✅ Recommended Action Plan

1. **IMMEDIATE**: Create critical files backup (Option 2 - fastest)
2. **SHORT-TERM**: Initialize git in PROD folder (Option 3 - best practice)
3. **ONGOING**: Before any deployment, verify you're deploying to PROD, not DEV

## 🚨 Emergency Recovery

If PROD code is lost:
1. Check backup folder: `C:\Users\willi\ls-cloud-migration-hub\vdc-prod-backup-*`
2. Restore `pages/life-sciences/app/login.js` from backup
3. Verify `components/TOTPGenerator.jsx` exists

If DEV code is overwritten:
1. Restore from git: `git restore .`
2. Verify S3 bucket name before any deployment
3. Check CloudFront distribution ID
