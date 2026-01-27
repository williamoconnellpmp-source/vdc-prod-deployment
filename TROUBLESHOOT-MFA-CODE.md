# Troubleshooting: "The code entered is invalid"

**Error**: Cognito rejects the MFA code even though it's generated from the correct secret.

## Common Causes

### 1. Time Synchronization Issue ⏰

**Most Common**: TOTP codes are time-based. If your system clock is off, codes won't match.

**Check system time:**
```powershell
Get-Date
```

**Fix**: Sync your system clock:
- Windows: Settings → Time & Language → Date & time → Sync now
- Or run as admin: `w32tm /resync`

### 2. Code Expired (30-Second Window) ⏱️

TOTP codes change every 30 seconds. If you:
- Copy a code
- Wait too long
- Then paste it

The code will be invalid.

**Solution**: 
- Copy the code right before you need it
- Paste it immediately
- If it's been more than 20 seconds, wait for the next code

### 3. Secret Mismatch 🔑

The secret in `TOTPGenerator.jsx` might not match what Cognito has.

**Verify secret matches:**
1. Check the secret shown during enrollment matches what's in the code
2. Make sure there are no extra spaces or characters
3. Verify the email address matches exactly

### 4. otplib Configuration Issue 📦

The `otplib` library might need specific configuration for Cognito.

**Check if otplib is working:**
Open browser console (F12) and check for errors.

**Try updating the TOTP generation:**
```javascript
import { authenticator } from 'otplib';

// Instead of generateSync, try:
const code = authenticator.generate(secret);
```

### 5. Base32 Encoding Issue 🔤

Cognito uses Base32 encoding. Make sure the secret is properly decoded.

**Test with online tool:**
1. Go to: https://totp.danhersam.com/
2. Enter the secret: `2CLDKWW5T7YNDM3SUEEUKUYMENBU7P72SW7VQFONBRX6WMM7VWGA`
3. Compare the code with what your app shows
4. If they match, the issue is elsewhere
5. If they don't match, there's a code generation issue

## Quick Diagnostic Steps

### Step 1: Verify Code Generation

1. Open browser console (F12)
2. Check for JavaScript errors
3. Look at the code displayed on the page
4. Compare with online TOTP generator using the same secret

### Step 2: Test with Online Tool

1. Use https://totp.danhersam.com/
2. Enter secret: `2CLDKWW5T7YNDM3SUEEUKUYMENBU7P72SW7VQFONBRX6WMM7VWGA`
3. Get the code
4. Try that code in Cognito
5. If it works, the issue is with your code generation
6. If it doesn't work, the secret might be wrong

### Step 3: Check System Time

```powershell
# Check current time
Get-Date

# Check if time sync is enabled
w32tm /query /status
```

### Step 4: Verify Secret in Code

Check `components/TOTPGenerator.jsx`:
- Secret matches what was shown during enrollment
- No extra spaces or characters
- Email address matches exactly

## Testing the Code

### Test with Submitter 1:

1. **Get code from online tool:**
   - Go to: https://totp.danhersam.com/
   - Secret: `2CLDKWW5T7YNDM3SUEEUKUYMENBU7P72SW7VQFONBRX6WMM7VWGA`
   - Copy the 6-digit code

2. **Try login:**
   - Click "Login as Submitter 1"
   - Enter email and password
   - When Cognito asks for MFA, paste the code from the online tool
   - If this works, your app's code generation has an issue
   - If this doesn't work, the secret might be wrong

## Potential Fixes

### Fix 1: Update TOTP Generator Code

If `generateSync` isn't working, try using `authenticator.generate`:

```javascript
import { authenticator } from 'otplib';

// In updateCode function:
const newCode = authenticator.generate(secret);
```

### Fix 2: Add Time Window Tolerance

Cognito might accept codes from adjacent time windows. Try:
- Current code
- Wait 30 seconds, try next code
- Or try the code from 30 seconds ago

### Fix 3: Verify Enrollment

Double-check that MFA was actually enrolled:
```powershell
aws cognito-idp admin-get-user `
  --user-pool-id us-west-2_aQd9shIdg `
  --username williamoconnellpmp+submitter1@gmail.com `
  --region us-west-2 `
  --query "MFAOptions"
```

Should show MFA is enabled.

## Next Steps

1. **Test with online TOTP tool first** - This will tell us if the secret is correct
2. **Check system time** - Most common issue
3. **Try code from adjacent time window** - Cognito might accept it
4. **Check browser console** - Look for JavaScript errors
5. **Verify secret matches** - Compare with enrollment output

Let me know:
- Does the online TOTP tool code work?
- What code is your app showing?
- Are they the same or different?
