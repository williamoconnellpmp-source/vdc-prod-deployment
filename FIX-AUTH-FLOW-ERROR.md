# Fix: "Auth flow not enabled for this client"

**Error**: `InvalidParameterException: Auth flow not enabled for this client`

## Problem

The Cognito App Client doesn't have the `ADMIN_NO_SRP_AUTH` auth flow enabled, which is required for admin-initiated MFA enrollment.

## Solution Options

### Option 1: Enable Auth Flow via AWS Console (Easiest)

1. Go to AWS Cognito Console
2. Select your User Pool: `us-west-2_aQd9shIdg` (vdc-prod-userpool)
3. In the **left navigation panel**, find **"Applications"** section
4. Click on **"App clients"** (under Applications)
5. Find your App Client: `vdc-prod-appclient` (or ID `7qbh0bvokedaou09huur281ti9`)
6. Click on the App Client name to open its details
7. Click **"Edit"** button
8. Scroll down to **"Authentication flows configuration"** section
9. Check the box for:
   - ✅ **ALLOW_ADMIN_USER_PASSWORD_AUTH**
10. Click **"Save changes"**

### Option 2: Enable via AWS CLI (More Complex)

The App Client update requires ALL existing settings. Run this to get current settings first:

```powershell
aws cognito-idp describe-user-pool-client `
  --user-pool-id us-west-2_aQd9shIdg `
  --client-id 7qbh0bvokedaou09huur281ti9 `
  --region us-west-2 `
  --output json > current-client-config.json
```

Then update with ALL settings plus the new auth flow. This is complex because you need to preserve:
- Callback URLs
- Logout URLs
- OAuth scopes
- All other settings

**Recommended**: Use Option 1 (AWS Console) - it's much easier and safer.

### Option 3: Alternative - User Self-Service Enrollment (No Auth Flow Change Needed)

Instead of admin enrollment, have users enroll MFA themselves:

1. Users log in through the normal OAuth flow
2. Cognito will prompt them to enroll MFA (since MFA is ON)
3. Users complete enrollment
4. You get the TOTP secrets from the enrollment process

**This doesn't require changing the App Client configuration.**

## After Enabling the Auth Flow

Once `ADMIN_NO_SRP_AUTH` is enabled:

1. Run `enroll-mfa-admin.ps1` again
2. The script should work correctly
3. Complete MFA enrollment for all 4 users
4. Update `TOTPGenerator.jsx` with the secrets

## Quick Check

To verify the auth flow is enabled:

```powershell
aws cognito-idp describe-user-pool-client `
  --user-pool-id us-west-2_aQd9shIdg `
  --client-id 7qbh0bvokedaou09huur281ti9 `
  --region us-west-2 `
  --query "UserPoolClient.ExplicitAuthFlows"
```

Look for `ADMIN_NO_SRP_AUTH` in the output.
