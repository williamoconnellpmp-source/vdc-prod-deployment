// pages/life-sciences/app/_lib/config.js

function requireEnv(name, fallback) {
  const v = process.env[name];
  return v && String(v).trim().length > 0 ? v : fallback;
}

// IMPORTANT:
// - Production should ALWAYS default to williamoconnellpmp.com
// - Localhost is only for explicit local testing via env vars
//
// If you run locally and need different ports, set:
//   NEXT_PUBLIC_VDC_REDIRECT_URI
//   NEXT_PUBLIC_VDC_LOGOUT_URI
// Example:
//   NEXT_PUBLIC_VDC_REDIRECT_URI=http://localhost:3001/life-sciences/app/callback/
//   NEXT_PUBLIC_VDC_LOGOUT_URI=http://localhost:3001/life-sciences/app/login/
const DEFAULT_PROD_LOGIN = "https://williamoconnellpmp.com/life-sciences/app/login/";
const DEFAULT_PROD_CALLBACK = "https://williamoconnellpmp.com/life-sciences/app/callback/";

// Localhost defaults (used ONLY when window says we're on localhost
// or when you override via NEXT_PUBLIC_* env vars during local testing)
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
      // With trailing slash to match Cognito (used ONLY for local testing)
      return `http://localhost:${actualPort}/life-sciences/app/callback/`;
    }
  }
  // When we can't inspect window (build time / SSR), default to production domain
  return DEFAULT_PROD_CALLBACK;
}

function getDefaultLogoutUri() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If on Vercel (vercel.app domain) or production domain
    if (hostname.includes('vercel.app') || hostname === 'williamoconnellpmp.com') {
      return `https://${window.location.host}/life-sciences/app/login/`;
    }
    
    // If on localhost, use the actual port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const actualPort = port || '3000';
      // Local testing only
      return `http://localhost:${actualPort}/life-sciences/app/login/`;
    }
  }
  // Fallback to production login URL
  return DEFAULT_PROD_LOGIN;
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

  // Callback URI: Use environment variable, fallback to auto-detection
  redirectUri: requireEnv(
    "NEXT_PUBLIC_VDC_REDIRECT_URI",
    getDefaultCallbackUri()
  ),

  // Logout URI: Use environment variable, fallback to auto-detection
  logoutUri: requireEnv(
    "NEXT_PUBLIC_VDC_LOGOUT_URI",
    getDefaultLogoutUri()
  ),

  scopes: ["openid", "email", "profile"],

  // API Gateway HTTP API
  apiBaseUrl: requireEnv(
    "NEXT_PUBLIC_VDC_API_BASE_URL",
    "https://js97cus4h2.execute-api.us-west-2.amazonaws.com"
  ),
};
