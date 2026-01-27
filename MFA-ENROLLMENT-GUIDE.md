# MFA Enrollment Guide for Demo Users

**Date**: 2026-01-26  
**After MFA is enabled in Cognito, users must enroll MFA before they can log in.**

## Overview

Once MFA is enabled in the Cognito User Pool, all users must enroll MFA before they can successfully log in. This guide explains the enrollment process.

## Enrollment Methods

### Method 1: Automatic Enrollment on First Login (Easiest)

**How it works:**
1. User tries to log in (after MFA is enabled)
2. Cognito detects MFA is required but not enrolled
3. Cognito redirects to MFA enrollment page
4. User scans QR code or enters TOTP secret
5. User verifies with a code
6. MFA is enrolled
7. User can now log in (will be prompted for MFA code each time)

**Steps:**
1. Go to login page: `http://localhost:8080/life-sciences/app/login`
2. Click "Login as [User]" button
3. Enter email and password
4. **Cognito will show MFA enrollment screen**
5. Use a TOTP app (Google Authenticator, Authy, etc.) to scan QR code
6. Enter the 6-digit code to verify
7. Enrollment complete!

### Method 2: Admin API Enrollment (Advanced)

If you need to enroll users programmatically, you can use AWS CLI or SDK. However, this requires:
- User's access token (from login)
- Admin permissions for some operations

**Note**: For demo purposes, Method 1 is recommended.

## TOTP Apps

Users can use any TOTP-compatible app:
- **Google Authenticator** (iOS/Android)
- **Microsoft Authenticator** (iOS/Android)
- **Authy** (iOS/Android/Desktop)
- **1Password** (if it supports TOTP)
- **LastPass Authenticator**

## After Enrollment

### 1. Update TOTP Secrets in Code

After users enroll MFA, you need to update the TOTP secrets in `components/TOTPGenerator.jsx` so the login page displays the correct codes.

**How to get the secret:**
- Option A: During enrollment, Cognito shows the secret - save it
- Option B: Use AWS CLI to get user's MFA settings (if admin access)
- Option C: Have users share their secret (for demo only - not secure for production)

**Update the secrets:**
```javascript
// In components/TOTPGenerator.jsx
const USER_TOTP_SECRETS = {
  "williamoconnellpmp+submitter1@gmail.com": "ACTUAL_SECRET_FROM_COGNITO",
  "williamoconnellpmp+submitter2@gmail.com": "ACTUAL_SECRET_FROM_COGNITO",
  "williamoconnellpmp+approver1@gmail.com": "ACTUAL_SECRET_FROM_COGNITO",
  "williamoconnellpmp+approver2@gmail.com": "ACTUAL_SECRET_FROM_COGNITO",
};
```

### 2. Test Login Flow

After enrollment:
1. User logs in with email/password
2. Cognito prompts for MFA code
3. User copies code from login page (or TOTP app)
4. User enters code in Cognito
5. Login succeeds

## Troubleshooting

### User Can't Log In After MFA Enabled

**Problem**: User gets error or can't complete login.

**Solution**: 
- User must enroll MFA first
- If enrollment screen doesn't appear, check Cognito User Pool settings
- Verify MFA is actually enabled: `aws cognito-idp describe-user-pool --user-pool-id us-west-2_aQd9shIdg --region us-west-2 --query "UserPool.MfaConfiguration"`

### MFA Code Doesn't Work

**Problem**: User enters MFA code but it's rejected.

**Solutions**:
- Check time sync on device (TOTP is time-based)
- Verify secret matches between Cognito and TOTP app
- Try waiting for next 30-second window
- Re-enroll MFA if secret is wrong

### User Lost Access to TOTP App

**Problem**: User can't access their TOTP app (lost phone, etc.).

**Solution**:
- Admin can disable MFA for user (temporary)
- User must re-enroll MFA
- For production, implement backup codes or recovery methods

## Demo Account Enrollment Checklist

- [ ] **Submitter 1** (`williamoconnellpmp+submitter1@gmail.com`)
  - [ ] MFA enrolled
  - [ ] TOTP secret saved
  - [ ] Login tested

- [ ] **Submitter 2** (`williamoconnellpmp+submitter2@gmail.com`)
  - [ ] MFA enrolled
  - [ ] TOTP secret saved
  - [ ] Login tested

- [ ] **Approver 1** (`williamoconnellpmp+approver1@gmail.com`)
  - [ ] MFA enrolled
  - [ ] TOTP secret saved
  - [ ] Login tested

- [ ] **Approver 2** (`williamoconnellpmp+approver2@gmail.com`)
  - [ ] MFA enrolled
  - [ ] TOTP secret saved
  - [ ] Login tested

## Security Notes for Demo

⚠️ **For demonstration purposes only:**
- TOTP secrets are displayed on the login page (not secure for production)
- This violates GxP best practices but is necessary to demonstrate MFA
- In production, secrets should never be displayed
- Users should enroll MFA through secure, authenticated flows

## Next Steps

1. ✅ Enable MFA in Cognito (see `configure-cognito-mfa.ps1`)
2. ⏳ Enroll MFA for all 4 demo accounts
3. ⏳ Update TOTP secrets in `components/TOTPGenerator.jsx`
4. ⏳ Test login flow for all users
5. ⏳ Verify MFA codes work correctly
