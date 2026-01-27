# AWS CLI Commands for Cognito MFA Configuration

**Date**: 2026-01-26  
**User Pool ID**: `us-west-2_aQd9shIdg`  
**Region**: `us-west-2`

## Quick Reference

### 1. Check Current MFA Configuration

```powershell
aws cognito-idp describe-user-pool `
  --user-pool-id us-west-2_aQd9shIdg `
  --region us-west-2 `
  --query "UserPool.MfaConfiguration"
```

### 2. Enable MFA for All Users

```powershell
aws cognito-idp set-user-pool-mfa-config `
  --user-pool-id us-west-2_aQd9shIdg `
  --mfa-configuration ON `
  --software-token-mfa-configuration Enabled=true `
  --region us-west-2
```

### 3. Verify MFA is Enabled

```powershell
aws cognito-idp describe-user-pool `
  --user-pool-id us-west-2_aQd9shIdg `
  --region us-west-2 `
  --query "UserPool.MfaConfiguration"
```

Expected output: `"ON"`

## User Management Commands

### Check User Status

```powershell
# Check a specific user
aws cognito-idp admin-get-user `
  --user-pool-id us-west-2_aQd9shIdg `
  --username "williamoconnellpmp+submitter1@gmail.com" `
  --region us-west-2
```

### List All Users

```powershell
aws cognito-idp list-users `
  --user-pool-id us-west-2_aQd9shIdg `
  --region us-west-2
```

### Check if User Has MFA Enabled

```powershell
aws cognito-idp admin-get-user `
  --user-pool-id us-west-2_aQd9shIdg `
  --username "williamoconnellpmp+approver1@gmail.com" `
  --region us-west-2 `
  --query "MFAOptions"
```

## MFA Enrollment Commands

### Option A: Admin-Initiated MFA Setup (Requires Admin Permissions)

**Note**: This approach requires admin permissions and is more complex. For demo purposes, user self-service enrollment is recommended.

### Option B: User Self-Service Enrollment (Recommended)

Users will be prompted to enroll MFA when they log in after MFA is enabled. The enrollment flow:

1. User logs in with email/password
2. Cognito prompts: "MFA is required. Please set up MFA."
3. User scans QR code or enters TOTP secret
4. User verifies with a code
5. MFA is enrolled

**To test this:**
1. Enable MFA (Step 2 above)
2. Try to log in as any user
3. Cognito will prompt for MFA enrollment
4. Complete enrollment
5. Future logins will require MFA code

### Option C: Programmatic Enrollment (Advanced)

If you need to programmatically enroll users, you'll need:

1. User's access token (from login)
2. Associate software token
3. Verify token with code

**Example flow:**
```powershell
# Step 1: User logs in and gets access token (via app)
# Step 2: Associate software token
aws cognito-idp associate-software-token `
  --access-token <USER_ACCESS_TOKEN> `
  --region us-west-2

# Returns: SecretCode (TOTP secret) and Session (for verification)

# Step 3: Verify the token
aws cognito-idp verify-software-token `
  --user-code <MFA_CODE_FROM_TOTP_APP> `
  --session <SESSION_FROM_STEP_2> `
  --region us-west-2

# Step 4: Set MFA preference
aws cognito-idp set-user-mfa-preference `
  --access-token <USER_ACCESS_TOKEN> `
  --software-token-mfa-settings Enabled=true,PreferredMfa=true `
  --region us-west-2
```

## Demo User Accounts

All 4 accounts need MFA enrolled:

1. **Submitter 1**: `williamoconnellpmp+submitter1@gmail.com`
2. **Submitter 2**: `williamoconnellpmp+submitter2@gmail.com`
3. **Approver 1**: `williamoconnellpmp+approver1@gmail.com`
4. **Approver 2**: `williamoconnellpmp+approver2@gmail.com`

## Troubleshooting

### Check MFA Configuration Details

```powershell
aws cognito-idp describe-user-pool `
  --user-pool-id us-west-2_aQd9shIdg `
  --region us-west-2 `
  --query "UserPool.{MfaConfiguration:MfaConfiguration,SoftwareTokenMfaConfiguration:SoftwareTokenMfaConfiguration}"
```

### Check User Pool Settings

```powershell
aws cognito-idp describe-user-pool `
  --user-pool-id us-west-2_aQd9shIdg `
  --region us-west-2 `
  --output json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Verify User Can Log In

After enabling MFA, users who haven't enrolled will see an error or be prompted to enroll. Check the error:

```powershell
# This won't work via CLI for OAuth flow, but you can check user status
aws cognito-idp admin-get-user `
  --user-pool-id us-west-2_aQd9shIdg `
  --username "williamoconnellpmp+submitter1@gmail.com" `
  --region us-west-2 `
  --query "{Status:UserStatus,MFAEnabled:MFAOptions}"
```

## Important Notes

1. **After enabling MFA**: Users who haven't enrolled will be prompted to enroll on their next login
2. **TOTP Secrets**: After enrollment, you'll need to update `components/TOTPGenerator.jsx` with the actual secrets from Cognito
3. **Testing**: Test login flow after enabling MFA to ensure users are prompted correctly
4. **Backup**: Consider backing up current configuration before making changes

## Quick Setup Script

Run the automated script:

```powershell
.\configure-cognito-mfa.ps1
```

This script will:
- Check current MFA status
- Enable MFA if not already enabled
- Verify the configuration
- Show user status
- Provide next steps

## Next Steps After Configuration

1. ✅ Enable MFA (done via script or commands above)
2. ⏳ Enroll MFA for all 4 demo accounts
3. ⏳ Update TOTP secrets in `components/TOTPGenerator.jsx`
4. ⏳ Test login flow for all users
5. ⏳ Verify MFA codes work correctly
