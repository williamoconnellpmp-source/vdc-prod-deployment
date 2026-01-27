# Local Testing Guide - PROD Build

**Date**: 2026-01-22  
**Build**: 208 files, 4.84 MB  
**Server**: http://localhost:8080

## 🚀 Server Started

The local server is running at: **http://localhost:8080**

## 🧪 Testing Checklist

### 1. Main App Page
**URL**: http://localhost:8080/life-sciences/app/

**What to Check:**
- ✅ Page loads without errors
- ✅ Should redirect to login if not authenticated
- ✅ No console errors (press F12 to check)

### 2. Login Page (Most Important!)
**URL**: http://localhost:8080/life-sciences/app/login/

**What to Check:**
- ✅ "VDC Production Login" header appears
- ✅ "Demo Accounts & Instructions" button/toggle exists
- ✅ Click the toggle - does it expand?
- ✅ Role selector works (Submitter/Approver)
- ✅ Demo accounts display correctly:
  - Submitter accounts show email + password
  - Approver accounts show email + password + **TOTP generator**
- ✅ TOTP codes are displaying (6-digit numbers)
- ✅ TOTP codes update every 30 seconds
- ✅ "Sign in with Cognito" button exists

**Expected Demo Accounts:**
- **Submitters:**
  - williamoconnellpmp+submitter1@gmail.com / Password123!
  - williamoconnellpmp+submitter2@gmail.com / Password123!
- **Approvers (with MFA):**
  - williamoconnellpmp+approver1@gmail.com / Password123!
  - williamoconnellpmp+approver2@gmail.com / Password123!

### 3. TOTP Generator Test
**What to Check:**
- ✅ TOTP codes display for approver accounts
- ✅ Codes are 6 digits (e.g., "123 456")
- ✅ Timer shows "Refreshes in Xs" and counts down
- ✅ Codes update automatically every 30 seconds
- ✅ Visual design looks good (purple gradient background)

### 4. Cognito Login Flow
**What to Check:**
- ✅ Click "Sign in with Cognito" button
- ✅ Should redirect to Cognito Hosted UI
- ⚠️ **Note**: You'll get a redirect_mismatch error because localhost isn't in Cognito's allowed callbacks
- ✅ This is EXPECTED - it means the redirect is working!

### 5. Other Pages
**URLs to Test:**
- http://localhost:8080/ (Homepage)
- http://localhost:8080/life-sciences/app/documents/ (Documents page)
- http://localhost:8080/life-sciences/app/upload/ (Upload page)

**What to Check:**
- ✅ Pages load without errors
- ✅ No broken images or missing assets
- ✅ Navigation works

## 🐛 Troubleshooting

### If Login Page Doesn't Show Demo Accounts:
- Check browser console (F12) for errors
- Verify TOTPGenerator.jsx was built correctly
- Check if otplib package is working

### If TOTP Codes Don't Update:
- Check browser console for JavaScript errors
- Verify the component is receiving the email prop
- Check if the secrets are configured correctly

### If Pages Don't Load:
- Check if http-server is running
- Try refreshing the page
- Check browser console for errors

### If You See Redirect Errors:
- This is NORMAL for localhost testing
- Cognito callback URLs are configured for production domain
- The redirect error confirms the login flow is working

## ✅ Success Criteria

**Build is successful if:**
- ✅ All pages load without errors
- ✅ Login page shows demo accounts
- ✅ TOTP generator displays and updates codes
- ✅ No JavaScript errors in console
- ✅ UI looks professional and polished

## 📝 Notes

- **DEV environment is untouched** - still running at williamoconnellpmp.com
- **This is PROD build** - separate from DEV
- **Cognito redirect errors are expected** - localhost not in allowed callbacks
- **TOTP codes are placeholders** - will work with real secrets when MFA is enrolled

## 🎯 Next Steps After Testing

If everything looks good:
1. ✅ Test complete - ready for deployment
2. Deploy to S3 when ready
3. Update Cognito callbacks to include localhost (if needed for testing)

If issues found:
1. Note the problems
2. Fix them
3. Rebuild: `npm run build`
4. Test again
