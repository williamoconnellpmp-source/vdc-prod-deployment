# Deploy PROD to Vercel - Step-by-Step Guide

## Prerequisites
- ✅ Build completed successfully
- ✅ Code ready in `vdc-prod-deployment` folder
- ✅ Vercel account: https://vercel.com/williamoconnellpmp-sources-projects

## Deployment Steps

### Step 1: Prepare Git Repository (if not already done)

```powershell
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment

# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "PROD: Add UX improvements and fix 404 callback route"

# Add remote (if you have a GitHub repo)
git remote add origin <your-github-repo-url>
git push -u origin main
```

**OR** if you already have a GitHub repo:
```powershell
git add .
git commit -m "PROD: Add UX improvements and fix 404 callback route"
git push
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/williamoconnellpmp-sources-projects
   - Click "Add New..." → "Project"

2. **Import Your Repository**
   - Select your GitHub repository (or connect it if first time)
   - If deploying from local folder, use Vercel CLI (see Option B)

3. **Configure Project Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `vdc-prod-deployment` (if repo contains multiple folders)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `out` (important!)
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_VDC_COGNITO_DOMAIN=https://vdc-prod-williamoconnellpmp.auth.us-west-2.amazoncognito.com
   NEXT_PUBLIC_VDC_COGNITO_CLIENT_ID=7qbh0bvokedaou09huur281ti9
   NEXT_PUBLIC_VDC_API_BASE_URL=https://js97cus4h2.execute-api.us-west-2.amazonaws.com
   NEXT_PUBLIC_VDC_REDIRECT_URI=https://YOUR-VERCEL-URL.vercel.app/life-sciences/app/callback
   NEXT_PUBLIC_VDC_LOGOUT_URI=https://YOUR-VERCEL-URL.vercel.app/life-sciences/app/login
   ```
   
   **Note**: Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL after first deploy, or use the preview URL pattern.

5. **Deploy!**
   - Click "Deploy"
   - Wait for build to complete
   - Copy your deployment URL (e.g., `https://vdc-prod-xyz123.vercel.app`)

#### Option B: Via Vercel CLI

```powershell
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the project directory
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? williamoconnellpmp-sources-projects
# - Link to existing project? No (or Yes if you have one)
# - Project name: vdc-prod (or your choice)
# - Directory: ./
# - Override settings? No

# For production deployment:
vercel --prod
```

### Step 3: Update Environment Variables with Actual URL

After first deployment, you'll get a URL like:
- `https://vdc-prod-xyz123.vercel.app` (preview)
- `https://vdc-prod.vercel.app` (if you set a custom domain)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_VDC_REDIRECT_URI` with your actual Vercel URL:
   ```
   https://your-actual-url.vercel.app/life-sciences/app/callback
   ```
3. Update `NEXT_PUBLIC_VDC_LOGOUT_URI`:
   ```
   https://your-actual-url.vercel.app/life-sciences/app/login
   ```
4. Redeploy (or wait for automatic redeploy if you enabled it)

### Step 4: Update Cognito with Vercel Callback URL

After you have your Vercel URL, run this AWS CLI command:

```powershell
aws cognito-idp update-user-pool-client `
  --user-pool-id us-west-2_aQd9shIdg `
  --client-id 7qbh0bvokedaou09huur281ti9 `
  --callback-urls "https://williamoconnellpmp.com/life-sciences/app/callback/" "https://YOUR-VERCEL-URL.vercel.app/life-sciences/app/callback/" `
  --logout-urls "https://williamoconnellpmp.com/life-sciences/app/login/" "https://YOUR-VERCEL-URL.vercel.app/life-sciences/app/login/" `
  --region us-west-2
```

Replace `YOUR-VERCEL-URL` with your actual Vercel deployment URL.

### Step 5: Test the Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app/life-sciences/app/login`
2. Test the UX improvements:
   - ✅ Copy buttons work
   - ✅ MFA code generator shows live codes
   - ✅ "Ready to Login" indicator appears
   - ✅ Click "Sign in with Cognito"
   - ✅ Should redirect to Cognito (no 404!)
   - ✅ After login, should redirect back to your app

## Troubleshooting

### Build Fails
- Check that `outputDirectory` in `vercel.json` is set to `out`
- Verify `next.config.js` has `output: 'export'`
- Check build logs in Vercel dashboard

### 404 on Callback
- Verify `NEXT_PUBLIC_VDC_REDIRECT_URI` matches your Vercel URL exactly
- Check that Cognito has your Vercel callback URL added
- Ensure `vercel.json` has the callback route rewrite

### Cognito Redirect Mismatch
- Double-check callback URLs in Cognito match exactly (including trailing slashes)
- Verify environment variables are set correctly in Vercel

## Success Checklist

- [ ] Code pushed to GitHub (or ready for Vercel CLI)
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Environment variables updated with actual Vercel URL
- [ ] Cognito updated with Vercel callback URL
- [ ] Login flow works end-to-end
- [ ] UX improvements visible and functional

## Next Steps After Deployment

1. Test all user flows (Submitter and Approver)
2. Verify MFA works correctly
3. Test document submission and approval workflows
4. Monitor Vercel logs for any issues
5. Set up custom domain (optional)
