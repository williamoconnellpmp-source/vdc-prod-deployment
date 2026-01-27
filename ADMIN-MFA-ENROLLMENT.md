# Admin MFA Enrollment Guide

**Date**: 2026-01-26  
**Method**: Admin API Enrollment (Option A)

## Overview

As an admin, you can enroll MFA for users using AWS Cognito Admin APIs. This requires:
- Admin permissions in Cognito
- User passwords (for authentication)
- A TOTP code generator (to verify enrollment)

## Quick Start

Run the automated script:

```powershell
.\enroll-mfa-admin.ps1
```

This script will:
1. Prompt for each user's password
2. Authenticate as admin
3. Associate a software token (get TOTP secret)
4. Prompt you to enter a TOTP code (from Google Authenticator or similar)
5. Verify and complete enrollment
6. Save all TOTP secrets for updating `TOTPGenerator.jsx`

## Manual Process

If you prefer to do it manually, here are the steps:

### Step 1: Admin Initiate Auth

```powershell
aws cognito-idp admin-initiate-auth `
  --user-pool-id us-west-2_aQd9shIdg `
  --client-id 7qbh0bvokedaou09huur281ti9 `
  --auth-flow ADMIN_NO_SRP_AUTH `
  --auth-parameters USERNAME=williamoconnellpmp+submitter1@gmail.com,PASSWORD=Password123! `
  --region us-west-2
```

**Response will include:**
- `ChallengeName: "MFA_SETUP"`
- `Session: "..."` (save this)

### Step 2: Associate Software Token

```powershell
aws cognito-idp associate-software-token `
  --session <SESSION_FROM_STEP_1> `
  --region us-west-2
```

**Response will include:**
- `SecretCode: "..."` (save this - this is the TOTP secret!)
- `Session: "..."` (save this for next step)

### Step 3: Generate TOTP Code

Use the `SecretCode` from Step 2 to generate a TOTP code:
- Use Google Authenticator app
- Or use an online TOTP generator: https://totp.danhersam.com/
- Or use the `otplib` library in Node.js

**Example with Node.js:**
```javascript
const { authenticator } = require('otplib');
const secret = 'YOUR_SECRET_CODE_FROM_STEP_2';
const code = authenticator.generate(secret);
console.log(code);
```

### Step 4: Verify Software Token

```powershell
aws cognito-idp verify-software-token `
  --user-code <6_DIGIT_TOTP_CODE> `
  --session <SESSION_FROM_STEP_2> `
  --region us-west-2
```

**Response will include:**
- `Session: "..."` (save this for final step)
- `Status: "SUCCESS"`

### Step 5: Complete MFA Setup

```powershell
aws cognito-idp admin-respond-to-auth-challenge `
  --user-pool-id us-west-2_aQd9shIdg `
  --client-id 7qbh0bvokedaou09huur281ti9 `
  --challenge-name MFA_SETUP `
  --session <SESSION_FROM_STEP_4> `
  --challenge-responses USERNAME=williamoconnellpmp+submitter1@gmail.com `
  --region us-west-2
```

**Response will include:**
- `AuthenticationResult` with tokens (enrollment complete!)

## After Enrollment

### 1. Save TOTP Secrets

For each user, save the `SecretCode` from Step 2. You'll need these to update `TOTPGenerator.jsx`.

### 2. Update TOTPGenerator.jsx

Update the `USER_TOTP_SECRETS` object:

```javascript
const USER_TOTP_SECRETS = {
  "williamoconnellpmp+submitter1@gmail.com": "SECRET_FROM_STEP_2",
  "williamoconnellpmp+submitter2@gmail.com": "SECRET_FROM_STEP_2",
  "williamoconnellpmp+approver1@gmail.com": "SECRET_FROM_STEP_2",
  "williamoconnellpmp+approver2@gmail.com": "SECRET_FROM_STEP_2",
};
```

### 3. Test Login

Test login for each user:
1. Go to login page
2. Click "Login as [User]"
3. Enter email and password
4. **Cognito should prompt for MFA code**
5. Copy code from login page (from TOTPGenerator)
6. Enter code in Cognito
7. Login should succeed

## Troubleshooting

### Error: "User is not confirmed"

**Solution**: Make sure the user account is confirmed:
```powershell
aws cognito-idp admin-get-user `
  --user-pool-id us-west-2_aQd9shIdg `
  --username williamoconnellpmp+submitter1@gmail.com `
  --region us-west-2
```

If status is not `CONFIRMED`, confirm the user:
```powershell
aws cognito-idp admin-confirm-sign-up `
  --user-pool-id us-west-2_aQd9shIdg `
  --username williamoconnellpmp+submitter1@gmail.com `
  --region us-west-2
```

### Error: "Invalid session"

**Solution**: Sessions expire quickly. Complete all steps within a few minutes. If session expires, start over from Step 1.

### Error: "Invalid code" when verifying

**Solution**: 
- Make sure you're using the correct secret
- Check time sync on your device (TOTP is time-based)
- Try waiting for the next 30-second window
- Generate a fresh code

### User Already Has MFA Enrolled

If a user already has MFA enrolled, you'll get an error. Check status:
```powershell
aws cognito-idp admin-get-user `
  --user-pool-id us-west-2_aQd9shIdg `
  --username williamoconnellpmp+submitter1@gmail.com `
  --region us-west-2 `
  --query "MFAOptions"
```

If MFA is already enrolled, you can:
- Skip that user
- Or delete their MFA and re-enroll (not recommended)

## Security Notes

⚠️ **Important:**
- This process requires user passwords - handle securely
- TOTP secrets should be stored securely
- For production, consider user self-service enrollment instead
- Admin enrollment is useful for initial setup/demo purposes

## Alternative: Simplified Script

The `enroll-mfa-admin.ps1` script automates all these steps. It will:
- Prompt for each user's password
- Handle all API calls
- Generate TOTP codes (you'll need to enter them)
- Save all secrets for easy copy-paste

Run it:
```powershell
.\enroll-mfa-admin.ps1
```
