# TOTP Secrets Security - Current vs Production

**Date**: 2026-01-26

## Current Implementation (Demo)

**Location**: `components/TOTPGenerator.jsx` - Hardcoded in frontend code

**Security Level**: ⚠️ **Not Secure** (intentional for demo)

**Why it's OK for demo:**
- TOTP secrets are **already displayed on the login page** (by design)
- The entire login page intentionally violates GxP security practices for demonstration
- If secrets are visible on the page, storing them in Secrets Manager doesn't add security
- This is explicitly for demo purposes only

## Production Best Practices

### ❌ Don't Do This in Production:
- Display TOTP secrets on login pages
- Hardcode secrets in frontend code
- Store secrets in client-side JavaScript
- Expose secrets in browser-accessible files

### ✅ Do This in Production:

#### Option 1: AWS Secrets Manager (Recommended)

1. **Store secrets in Secrets Manager:**
```powershell
aws secretsmanager create-secret `
  --name "vdc-prod/cognito-totp-secrets" `
  --secret-string '{
    "williamoconnellpmp+submitter1@gmail.com": "2CLDKWW5T7YNDM3SUEEUKUYMENBU7P72SW7VQFONBRX6WMM7VWGA",
    "williamoconnellpmp+submitter2@gmail.com": "BVV4RPSDDMTOEKFDHUIOKC4M2JY4SSUDX73RMFRDJ57V6AX4T3SA",
    "williamoconnellpmp+approver1@gmail.com": "4AIKZWZAKWPIUZIQWWHY5UVW67K7J2UCDKORQ54UBARZLC7QUMBA",
    "williamoconnellpmp+approver2@gmail.com": "A6QQFOCIIN5KKFBPW2EBNCTQAKBAK6BGUFWWWP3A2FKCHY6FYU6Q"
  }' `
  --region us-west-2
```

2. **Retrieve server-side only:**
   - Use AWS SDK in backend/API
   - Never expose to frontend
   - Generate TOTP codes server-side
   - Return codes via secure API (not secrets)

3. **Use IAM roles/policies:**
   - Grant read access only to specific roles
   - Use least privilege principle

#### Option 2: Environment Variables (Server-Side Only)

Store in server-side environment variables:
- `.env` file (not committed to git)
- Server environment variables
- Never in `NEXT_PUBLIC_*` (those are exposed to browser)

#### Option 3: Don't Display Secrets at All

**Best practice**: Don't display TOTP secrets or codes on login pages:
- Users enroll MFA through secure flow
- Users use their own TOTP app (Google Authenticator, etc.)
- Application never sees or stores user's TOTP secret
- Each user has their own secret, known only to them and Cognito

## Current Demo Approach

**Why we're doing it this way:**
- Demonstrates Cognito MFA functionality
- Shows MFA codes for demo purposes
- Makes it easy for demo users to see codes
- Intentionally violates security for demonstration

**What to change for production:**
1. Remove TOTP secret display from login page
2. Move secrets to Secrets Manager or server-side env vars
3. Generate TOTP codes server-side (if needed)
4. Have users use their own TOTP apps (standard practice)
5. Never expose secrets to frontend

## Recommendation for Your Demo

**For now (demo):** ✅ **Keep as-is**
- Secrets are already visible on the page
- Moving to Secrets Manager won't improve security if they're displayed
- Focus on getting the demo working first

**For production:** 
- Remove secret display entirely
- Use Secrets Manager for any server-side needs
- Follow standard MFA enrollment flow (users use their own apps)

## Summary

**Question**: Do I need to save these to Secrets Manager?

**Answer**: 
- **For this demo**: No, not necessary since secrets are displayed on the page anyway
- **For production**: Yes, but more importantly, don't display secrets on the page at all
- **Best practice**: Users should use their own TOTP apps, and the app should never see user secrets

The current approach is intentionally insecure for demonstration purposes. For production, the entire approach would need to change to be GxP-compliant.
