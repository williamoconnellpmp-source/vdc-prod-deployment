# Local Testing Guide - PROD Login Page

**Date**: 2026-01-26

## 🚀 Quick Start

1. **Start the dev server** (if not already running):
   ```powershell
   cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
   npm run dev
   ```

2. **Open in browser**:
   ```
   http://localhost:8080/life-sciences/app/login
   ```

## ✅ What You Should See

### Login Page Features:
1. **Header**: "VDC Production Login" with subtitle
2. **GxP Disclaimer Box**: Red warning box explaining non-compliance
3. **User Notice Box**: Blue box listing the 4 authorized users
4. **Role Selection Section**: "Select Your Role"
5. **Submitter Card**:
   - Icon: 📄
   - Title: "Submitter"
   - Description: "Submit documents for approval"
   - Two buttons: "Login as Submitter 1" and "Login as Submitter 2"
   - Two credential cards showing:
     - Email addresses
     - Passwords
     - Copy-to-clipboard buttons (📋)
6. **Approver Card**:
   - Icon: ✓
   - Title: "Approver"
   - Description: "Review and approve documents (MFA Required)"
   - Two buttons: "Login as Approver 1" and "Login as Approver 2"
   - Two credential cards showing:
     - Email addresses
     - Passwords
     - **Live MFA codes** (TOTP generator with countdown timer)
     - Copy-to-clipboard buttons
7. **Footer Instructions**: Step-by-step guide

## 🧪 Testing Checklist

### Visual Test:
- [ ] All 4 user credentials are visible
- [ ] MFA codes are displayed for Approvers (6-digit codes)
- [ ] MFA codes update every 30 seconds
- [ ] Copy buttons work (click to copy, shows ✓ when copied)
- [ ] All 4 login buttons are visible and clickable

### Functional Test:
- [ ] Click "Login as Submitter 1" → Redirects to Cognito login page
- [ ] Click "Login as Submitter 2" → Redirects to Cognito login page
- [ ] Click "Login as Approver 1" → Redirects to Cognito login page
- [ ] Click "Login as Approver 2" → Redirects to Cognito login page
- [ ] Copy email button works
- [ ] Copy password button works
- [ ] MFA code is visible and updating

### MFA Code Test:
- [ ] Approver 1 MFA code is displayed
- [ ] Approver 2 MFA code is displayed
- [ ] Codes refresh every 30 seconds
- [ ] Timer countdown is visible

## 🔧 Troubleshooting

### If login page doesn't load:
1. Check dev server is running: `npm run dev -p 8080` or `PORT=8080 npm run dev`
2. Check browser console for errors
3. Verify port 8080 is available

### If MFA codes show "------":
1. Check `otplib` is installed: `npm list otplib`
2. Check browser console for TOTP errors
3. Verify TOTP secrets in `components/TOTPGenerator.jsx`

### If Cognito redirect fails:
1. Check `.env.production` has correct Cognito domain
2. Verify callback URL is configured in Cognito
3. For localhost, Cognito callback should include: `http://localhost:8080/life-sciences/app/callback/`

## 📝 Expected Credentials Display

### Submitter 1:
- Email: `williamoconnellpmp+submitter1@gmail.com`
- Password: `Password123!`

### Submitter 2:
- Email: `williamoconnellpmp+submitter2@gmail.com`
- Password: `Password123!`

### Approver 1:
- Email: `williamoconnellpmp+approver1@gmail.com`
- Password: `Password123!`
- MFA Code: 6-digit code (updates every 30s)

### Approver 2:
- Email: `williamoconnellpmp+approver2@gmail.com`
- Password: `Password123!`
- MFA Code: 6-digit code (updates every 30s)

## 🎯 Next Steps After Testing

1. Verify all 4 buttons redirect to Cognito
2. Test copy-to-clipboard functionality
3. Verify MFA codes are generating correctly
4. Test actual login flow (if Cognito is configured for localhost)
