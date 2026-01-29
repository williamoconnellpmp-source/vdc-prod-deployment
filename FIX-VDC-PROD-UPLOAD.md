# Fix "Failed to fetch" on vdc-prod.vercel.app

**Issue:** Upload page shows "Failed to fetch" error on `vdc-prod.vercel.app`

**Root Causes (check in order):**

---

## ✅ Fix 1: Vercel Environment Variables (Most Likely)

**Go to:** https://vercel.com/williamoconnellpmp-source/vdc-prod/settings/environment-variables

**Verify these 5 variables exist (Production environment):**

```
NEXT_PUBLIC_VDC_COGNITO_DOMAIN=https://vdc-prod-williamoconnellpmp.auth.us-west-2.amazoncognito.com
NEXT_PUBLIC_VDC_COGNITO_CLIENT_ID=7qbh0bvokedaou09huur281ti9
NEXT_PUBLIC_VDC_REDIRECT_URI=https://vdc-prod.vercel.app/life-sciences/app/callback/
NEXT_PUBLIC_VDC_LOGOUT_URI=https://vdc-prod.vercel.app/life-sciences/app/login/
NEXT_PUBLIC_VDC_API_BASE_URL=https://js97cus4h2.execute-api.us-west-2.amazonaws.com
```

**⚠️ CRITICAL:** Make sure `NEXT_PUBLIC_VDC_API_BASE_URL` is set correctly!

**After updating:** Click "Redeploy" on the latest deployment.

---

## ✅ Fix 2: API Gateway CORS

**Go to:** AWS Console → API Gateway → `vdc-prod-http-api` (or find the API with ID `js97cus4h2`)

**Check CORS configuration:**
1. Go to the API → CORS
2. Verify `Access-Control-Allow-Origin` includes:
   - `https://vdc-prod.vercel.app`
   - `https://vdc-mfa-demo.vercel.app`
   - `https://williamoconnellpmp.com`

**If missing:** Add the origin and redeploy the API.

---

## ✅ Fix 3: Check Browser Console

**Open DevTools (F12) → Console tab**

**Look for:**
- `[apiFetch] Making request:` - Shows the URL being called
- `[apiFetch] Fetch error:` - Shows the exact network error
- `Network error: ...` - Tells you if it's CORS, connection refused, etc.

**Common errors:**
- `CORS policy: No 'Access-Control-Allow-Origin' header` → Fix API Gateway CORS
- `Failed to fetch` (no details) → Check if API Gateway URL is correct
- `401 Unauthorized` → Check if JWT token is being sent (should see `hasToken: true` in console)

---

## ✅ Fix 4: Verify Code is Updated

**Check if `vdc-prod` Vercel project is connected to the right repo:**

1. Go to: https://vercel.com/williamoconnellpmp-source/vdc-prod/settings/git
2. Verify it's connected to: `williamoconnellpmp-source/vdc-prod-deployment`
3. Verify Production Branch is: `main`
4. Check latest deployment → should show recent commits

**If it's connected to old repo:** Connect it to `vdc-prod-deployment` repo.

---

## 🧪 Quick Test

**After fixes, test:**

1. Open **Incognito window**
2. Go to: https://vdc-prod.vercel.app/life-sciences/app/login/
3. Login as Submitter 1 (password: `Password123!`, enter MFA code)
4. Go to Upload page
5. Open DevTools Console (F12)
6. Try uploading a file
7. Check console for `[apiFetch]` logs

**Expected console output:**
```
[apiFetch] Making request: {
  url: "https://js97cus4h2.execute-api.us-west-2.amazonaws.com/documents/upload/init",
  method: "POST",
  hasToken: true,
  tokenPreview: "eyJraWQiOiJcL1..."
}
```

**If you see `hasToken: false`:** User isn't logged in properly (Cognito issue)

**If you see a CORS error:** API Gateway CORS needs fixing

**If you see connection refused:** API Gateway URL is wrong

---

## 🎯 Recommendation

**If you're testing the new PROD code, use `vdc-mfa-demo.vercel.app` instead:**

- It has the latest code
- It's isolated from the old `vdc-prod` project
- Follow the `PROD-DEPLOYMENT-CHECKLIST.md` for setup

**Once `vdc-mfa-demo.vercel.app` works end-to-end, then move the `vdc-prod.vercel.app` domain to that project.**

---

## 📞 Still Not Working?

**Share:**
1. Browser console errors (F12 → Console)
2. Network tab → Failed request → Headers & Response
3. Vercel environment variables (screenshot or list)
4. Which step failed (Fix 1, 2, 3, or 4)
