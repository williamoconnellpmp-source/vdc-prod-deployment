# Safe PROD Deployment Plan - DEV Protection Guaranteed

**Date**: 2026-01-22  
**Status**: Ready for Safe Testing  
**Critical**: DEV environment will NOT be touched

## 🛡️ DEV Protection Guarantee

### Current DEV Environment (UNTOUCHED):
- **Location**: `C:\Users\willi\RECOVERY\ls-cloud-migration-hub-baseline`
- **Live URL**: https://williamoconnellpmp.com
- **S3 Bucket**: `ls-cloud-migration-hub-williamoconnellpmp`
- **CloudFront**: `E3GKP8EZSZFBWI`
- **Status**: ✅ **WILL REMAIN LIVE AND UNCHANGED**

### PROD Code (Ready to Test):
- **Location**: `C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment\out`
- **Status**: Built and tested locally
- **Features**: Real Cognito, MFA, Enhanced workflow

## 🎯 Safe Deployment Options (Choose One)

### Option 1: Vercel Deployment (RECOMMENDED - Safest)

**Why Vercel:**
- ✅ Completely separate from AWS S3/CloudFront
- ✅ Zero risk to DEV environment
- ✅ Easy to test and rollback
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Can test Cognito callbacks easily

**Steps:**
1. Create new Vercel project
2. Connect to your PROD code folder
3. Deploy to preview URL (e.g., `vdc-prod-xyz.vercel.app`)
4. Test MFA and Cognito
5. When ready, can point custom domain

**Commands:**
```powershell
# Install Vercel CLI (if not already)
npm install -g vercel

# Deploy from PROD folder
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
vercel --prod
```

### Option 2: Separate S3 Bucket + CloudFront (AWS)

**Why This:**
- ✅ Completely separate infrastructure
- ✅ Zero risk to DEV
- ✅ Can use subdomain (prod.williamoconnellpmp.com)
- ✅ Full AWS control

**Steps:**
1. Create NEW S3 bucket: `ls-cloud-migration-hub-prod` (different name!)
2. Create NEW CloudFront distribution
3. Point to new bucket
4. Use subdomain or different path
5. Deploy PROD code to new bucket

**Commands:**
```powershell
# Create new S3 bucket (different name!)
aws s3 mb s3://ls-cloud-migration-hub-prod --region us-west-2

# Deploy PROD code to NEW bucket
cd C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment
aws s3 sync out/ s3://ls-cloud-migration-hub-prod --delete

# Create new CloudFront distribution (separate from DEV)
# (Use AWS Console or CloudFormation)
```

### Option 3: Subdomain (prod.williamoconnellpmp.com)

**Why This:**
- ✅ Same domain, different subdomain
- ✅ Easy to test
- ✅ Can use same CloudFront with different origin

**Steps:**
1. Create new S3 bucket for PROD
2. Add subdomain to CloudFront
3. Deploy to subdomain path
4. Test at prod.williamoconnellpmp.com

### Option 4: Different Path (/prod instead of /life-sciences)

**Why This:**
- ✅ Same infrastructure, different path
- ✅ Both DEV and PROD can coexist
- ⚠️ Requires careful CloudFront configuration

**Steps:**
1. Deploy PROD to `/prod` path in S3
2. Configure CloudFront to serve both paths
3. Test at williamoconnellpmp.com/prod

## 📋 Recommended Approach: Vercel First

**Phase 1: Test on Vercel (Now)**
- Deploy to Vercel preview URL
- Test MFA and Cognito authentication
- Verify all workflows
- No risk to DEV

**Phase 2: Document Everything (Before Production)**
- Complete GxP documentation
- Test plans
- Validation evidence
- User guides

**Phase 3: Deploy to Production (When Ready)**
- After documentation complete
- After all testing passed
- Deploy to separate AWS infrastructure
- Or keep on Vercel with custom domain

## 🚫 What We Will NEVER Do

- ❌ Deploy to `ls-cloud-migration-hub-williamoconnellpmp` S3 bucket (DEV bucket)
- ❌ Update CloudFront `E3GKP8EZSZFBWI` (DEV distribution)
- ❌ Touch any files in `C:\Users\willi\RECOVERY\ls-cloud-migration-hub-baseline`
- ❌ Modify DEV code in any way
- ❌ Deploy PROD code to williamoconnellpmp.com without explicit approval

## ✅ Safety Checklist Before Any Deployment

- [ ] Verified we're deploying to NEW infrastructure (not DEV)
- [ ] Confirmed S3 bucket name is different from DEV
- [ ] Confirmed CloudFront distribution is different from DEV
- [ ] Tested locally first
- [ ] Have rollback plan ready
- [ ] DEV environment confirmed still working

## 📝 Next Steps

1. **Choose deployment option** (Vercel recommended)
2. **Deploy to test environment**
3. **Test MFA and Cognito**
4. **Document results**
5. **When ready, deploy to production**

## 🔐 Cognito Callback Configuration

For testing, you'll need to add the test URL to Cognito callbacks:

**Vercel URL**: `https://your-vercel-url.vercel.app/life-sciences/app/callback/`

**Command:**
```powershell
aws cognito-idp update-user-pool-client `
  --user-pool-id us-west-2_aQd9shIdg `
  --client-id 7qbh0bvokedaou09huur281ti9 `
  --callback-urls "https://williamoconnellpmp.com/life-sciences/app/callback/" "https://your-vercel-url.vercel.app/life-sciences/app/callback/" `
  --region us-west-2
```

This adds the test URL WITHOUT removing the production URL.
