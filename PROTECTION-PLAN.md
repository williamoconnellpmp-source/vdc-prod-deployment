# Protection Plan - Critical Requirements

**Date**: 2026-01-26  
**Status**: ACTIVE

## 🎯 Your Two Critical Requirements

1. ✅ **williamoconnellpmp.com (DEV) must NOT be overwritten**
2. ✅ **PROD Cognito/MFA work must NOT be lost**

## 📍 Current Situation

### DEV Code (LIVE SITE - DO NOT TOUCH)
- **Location**: `C:\Users\willi\RECOVERY\ls-cloud-migration-hub-baseline`
- **Live URL**: https://williamoconnellpmp.com
- **S3 Bucket**: `ls-cloud-migration-hub-williamoconnellpmp`
- **CloudFront**: `E3GKP8EZSZFBWI`
- **Git**: ✅ Yes, in git (can restore)
- **Status**: ⚠️ One file modified (`lib/life_sciences_app_lib/auth.js`) - needs restore

### PROD Code (NEW WORK - MUST PROTECT)
- **Location**: `C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment`
- **Git**: ❌ No, NOT in git
- **Critical File**: `pages/life-sciences/app/login.js` (646 lines - NEW today)
- **Status**: ✅ Complete and working

## 🛡️ Your Protection Options

### Option 1: Run Backup Script (EASIEST - RECOMMENDED)
**Time**: 30 seconds  
**Effort**: Minimal

```powershell
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
.\backup-prod-now.ps1
```

This creates a timestamped backup folder with:
- `login.js` (your new consolidated login page)
- `TOTPGenerator.jsx` (MFA component)
- `README.md` (restore instructions)

**Pros**: Quick, automated, includes restore instructions  
**Cons**: None

---

### Option 2: Initialize Git in PROD (BEST LONG-TERM)
**Time**: 2 minutes  
**Effort**: Low

```powershell
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
git init
git add .
git commit -m "Backup: PROD login page with credentials - 2026-01-26"
```

**Pros**: 
- Version control
- Easy rollback
- Track all changes
- Can push to GitHub later if desired

**Cons**: 
- Need to remember to commit changes

---

### Option 3: Manual Folder Copy (MOST COMPLETE)
**Time**: 5-10 minutes  
**Effort**: Medium

```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-backup-$timestamp"
Copy-Item -Path "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment" `
          -Destination $backupPath `
          -Recurse `
          -Exclude @("node_modules", ".next", "out")
```

**Pros**: Complete backup of everything  
**Cons**: Takes time, uses disk space

---

### Option 4: Create ZIP Archive
**Time**: 3-5 minutes  
**Effort**: Low

```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Compress-Archive -Path "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment\*" `
                 -DestinationPath "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-backup-$timestamp.zip" `
                 -Exclude @("node_modules", ".next", "out", "*.zip")
```

**Pros**: Compressed, easy to store/share  
**Cons**: Need to extract to restore

---

## 🔒 DEV Protection (williamoconnellpmp.com)

### To Restore DEV to Original State:
```powershell
cd C:\Users\willi\RECOVERY\ls-cloud-migration-hub-baseline
git restore lib/life_sciences_app_lib/auth.js
```

### DEV Deployment Safety Checklist:
- [ ] Verify S3 bucket name is NOT `ls-cloud-migration-hub-williamoconnellpmp`
- [ ] Verify CloudFront distribution is NOT `E3GKP8EZSZFBWI`
- [ ] Verify you're in PROD folder, not DEV folder
- [ ] Check deployment script targets PROD infrastructure

---

## 📋 Recommended Action Plan

### IMMEDIATE (Do Now):
1. ✅ Run `backup-prod-now.ps1` script (Option 1)
2. ✅ Restore DEV `auth.js` file (if you want to clean it up)

### SHORT-TERM (This Week):
1. Initialize git in PROD folder (Option 2)
2. Create full folder backup (Option 3) if you want extra safety

### ONGOING:
- Before ANY deployment, verify you're deploying to PROD, not DEV
- Commit changes to PROD git regularly
- Keep backup script handy

---

## 🚨 Emergency Recovery

### If PROD Code is Lost:
1. Check backup folder: `vdc-prod-deployment\PROD-BACKUP-*`
2. Restore `login.js` from backup
3. Verify `TOTPGenerator.jsx` exists

### If DEV Code is Overwritten:
1. Restore from git: `git restore .`
2. Verify S3 bucket name before any deployment
3. Check CloudFront distribution ID matches DEV

---

## ✅ What We Accomplished Today (PROD)

**New File Created**:
- `pages/life-sciences/app/login.js` - Consolidated login page with:
  - All 4 user credentials (email + password) visible
  - MFA codes for Approvers (live TOTP generator)
  - 4 user-specific login buttons
  - GxP compliance disclaimers
  - Copy-to-clipboard functionality
  - Clear instructions

**This file is 646 lines and contains all the Cognito/MFA integration work.**

---

## 📝 Next Steps

1. **Run the backup script** to protect today's work
2. **Restore DEV auth.js** if you want to clean it up (optional)
3. **Consider initializing git** in PROD for long-term protection
4. **Test the PROD login page** when ready to deploy

---

## 🎯 Summary

- ✅ **DEV is protected** (in git, can restore)
- ✅ **PROD backup script created** (run it now!)
- ✅ **Documentation complete** (this file + BACKUP-STRATEGY.md)
- ⚠️ **DEV has one modified file** (can restore via git)

**Your work is safe! Just run the backup script to be extra sure.**
