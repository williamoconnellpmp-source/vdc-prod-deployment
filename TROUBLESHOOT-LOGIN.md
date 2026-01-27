# Troubleshooting Login Page Not Loading

**Date**: 2026-01-26

## 🔍 Quick Checks

### 1. Verify Dev Server is Running
```powershell
# Check if server is running
netstat -ano | findstr ":8080"

# Or check Node processes
Get-Process -Name node
```

### 2. Check What Port the Server is Actually On
The dev server might be on a different port. Check the terminal output when you run `npm run dev`.

### 3. Try Different URLs
- `http://localhost:8080/life-sciences/app/login`
- `http://localhost:8080/life-sciences/app/login/` (with trailing slash)
- `http://localhost:3000/life-sciences/app/login` (if on port 3000)

### 4. Check Browser Console
Press F12 in your browser and check the Console tab for errors.

### 5. Check Terminal Output
Look at the terminal where `npm run dev` is running for any error messages.

## 🐛 Common Issues

### Issue: "Cannot GET /life-sciences/app/login"
**Cause**: Next.js routing issue or file path problem  
**Solution**: 
- Verify file exists at: `pages/life-sciences/app/login.js`
- Check for syntax errors in the file
- Restart dev server

### Issue: Page loads but shows blank/error
**Cause**: JavaScript error in the component  
**Solution**:
- Check browser console (F12)
- Look for import errors (TOTPGenerator, CONFIG, etc.)
- Verify all dependencies are installed: `npm install`

### Issue: Port 8080 not accessible
**Cause**: Port conflict or server not started  
**Solution**:
- Try port 3000: `npm run dev:3000`
- Check if another app is using port 8080
- Kill existing Node processes: `Get-Process -Name node | Stop-Process -Force`

### Issue: "Module not found" errors
**Cause**: Missing dependencies or incorrect imports  
**Solution**:
- Run: `npm install`
- Check `components/TOTPGenerator.jsx` exists
- Check `lib/life_sciences_app_lib/config.js` exists

## ✅ Step-by-Step Fix

1. **Stop all Node processes**:
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

2. **Navigate to PROD folder**:
   ```powershell
   cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
   ```

3. **Verify dependencies**:
   ```powershell
   npm install
   ```

4. **Start dev server**:
   ```powershell
   npm run dev
   ```

5. **Check terminal output** - it should show:
   ```
   ▲ Next.js 16.1.1
   - Local:        http://localhost:8080
   - Ready in X seconds
   ```

6. **Open browser** to the URL shown in terminal

## 📝 Expected Terminal Output

When dev server starts successfully, you should see:
```
▲ Next.js 16.1.1
- Local:        http://localhost:8080
- Ready in 2.5s
```

If you see errors, they will be displayed here.

## 🎯 Alternative: Check if File is Being Served

Try accessing the root to see if Next.js is working:
- `http://localhost:8080/` (should show homepage or 404)
- `http://localhost:8080/life-sciences/app/` (should show app index)

If these don't work, the dev server isn't running properly.
