# Fix Cognito 400 Bad Request on Logout

**Error:** `400 Bad Request` from Cognito when clicking Logout  
**URL:** `https://vdc-prod-williamoconnellpmp.auth.us-west-2.amazoncognito.com/error?client_id=...&logout_uri=https%3A%2F%2Fvdc-mfa-demo.vercel.app%2Flife-sciences%2Fapp%2Flogin`

**Root Cause:** The `logout_uri` being sent to Cognito doesn't exactly match what's configured in Cognito's "Allowed sign-out URLs".

---

## ✅ Fix: Add Exact URL to Cognito (2 minutes)

**Go to:** AWS Console → Cognito → User Pools → `vdc-prod-williamoconnellpmp` → App integration → App client `7qbh0bvokedaou09huur281ti9`

### Step 1: Open App Client Settings
1. Click on the App client ID: `7qbh0bvokedaou09huur281ti9`
2. Scroll down to "Hosted UI settings" or "Allowed sign-out URLs"

### Step 2: Add Sign-Out URLs
**In the "Allowed sign-out URLs" field, add these EXACT URLs (one per line):**

```
https://vdc-mfa-demo.vercel.app/life-sciences/app/login/
https://vdc-prod.vercel.app/life-sciences/app/login/
https://williamoconnellpmp.com/life-sciences/app/login/
```

**⚠️ CRITICAL:** 
- **MUST have trailing slash** (`/` at the end)
- **MUST be HTTPS** (not HTTP)
- **MUST match exactly** (no query parameters, no extra paths)

### Step 3: Save Changes
Click "Save changes" at the bottom of the page.

---

## ✅ Also Verify Callback URLs

**While you're there, check "Allowed callback URLs" includes:**

```
https://vdc-mfa-demo.vercel.app/life-sciences/app/callback/
https://vdc-prod.vercel.app/life-sciences/app/callback/
https://williamoconnellpmp.com/life-sciences/app/callback/
```

**Same rules:** Trailing slash, HTTPS, exact match.

---

## ✅ Verify Vercel Environment Variable

**Go to:** https://vercel.com/williamoconnellpmp-source/vdc-mfa-demo/settings/environment-variables

**Verify `NEXT_PUBLIC_VDC_LOGOUT_URI` is set to:**

```
https://vdc-mfa-demo.vercel.app/life-sciences/app/login/
```

**⚠️ Must have trailing slash!**

**After updating:** Redeploy the Vercel project (or push a new commit).

---

## 🧪 Test Logout

1. **Open Incognito window**
2. **Login:** https://vdc-mfa-demo.vercel.app/life-sciences/app/login/
3. **Login as Submitter 1** (password: `Password123!`, MFA code)
4. **Click "Logout" button**
5. **Should redirect to login page** (no 400 error)

**If you still see 400 error:**
- Check browser console (F12) → Network tab → Look at the failed request
- Verify the `logout_uri` parameter in the URL matches exactly what you added to Cognito
- Make sure there's no extra query parameters or paths

---

## 📝 Quick Checklist

- [ ] Added `https://vdc-mfa-demo.vercel.app/life-sciences/app/login/` to Cognito "Allowed sign-out URLs" (with trailing slash)
- [ ] Added `https://vdc-prod.vercel.app/life-sciences/app/login/` to Cognito "Allowed sign-out URLs" (with trailing slash)
- [ ] Verified `NEXT_PUBLIC_VDC_LOGOUT_URI` in Vercel has trailing slash
- [ ] Redeployed Vercel after env var changes
- [ ] Tested logout in Incognito window

---

## 🔍 Why This Happens

Cognito validates the `logout_uri` parameter against a whitelist. If the URL doesn't match exactly (including trailing slash, protocol, and path), Cognito returns a 400 error.

The code sends: `CONFIG.logoutUri` + `?force=true`, but Cognito only validates the base URL (without query parameters).

So if your config has:
- `https://vdc-mfa-demo.vercel.app/life-sciences/app/login/` ✅ (with slash) → Works
- `https://vdc-mfa-demo.vercel.app/life-sciences/app/login` ❌ (no slash) → 400 error
