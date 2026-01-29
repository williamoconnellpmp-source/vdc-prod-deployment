# Fix S3 CORS for vdc-mfa-demo.vercel.app

**Error:** CORS error when uploading directly to S3 (presigned URL)

**Root Cause:** S3 CORS doesn't support wildcards like `*.vercel.app`. It requires exact domain matches.

**Bucket Name:** `vdc-prod-vdcdocs-391611737316-us-west-2`

---

## ✅ Quick Fix: Update S3 CORS in AWS Console (5 minutes)

### Step 1: Find Your S3 Bucket
1. **Go to:** AWS Console → S3
2. **Find the bucket:** `vdc-prod-vdcdocs-391611737316-us-west-2`
3. **Click on the bucket name**

### Step 2: Update CORS Configuration
1. **Click the "Permissions" tab**
2. **Scroll down to "Cross-origin resource sharing (CORS)"**
3. **Click "Edit"**

### Step 3: Add the Exact Domain
**Replace the current CORS configuration with this:**

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "https://vdc-mfa-demo.vercel.app",
      "https://vdc-prod.vercel.app",
      "https://williamoconnellpmp.com",
      "http://localhost:3000",
      "http://localhost:8080"
    ],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
    "MaxAgeSeconds": 3600
  }
]
```

**⚠️ IMPORTANT:** 
- **No wildcards** - S3 doesn't support `*.vercel.app`
- **Exact domains only** - Must include `https://vdc-mfa-demo.vercel.app` explicitly
- **Include protocol** - Must be `https://` not just the domain

### Step 4: Save Changes
1. **Click "Save changes"**
2. **Wait a few seconds** for the change to propagate

---

## ✅ Alternative: Update CloudFormation Template

**If you want to fix it permanently in code:**

### Update `cloudformation/prod/vdc-prod-app.yaml`

**Find the `VdcDocsBucket` resource (around line 61):**

```yaml
VdcDocsBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: !Sub "${ProjectName}-${EnvironmentName}-vdcdocs-${AWS::AccountId}-${AWS::Region}"
    # ... other properties ...
    CorsConfiguration:
      CorsRules:
        - AllowedHeaders:
            - "*"
          AllowedMethods:
            - GET
            - PUT
            - POST
            - HEAD
          AllowedOrigins:
            - "http://localhost:3000"
            - "http://localhost:8080"
            - "https://williamoconnellpmp.com"
            - "https://*.vercel.app"  # ← THIS DOESN'T WORK IN S3!
```

**Change `AllowedOrigins` to explicitly list domains (remove the wildcard):**

```yaml
          AllowedOrigins:
            - "https://vdc-mfa-demo.vercel.app"
            - "https://vdc-prod.vercel.app"
            - "https://williamoconnellpmp.com"
            - "http://localhost:3000"
            - "http://localhost:8080"
```

**Then redeploy the CloudFormation stack:**
```powershell
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment\cloudformation\prod
.\deploy-prod.ps1
```

**⚠️ Note:** CloudFormation will update the S3 CORS, but you can also do it manually in the console (faster for testing).

---

## 🧪 Test S3 CORS Fix

**After updating S3 CORS:**

1. **Open browser DevTools (F12) → Network tab**
2. **Go to:** https://vdc-mfa-demo.vercel.app/life-sciences/app/upload/
3. **Try uploading a file**
4. **Check the Network tab:**
   - Look for the PUT request to the S3 bucket (the presigned URL)
   - Check the Response Headers:
     - Should see `Access-Control-Allow-Origin: https://vdc-mfa-demo.vercel.app`
     - Should see `Access-Control-Allow-Methods: GET, PUT, HEAD`
     - Should see `Access-Control-Allow-Headers: *`

**If you still see CORS errors:**
- `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
- Double-check the domain is exactly `https://vdc-mfa-demo.vercel.app` (with `https://` and no trailing slash)
- Make sure you saved the CORS configuration

---

## 🔍 Verify Current S3 CORS Config

**Use AWS CLI to check current CORS:**

```powershell
aws s3api get-bucket-cors --bucket vdc-prod-vdcdocs-391611737316-us-west-2
```

**Or check via AWS Console:**
1. S3 → Your bucket → Permissions → CORS
2. Take a screenshot and verify the settings

---

## 📝 Quick Checklist

- [ ] Found S3 bucket: `vdc-prod-vdcdocs-391611737316-us-west-2`
- [ ] Updated CORS to include `https://vdc-mfa-demo.vercel.app` (exact domain, no wildcard)
- [ ] Removed `https://*.vercel.app` wildcard (S3 doesn't support it)
- [ ] Saved CORS configuration
- [ ] Tested upload from `vdc-mfa-demo.vercel.app`
- [ ] Checked browser console for CORS errors
- [ ] Verified `Access-Control-Allow-Origin` header in S3 response

---

## 🎯 Why This Happens

**S3 CORS limitations:**
- ❌ **No wildcards** - `*.vercel.app` doesn't work
- ✅ **Exact domains only** - Must list each domain explicitly
- ✅ **Protocol matters** - `https://` vs `http://` are different

**The CloudFormation template has:**
```yaml
- "https://*.vercel.app"  # ← This doesn't work in S3!
```

**But S3 needs:**
```yaml
- "https://vdc-mfa-demo.vercel.app"  # ← Exact domain
- "https://vdc-prod.vercel.app"      # ← Each domain separately
```

---

## 🚀 Quick Fix Steps

1. **AWS Console → S3**
2. **Click bucket:** `vdc-prod-vdcdocs-391611737316-us-west-2`
3. **Permissions tab → CORS → Edit**
4. **Replace with the JSON above** (with exact domains)
5. **Save**
6. **Test upload**

This should fix the S3 CORS issue immediately!
