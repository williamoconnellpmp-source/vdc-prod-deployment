// pages/life-sciences/app/_lib/config.js

function requireEnv(name, fallback) {
  const v = process.env[name];
  return v && String(v).trim().length > 0 ? v : fallback;
}

// IMPORTANT: localhost port can vary (3000 vs 3001).
// If you run on 3001, set NEXT_PUBLIC_VDC_REDIRECT_URI + NEXT_PUBLIC_VDC_LOGOUT_URI accordingly.
// Example:
// NEXT_PUBLIC_VDC_REDIRECT_URI=http://localhost:3001/life-sciences/app/callback
// NEXT_PUBLIC_VDC_LOGOUT_URI=http://localhost:3001/life-sciences/app/login
const DEFAULT_LOCAL_LOGIN = "http://localhost:3000/life-sciences/app/login/";
const DEFAULT_LOCAL_CALLBACK = "http://localhost:3000/life-sciences/app/callback/";

// Auto-detect Vercel deployment or localhost
function getDefaultCallbackUri() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If on Vercel (vercel.app domain) or production domain
    if (hostname.includes('vercel.app') || hostname === 'williamoconnellpmp.com') {
      // Use HTTPS with trailing slash to match Cognito config
      return `https://${window.location.host}/life-sciences/app/callback/`;
    }
    
    // If on localhost, use the actual port (could be 3000, 8080, etc.)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const actualPort = port || '3000';
      return `http://localhost:${actualPort}/life-sciences/app/callback/`; // With trailing slash to match Cognito
    }
  }
  // Default to localhost:3000 for local development
  return DEFAULT_LOCAL_CALLBACK;
}

export const CONFIG = {
  // Cognito Hosted UI (Managed login pages)
  cognitoDomain: requireEnv(
    "NEXT_PUBLIC_VDC_COGNITO_DOMAIN",
    "https://vdc-prod-williamoconnellpmp.auth.us-west-2.amazoncognito.com"
  ),
  clientId: requireEnv(
    "NEXT_PUBLIC_VDC_COGNITO_CLIENT_ID",
    "7qbh0bvokedaou09huur281ti9"
  ),

  // Callback URI:
  // For this preview build, always send Cognito back to the Vercel app,
  // regardless of where the login page itself is hosted (S3, localhost, etc.).
  // This avoids localhost:3000 redirects when testing from S3.
  redirectUri: "https://vdc-prod.vercel.app/life-sciences/app/callback/",

  // Logout URI: same idea – after logout, return to the Vercel login page.
  logoutUri: "https://vdc-prod.vercel.app/life-sciences/app/login/",

  scopes: ["openid", "email", "profile"],

  // API Gateway HTTP API
  apiBaseUrl: requireEnv(
    "NEXT_PUBLIC_VDC_API_BASE_URL",
    "https://js97cus4h2.execute-api.us-west-2.amazonaws.com"
  ),
};
