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

  // Callback URI: Use env var if set, otherwise auto-detect based on current hostname
  // For Vercel: Set NEXT_PUBLIC_VDC_REDIRECT_URI=https://your-app.vercel.app/life-sciences/app/callback
  redirectUri: requireEnv("NEXT_PUBLIC_VDC_REDIRECT_URI", getDefaultCallbackUri()),

  // Logout URI: Use env var if set, otherwise default to login page
  logoutUri: requireEnv("NEXT_PUBLIC_VDC_LOGOUT_URI", DEFAULT_LOCAL_LOGIN),

  scopes: ["openid", "email", "profile"],

  // API Gateway HTTP API
  apiBaseUrl: requireEnv(
    "NEXT_PUBLIC_VDC_API_BASE_URL",
    "https://js97cus4h2.execute-api.us-west-2.amazonaws.com"
  ),
};
