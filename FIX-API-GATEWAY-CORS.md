# Fix API Gateway CORS for vdc-mfa-demo.vercel.app

**Error:** `Network error: Failed to fetch` when calling API Gateway from `vdc-mfa-demo.vercel.app`

**Root Cause:** API Gateway CORS doesn't allow requests from `https://vdc-mfa-demo.vercel.app`

---

## ✅ Quick Fix: Update API Gateway CORS in AWS Console (5 minutes)

### Step 1: Find Your API Gateway
1. **Go to:** AWS Console → API Gateway
2. **Find the API:** Look for `vdc-prod-http-api` or search for API ID `js97cus4h2`
3. **Click on the API name**

### Step 2: Update CORS Configuration
1. **In the left sidebar, click "CORS"**
2. **You should see the current CORS configuration**

**Current config (from CloudFormation) should show:**
- AllowOrigins: `*` (allows all origins)
- AllowMethods: `GET`, `POST`, `OPTIONS`
- AllowHeaders: `authorization`, `content-type`

**If it shows `*` for origins, it should work. But let's verify:**

### Step 3: Check if CORS is Applied to Routes
1. **Go to "Routes" in the left sidebar**
2. **Click on a route** (e.g., `POST /documents/upload/init`)
3. **Check if CORS is enabled** - there should be an "OPTIONS" route for preflight

**If OPTIONS route is missing:**
- CORS preflight requests will fail
- You need to add OPTIONS routes or enable CORS on the API level

### Step 4: Redeploy the API (If You Made Changes)
1. **Go to "Stages" in the left sidebar**
2. **Click on your stage** (usually `$default` or `prod`)
3. **Click "Deploy"** (or "Redeploy")
4. **Select the stage** and click "Deploy"

**⚠️ IMPORTANT:** CORS changes only take effect after redeploying the API!

---

## ✅ Alternative: Update CloudFormation Template (If Console Doesn't Work)

If the API Gateway CORS is set to `*` but still not working, you might need to explicitly list origins.

### Update `cloudformation/prod/vdc-prod-app.yaml`

**Find the `VdcHttpApi` resource (around line 426):**

```yaml
VdcHttpApi:
  Type: AWS::ApiGatewayV2::Api
  Properties:
    Name: !Sub "${ProjectName}-${EnvironmentName}-http-api"
    ProtocolType: HTTP
    CorsConfiguration:
      AllowCredentials: false
      AllowHeaders:
        - authorization
        - content-type
      AllowMethods:
        - GET
        - POST
        - OPTIONS
      AllowOrigins:
        - "*"
```

**Change `AllowOrigins` to explicitly list domains:**

```yaml
      AllowOrigins:
        - "https://vdc-mfa-demo.vercel.app"
        - "https://vdc-prod.vercel.app"
        - "https://williamoconnellpmp.com"
        - "http://localhost:3000"
        - "http://localhost:8080"
```

**Then redeploy the CloudFormation stack:**
```powershell
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment\cloudformation\prod
# Run your deploy script
.\deploy-prod.ps1
```

---

## 🧪 Test CORS Fix

**After updating CORS and redeploying:**

1. **Open browser DevTools (F12) → Network tab**
2. **Go to:** https://vdc-mfa-demo.vercel.app/life-sciences/app/upload/
3. **Try uploading a file**
4. **Check the Network tab:**
   - Look for the request to `/documents/upload/init`
   - Check the Response Headers:
     - Should see `Access-Control-Allow-Origin: https://vdc-mfa-demo.vercel.app` (or `*`)
     - Should see `Access-Control-Allow-Methods: GET, POST, OPTIONS`
     - Should see `Access-Control-Allow-Headers: authorization, content-type`

**If you see CORS errors in console:**
- `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
- The CORS configuration isn't working → Check Step 3 above (OPTIONS routes)

---

## 🔍 Debugging: Check Current CORS Config

**Use AWS CLI to check current CORS:**

```powershell
aws apigatewayv2 get-api --api-id js97cus4h2 --query "CorsConfiguration"
```

**Or check via AWS Console:**
1. API Gateway → Your API → CORS
2. Take a screenshot and verify the settings

---

## 📝 Quick Checklist

- [ ] Verified API Gateway CORS includes `vdc-mfa-demo.vercel.app` (or `*`)
- [ ] Verified OPTIONS routes exist for preflight requests
- [ ] Redeployed the API Gateway stage after CORS changes
- [ ] Tested upload from `vdc-mfa-demo.vercel.app`
- [ ] Checked browser console for CORS errors
- [ ] Verified `Access-Control-Allow-Origin` header in response

---

## 🎯 Most Likely Issue

**The API Gateway CORS is set to `*` in CloudFormation, but:**
1. **The API wasn't redeployed** after the CORS config was set
2. **OPTIONS routes are missing** for preflight requests
3. **The CORS config isn't applied at the route level** (only at API level)

**Quick fix:** Go to API Gateway → CORS → Make sure it's configured → Redeploy the stage.
