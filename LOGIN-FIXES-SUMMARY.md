# Login Page Fixes - Summary

**Date**: 2026-01-26

## ✅ Fixed Issues

### 1. Logout Redirects to Custom Login Page
- **Fixed**: Logout now redirects to `/life-sciences/app/login` (the page with 4 login options)
- **Changed**: `lib/life_sciences_app_lib/auth.js` - `logout()` function
- **Result**: Users see the custom login page with credentials after logout

### 2. Sticky MFA Box Disappears After Login
- **Fixed**: Sticky MFA box automatically closes when login succeeds
- **How it works**:
  - When callback completes, it sends a message to parent window
  - Parent window (login page) receives message and clears sticky MFA box
  - Session storage is cleared

### 3. Login Page Closes/Hides After Successful Login
- **Fixed**: When login succeeds in popup:
  - Popup window closes automatically
  - Parent window redirects to the app
  - Login page is no longer visible
- **For main window login**: Normal redirect happens, login page is replaced

### 4. Login Page Hides if Already Logged In
- **Fixed**: If user is already authenticated, login page automatically redirects to app
- **Prevents**: Showing login page when user is already logged in

## ⚠️ Remaining Issue: MFA Not Required

### Problem
Cognito is **not requiring MFA** for any users before completing login. Users can log in without entering an MFA code.

### Root Cause
This is a **Cognito configuration issue**, not a frontend issue. Cognito needs to be configured to require MFA for all users.

### Updated Requirement (2026-01-26)
**Change**: MFA is now required for **ALL users** (both Submitters and Approvers), not just Approvers.  
See `REQUIREMENTS-CHANGES.md` for details.

### Solution

**Enable MFA for All Users** (Recommended):
```powershell
aws cognito-idp set-user-pool-mfa-config \
  --user-pool-id us-west-2_aQd9shIdg \
  --mfa-configuration ON \
  --software-token-mfa-configuration Enabled=true \
  --region us-west-2
```

Then enroll MFA for all 4 demo accounts (Submitter 1, Submitter 2, Approver 1, Approver 2).

See `COGNITO-MFA-SETUP.md` for detailed instructions.

### Current Behavior
- ✅ MFA codes are displayed on login page for all users
- ✅ Sticky MFA box appears for Approvers (popup login)
- ✅ User can see MFA codes while logging in
- ❌ Cognito doesn't prompt for MFA (configuration needed)
- ✅ If MFA was required, codes would be visible

## 🎯 Testing Checklist

### Test Logout:
- [ ] Click logout button
- [ ] Should redirect to `/life-sciences/app/login`
- [ ] Should see the 4 login options page
- [ ] Should NOT see Cognito login page

### Test Approver Login:
- [ ] Click "Login as Approver 1"
- [ ] Popup opens with Cognito login
- [ ] Sticky MFA box appears on original page (top-right)
- [ ] Enter email and password in Cognito
- [ ] **Expected**: Cognito should ask for MFA code
- [ ] **Current**: Cognito may not ask (configuration issue)
- [ ] If MFA is asked, copy code from sticky box
- [ ] After login, popup closes
- [ ] Sticky MFA box disappears
- [ ] Redirected to Pending Approvals page

### Test Submitter Login:
- [ ] Click "Login as Submitter 1"
- [ ] Redirects to Cognito (no popup)
- [ ] Enter credentials
- [ ] **Expected**: Cognito should ask for MFA code (after configuration)
- [ ] **Current**: Cognito may not ask (configuration issue)
- [ ] If MFA is asked, copy code from login page
- [ ] Login completes
- [ ] Redirected to Overview page

**Note**: After MFA is configured, Submitters will also need MFA codes. The login page already displays MFA codes for all users.

## 📝 Next Steps

1. **Configure Cognito MFA** (see `COGNITO-MFA-SETUP.md`) - Set MFA to ON for all users
2. **Enroll MFA** for all 4 demo accounts (Submitter 1, Submitter 2, Approver 1, Approver 2)
3. **Update TOTP secrets** in `components/TOTPGenerator.jsx` with real Cognito secrets for each user
4. **Test full MFA flow** for both Submitters and Approvers after configuration

## 🔧 Files Modified

- `pages/life-sciences/app/login.js` - Added sticky MFA box, popup handling, auto-redirect
- `pages/life-sciences/app/callback.js` - Added popup closure, parent notification
- `lib/life_sciences_app_lib/auth.js` - Fixed logout redirect

## 💡 How It Works Now

### Approver Login Flow:
1. User clicks "Login as Approver 1" → Popup opens with Cognito
2. Sticky MFA box appears on original page (top-right)
3. User enters email/password in Cognito popup
4. **Cognito should ask for MFA** (needs configuration)
5. User copies MFA code from sticky box
6. User enters MFA code in Cognito
7. Login succeeds → Callback page loads
8. Callback sends message to parent window
9. Parent window clears sticky MFA box and redirects
10. Popup closes automatically
11. User is in the app

### Submitter Login Flow (After MFA Configuration):
1. User clicks "Login as Submitter 1" → Redirects to Cognito
2. User enters credentials
3. **Cognito asks for MFA code** (after configuration)
4. User copies MFA code from login page
5. User enters MFA code in Cognito
6. Login completes
7. Redirected to app

**Note**: Currently, Submitters don't see a popup (unlike Approvers), so they'll need to copy the MFA code from the main login page before entering it in Cognito.
