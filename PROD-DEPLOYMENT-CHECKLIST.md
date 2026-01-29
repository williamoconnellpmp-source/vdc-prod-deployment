# PROD Deployment Checklist - Today's Work

**Target Environment:** `vdc-mfa-demo.vercel.app` (new code)  
**Final Goal:** Move `vdc-prod.vercel.app` domain to this project after testing

---

## ✅ Code Status (Already Done)

- [x] MFA login UI with demo users (Submitter 1/2, Approver 1/2)
- [x] Hard logout page (`/life-sciences/app/logout`) that clears everything
- [x] All Logout buttons call `logout(router)` for clean session reset
- [x] Config.js now uses environment variables (just fixed)
- [x] Upload flow with S3 presigned URLs
- [x] API Gateway routes configured (`js97cus4h2.execute-api.us-west-2.amazonaws.com`)

---

## 🔧 Step 1: Vercel Environment Variables (5 minutes)

**Go to:** https://vercel.com/williamoconnellpmp-source/vdc-mfa-demo/settings/environment-variables

**Set these 5 variables (Production environment):**

```
NEXT_PUBLIC_VDC_COGNITO_DOMAIN=https://vdc-prod-williamoconnellpmp.auth.us-west-2.amazoncognito.com
NEXT_PUBLIC_VDC_COGNITO_CLIENT_ID=7qbh0bvokedaou09huur281ti9
NEXT_PUBLIC_VDC_REDIRECT_URI=https://vdc-mfa-demo.vercel.app/life-sciences/app/callback/
NEXT_PUBLIC_VDC_LOGOUT_URI=https://vdc-mfa-demo.vercel.app/life-sciences/app/login/
NEXT_PUBLIC_VDC_API_BASE_URL=https://js97cus4h2.execute-api.us-west-2.amazonaws.com
```

**After setting:** Click "Redeploy" on the latest deployment, or push a new commit to trigger a rebuild.

---

## 🔧 Step 2: AWS Cognito App Client URLs (5 minutes)

**Go to:** AWS Console → Cognito → User Pools → `vdc-prod-williamoconnellpmp` → App integration → App client `7qbh0bvokedaou09huur281ti9`

**Update these URLs:**

1. **Allowed callback URLs** - Add (or ensure it exists):
   ```
   https://vdc-mfa-demo.vercel.app/life-sciences/app/callback/
   ```

2. **Allowed sign-out URLs** - Add (or ensure it exists):
   ```
   https://vdc-mfa-demo.vercel.app/life-sciences/app/login/
   ```

**Note:** Keep the existing `vdc-prod.vercel.app` URLs too (we'll switch later).

---

## 🔧 Step 3: S3 CORS Check (2 minutes)

**Go to:** AWS Console → S3 → `vdc-prod-docs` bucket → Permissions → CORS

**Verify it includes:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "https://vdc-mfa-demo.vercel.app",
      "https://vdc-prod.vercel.app",
      "https://williamoconnellpmp.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 🧪 Step 4: End-to-End Test (15 minutes)

**Test URL:** https://vdc-mfa-demo.vercel.app/life-sciences/app/login/

### Test 1: Submitter Flow
1. Open **Incognito/Private window**
2. Go to login page
3. Click "Submitter 1" → Enter password `Password123!`
4. Enter MFA code from TOTP generator (6 digits)
5. Should land on `/life-sciences/app` (home)
6. Click "Upload Document"
7. Upload a test PDF
8. Should see success message
9. Go to "My Submissions" → Should see your document

### Test 2: Approver Flow
1. **New Incognito window** (or click Logout first)
2. Go to login page
3. Click "Approver 1" → Enter password `Password123!`
4. Enter MFA code
5. Should see "Pending Approvals" in nav
6. Click "Pending Approvals"
7. Should see the document you uploaded as Submitter 1
8. Click "Approve" or "Reject"
9. Go to "Documents" → Should see the document
10. Click document → Should see audit trail

### Test 3: Logout Test
1. Click "Logout" button (anywhere in app)
2. Should redirect to login page
3. Try logging in as a different user (e.g., Submitter 2)
4. Should NOT auto-login as previous user
5. Should require full login + MFA

---

## 🚀 Step 5: Move Production Domain (After Tests Pass)

**Once `vdc-mfa-demo.vercel.app` works end-to-end:**

1. **Vercel:** Go to `vdc-mfa-demo` project → Settings → Domains
2. **Add domain:** `vdc-prod.vercel.app` (or `vdc.williamoconnellpmp.com` if preferred)
3. **Update Vercel env vars** to use the new domain:
   ```
   NEXT_PUBLIC_VDC_REDIRECT_URI=https://vdc-prod.vercel.app/life-sciences/app/callback/
   NEXT_PUBLIC_VDC_LOGOUT_URI=https://vdc-prod.vercel.app/life-sciences/app/login/
   ```
4. **Update Cognito** to use the new domain (replace `vdc-mfa-demo` URLs)
5. **Redeploy** Vercel

---

## 🐛 Common Issues & Fixes

### "Failed to fetch" on upload
- **Check:** S3 CORS includes your Vercel domain
- **Check:** API Gateway CORS includes your Vercel domain

### "400 Bad Request" on logout
- **Check:** `NEXT_PUBLIC_VDC_LOGOUT_URI` matches Cognito "Allowed sign-out URLs" exactly (including trailing slash)

### "Waiting for Authorization Code" stuck
- **Check:** `NEXT_PUBLIC_VDC_REDIRECT_URI` matches Cognito "Allowed callback URLs" exactly (including trailing slash)

### Auto-login as wrong user
- **Use:** Incognito window OR add `?force=true` to login URL
- **Or:** Click Logout first (should clear Cognito session)

### Old UI showing
- **Check:** You're on `vdc-mfa-demo.vercel.app`, not `vdc-prod.vercel.app`
- **Check:** Vercel deployment is from `main` branch of `vdc-prod-deployment` repo

---

## 📝 Quick Reference

**Code Location:**
```
C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
```

**GitHub Repo:**
```
williamoconnellpmp-source/vdc-prod-deployment
Branch: main
```

**Vercel Project:**
```
vdc-mfa-demo
URL: https://vdc-mfa-demo.vercel.app
```

**API Gateway:**
```
https://js97cus4h2.execute-api.us-west-2.amazonaws.com
```

**Cognito:**
```
Domain: vdc-prod-williamoconnellpmp.auth.us-west-2.amazoncognito.com
Client ID: 7qbh0bvokedaou09huur281ti9
```

---

**Ready to start? Begin with Step 1 (Vercel env vars) and work through each step. Let me know if you hit any errors!**
