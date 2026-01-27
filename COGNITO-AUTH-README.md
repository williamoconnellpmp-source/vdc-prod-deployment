# VDC Real Cognito Authentication

## What Changed

This deployment now uses **real Cognito OAuth authentication** instead of demo localStorage login.

### New Files Created:
1. **pages/life-sciences/app/login.js** - OAuth redirect to Cognito
2. **pages/life-sciences/app/callback.js** - OAuth callback handler
3. **lib/life_sciences_app_lib/auth.js** - JWT token management (REWRITTEN)
4. **lib/life_sciences_app_lib/apiClient.js** - API client with Authorization headers

### Authentication Flow:
1. User visits protected page ? redirects to /login
2. /login redirects to Cognito Hosted UI
3. User authenticates with Cognito
4. Cognito redirects to /callback with authorization code
5. /callback exchanges code for JWT tokens
6. Tokens stored in localStorage
7. All API calls include Authorization: Bearer {token}

### Configuration:
- User Pool: us-west-2_aQd9shIdg
- Client ID: 7qbh0bvokedaou09huur281ti9
- Callback URL: https://williamoconnellpmp.com/life-sciences/app/callback/
- Logout URL: https://williamoconnellpmp.com/life-sciences/app/login/

### Testing Locally:
The callback URL is configured for production domain. To test locally, you would need to:
1. Add http://localhost:3000/life-sciences/app/callback/ to Cognito allowed callbacks
2. Update .env.local with local URLs

### Deployment:
1. cd "C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment"
2. npm install
3. npm run build
4. Deploy 'out' folder to S3

### Rollback:
If you need to rollback to demo authentication:
- Backup is at: C:\Users\willi\ls-cloud-migration-hub\vdc-prod-deployment-pre-cognito-20260121-182804
- Just restore that folder

### API Gateway:
API Gateway routes are configured with JWT authorizer.
All requests must include valid Cognito JWT token in Authorization header.

Created: 2026-01-21 18:29:15