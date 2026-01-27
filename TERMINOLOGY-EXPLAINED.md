# Terminology Explained - DEV vs Next Dev vs PROD

**Date**: 2026-01-26

## 🎯 Three Different Things

### 1. **DEV** (Your Live Site)
- **What it is**: Your currently live website
- **Location**: `C:\Users\willi\RECOVERY\ls-cloud-migration-hub-baseline`
- **Live URL**: https://williamoconnellpmp.com
- **S3 Bucket**: `ls-cloud-migration-hub-williamoconnellpmp`
- **CloudFront**: `E3GKP8EZSZFBWI`
- **Status**: ✅ **LIVE AND RUNNING** - Do not overwrite!
- **Purpose**: Your actual portfolio/demo site that visitors see
- **Git**: Yes, in git repository

**This is your "production" live site, but we call it "DEV" to distinguish it from the new PROD code.**

---

### 2. **Next Dev** (Development Server)
- **What it is**: A local development tool (Next.js dev server)
- **Command**: `npm run dev` or `npm run dev -p 8080`
- **Purpose**: Run your code locally for testing before deploying
- **URL**: `http://localhost:8080` (or `http://localhost:3000`)
- **Status**: Temporary - only runs when you start it
- **When to use**: Testing changes locally before deploying

**This is NOT an environment - it's a tool to test code locally.**

---

### 3. **PROD** (New Production Code)
- **What it is**: Your new codebase with Cognito/MFA features
- **Location**: `C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment`
- **Status**: ✅ **NEW CODE** - Not deployed yet
- **Purpose**: Enhanced version with real Cognito authentication
- **Git**: No, not in git (yet)
- **Features**: 
  - Real Cognito login
  - MFA support
  - Consolidated login page with credentials display
  - Enhanced workflow

**This is your "new production" code that will eventually replace or run alongside DEV.**

---

## 📊 Comparison Table

| Term | Type | Location | Status | Purpose |
|------|------|----------|--------|---------|
| **DEV** | Live Site | `RECOVERY\ls-cloud-migration-hub-baseline` | ✅ Live at williamoconnellpmp.com | Current portfolio/demo |
| **Next Dev** | Tool | Local (runs `npm run dev`) | ⚠️ Temporary | Test code locally |
| **PROD** | Codebase | `ls-cloud-migration-hub\vdc-prod-deployment` | ✅ Ready to deploy | New enhanced version |

---

## 🔄 How They Work Together

### Current Workflow:
1. **DEV** = Your live site (untouched, safe)
2. **PROD** = Your new code (being developed)
3. **Next Dev** = Tool to test PROD code locally

### Testing Flow:
```
PROD Code → Next Dev Server → http://localhost:8080 → Test in Browser
```

### Deployment Flow (Future):
```
PROD Code → Build → Deploy to NEW S3/CloudFront → New URL
```

---

## ⚠️ Important Distinctions

### "DEV" is Confusing Because:
- It's called "DEV" but it's actually your **live production site**
- It's in a folder called "RECOVERY" (historical reasons)
- It's the one that's **currently live** at williamoconnellpmp.com

### "PROD" is Your New Code:
- It's called "PROD" but it's **not deployed yet**
- It's the enhanced version with Cognito/MFA
- It will eventually be deployed to a **separate** infrastructure

### "Next Dev" is Just a Tool:
- It's the development server command
- It runs locally on your machine
- It's temporary - stops when you close it
- Used to test both DEV and PROD code locally

---

## 🎯 What You're Doing Now

**Current Task**: Testing PROD code locally using Next Dev

1. **Code Location**: `vdc-prod-deployment` (PROD folder)
2. **Test Tool**: `npm run dev` (Next Dev server)
3. **Test URL**: `http://localhost:8080/life-sciences/app/login`
4. **Goal**: See the new login page with 4 user credentials

**This does NOT affect your live DEV site at all!**

---

## 📝 Summary

- **DEV** = Live site (williamoconnellpmp.com) - **DON'T TOUCH**
- **PROD** = New code folder - **YOUR CURRENT WORK**
- **Next Dev** = Local testing tool - **RUN `npm run dev` TO TEST**

---

## 🚀 Quick Reference

### To Test PROD Code Locally:
```powershell
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
npm run dev -p 8080
# Then open: http://localhost:8080/life-sciences/app/login
```

### To Deploy PROD (Future):
```powershell
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
npm run build
# Then deploy to NEW S3 bucket (NOT the DEV bucket!)
```

### To Restore DEV (If Needed):
```powershell
cd C:\Users\willi\RECOVERY\ls-cloud-migration-hub-baseline
git restore .
```
