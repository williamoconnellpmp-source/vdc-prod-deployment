# Cognito MFA Configuration - Required for Approvers

**Date**: 2026-01-26  
**Issue**: Approvers are not being asked for MFA during login

## 🔴 Problem

When logging in as Approver 1 or Approver 2, Cognito is **not requiring MFA** before completing authentication. This means users can log in without entering the MFA code.

## ✅ Solution: Configure Cognito to Require MFA for All Users

**Requirement Change (2026-01-26)**: MFA is now required for ALL users (both Submitters and Approvers) to simplify configuration. See `REQUIREMENTS-CHANGES.md` for details.

### Step 1: Verify MFA is Enabled in User Pool

```powershell
aws cognito-idp describe-user-pool \
  --user-pool-id us-west-2_aQd9shIdg \
  --region us-west-2
```

Check that `MfaConfiguration` is set to `OPTIONAL` or `ON` (not `OFF`).

### Step 2: Enable MFA for All Users (Recommended Approach)

**This is the preferred approach** - it's simpler and matches the updated requirement:

```powershell
aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id us-west-2_aQd9shIdg \
  --mfa-configuration ON \
  --software-token-mfa-configuration Enabled=true \
  --region us-west-2
```

**Result**: All users (Submitters and Approvers) will be required to use MFA during login.

**Note**: You'll need to enroll MFA for all 4 demo accounts:
- Submitter 1
- Submitter 2
- Approver 1
- Approver 2

### Alternative: Application-Level MFA Enforcement (Not Recommended)

If you wanted to enforce MFA only for specific groups, you could use application-level checks, but this is more complex and doesn't match the current requirement.

### Step 3: Enroll MFA for All Demo Accounts

**All 4 demo accounts** need MFA enrolled (Submitters and Approvers):

```powershell
# For Approver 1
aws cognito-idp associate-software-token \
  --access-token <ACCESS_TOKEN> \
  --region us-west-2

# Then verify the token
aws cognito-idp verify-software-token \
  --user-code <MFA_CODE> \
  --access-token <ACCESS_TOKEN> \
  --region us-west-2
```

**Note**: This requires the user to be logged in. For initial setup, you may need to:
1. Log in as the approver
2. Enroll MFA through the app
3. Or use admin APIs to set up MFA

### Step 4: Verify MFA is Required

After configuration, test login for both Submitters and Approvers:
1. Go to login page
2. Click any user button (e.g., "Login as Submitter 1" or "Login as Approver 1")
3. Enter email and password
4. **You should be prompted for MFA code**
5. Copy the MFA code from the login page (or sticky box for Approvers)
6. Enter the code when prompted
7. Complete login

## 🔧 Alternative: Use Pre-Authentication Lambda Trigger

You can use a Cognito Lambda trigger to enforce MFA for specific groups:

1. Create Lambda function that checks user groups
2. If user is in "Approver" group, require MFA
3. Attach to `PreAuthentication` trigger

**Example Lambda (pseudo-code)**:
```javascript
exports.handler = async (event) => {
  const userGroups = event.request.userAttributes['cognito:groups'];
  
  if (userGroups && userGroups.includes('Approver')) {
    // Check if MFA is enrolled
    if (!event.request.userAttributes['cognito:mfa_enabled']) {
      throw new Error('MFA_REQUIRED');
    }
  }
  
  return event;
};
```

## 📝 Current Status

- ✅ MFA codes are displayed on login page for all users
- ✅ Sticky MFA box appears for Approvers (popup login)
- ✅ Login page closes after successful login (fixed)
- ✅ Sticky MFA box disappears after login (fixed)
- ✅ Logout redirects to custom login page (fixed)
- ❌ Cognito is not requiring MFA (configuration needed - see Step 2)

## 🎯 Next Steps

1. **Configure Cognito MFA** using Step 2 above (set MFA to ON for all users)
2. **Enroll MFA** for all 4 demo accounts (Submitter 1, Submitter 2, Approver 1, Approver 2)
3. **Update TOTP secrets** in `components/TOTPGenerator.jsx` with actual Cognito secrets for each user
4. **Test login flow** for both Submitters and Approvers to verify MFA is required

## ⚠️ Important Notes

- **MFA secrets** shown on the login page are **placeholder/demo secrets**
- **Real MFA codes** will only work with actual Cognito-enrolled MFA devices
- **TOTP secrets** must match what Cognito has for each user
- **MFA enrollment** must be done through Cognito (either via app or admin APIs)
