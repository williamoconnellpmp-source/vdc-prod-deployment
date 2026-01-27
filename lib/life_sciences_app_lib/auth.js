// lib/life_sciences_app_lib/auth.js
// Real Cognito OAuth Authentication with JWT tokens

import { CONFIG } from "./config";

const TOKEN_KEY = "vdc_cognito_tokens";
export const DEMO_SESSION_KEY = "vdc_demo_session"; // Backward compatibility for demo-login
const REDIRECT_LOCK_KEY = "vdc_redirect_lock_ts";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeGetLocationPathname() {
  if (!isBrowser()) return "";
  try {
    return window.location?.pathname || "";
  } catch (e) {
    return "";
  }
}

function isOnLoginPath() {
  const p = safeGetLocationPathname();
  return p === "/life-sciences/app/login" || 
         p.startsWith("/life-sciences/app/login/") ||
         p === "/life-sciences/app/callback" ||
         p.startsWith("/life-sciences/app/callback/");
}

function redirectLocked() {
  if (!isBrowser()) return false;
  try {
    const raw = window.sessionStorage.getItem(REDIRECT_LOCK_KEY);
    const ts = raw ? Number(raw) : 0;
    return ts && Date.now() - ts < 1500;
  } catch (e) {
    return false;
  }
}

function setRedirectLock() {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(REDIRECT_LOCK_KEY, String(Date.now()));
  } catch (e) {}
}

function clearRedirectLock() {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(REDIRECT_LOCK_KEY);
  } catch (e) {}
}

// Parse JWT token (without verification - verification happens on backend)
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}

// Get tokens from storage
export function getTokens() {
  if (!isBrowser()) return null;
  
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    
    const tokens = JSON.parse(raw);
    return tokens;
  } catch (e) {
    console.error("Failed to get tokens:", e);
    return null;
  }
}

// Store tokens
export function setTokens(tokens) {
  if (!isBrowser()) return false;
  
  try {
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    clearRedirectLock();
    return true;
  } catch (e) {
    console.error("Failed to store tokens:", e);
    return false;
  }
}

// Clear tokens
export function clearTokens() {
  if (!isBrowser()) return;
  
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
  
  clearRedirectLock();
}

// Check if token is expired
export function isExpired(token) {
  if (!token) return true;
  
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  
  // Check with 60 second buffer
  return Date.now() >= (payload.exp * 1000) - 60000;
}

// Get access token
export function getAccessToken() {
  const tokens = getTokens();
  if (!tokens || !tokens.access_token) return null;
  
  if (isExpired(tokens.access_token)) {
    clearTokens();
    return null;
  }
  
  return tokens.access_token;
}

// Get user from ID token
export function getUserFromToken(idToken) {
  const payload = parseJwt(idToken);
  if (!payload) return null;
  
  // Extract Cognito groups
  const groups = payload["cognito:groups"] || [];
  
  // Determine role from groups
  let role = "Submitter"; // default
  if (groups.includes("Approver")) {
    role = "Approver";
  }
  
  return {
    displayName: payload.email || payload["cognito:username"] || "User",
    email: payload.email,
    role: role,
    groups: groups,
    sub: payload.sub,
  };
}

// Get current user
export function getCurrentUser() {
  const tokens = getTokens();
  if (!tokens || !tokens.id_token) return null;
  
  if (isExpired(tokens.id_token)) {
    clearTokens();
    return null;
  }
  
  return getUserFromToken(tokens.id_token);
}

// Check if user is logged in
export function isLoggedIn() {
  return !!getCurrentUser();
}

// Get user role
export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || null;
}

// Check if user has required role
export function hasRole(requiredRoles) {
  const role = getUserRole();
  if (!role) return false;
  if (Array.isArray(requiredRoles)) return requiredRoles.includes(role);
  return role === requiredRoles;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code) {
  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CONFIG.clientId,
      code: code,
      redirect_uri: CONFIG.redirectUri,
    });

    const response = await fetch(`${CONFIG.cognitoDomain}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token exchange failed:", error);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const tokens = await response.json();
    return tokens;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    throw error;
  }
}

// Require authentication or redirect
export function requireAuthOrRedirect(router, returnTo = "/life-sciences/app") {
  if (!isBrowser()) return false;

  // Allow login/callback pages
  if (isOnLoginPath()) return true;

  // Check if logged in
  if (isLoggedIn()) return true;

  // Prevent redirect loop
  if (redirectLocked()) return false;

  const encoded = encodeURIComponent(returnTo || "/life-sciences/app");
  const dest = `/life-sciences/app/login?returnTo=${encoded}`;

  setRedirectLock();

  try {
    if (router && typeof router.replace === "function") {
      router.replace(dest);
    } else {
      window.location.assign(dest);
    }
  } catch (e) {
    window.location.assign(dest);
  }

  return false;
}

// Require role or redirect
export function requireRoleOrRedirect(router, requiredRoles, returnTo = "/life-sciences/app") {
  if (!isBrowser()) return false;

  const ok = requireAuthOrRedirect(router, returnTo);
  if (!ok) return false;

  if (hasRole(requiredRoles)) return true;

  const reason = encodeURIComponent("not_authorized");
  const dest = `/life-sciences/app?reason=${reason}`;

  try {
    if (router && typeof router.replace === "function") {
      router.replace(dest);
    } else {
      window.location.assign(dest);
    }
  } catch (e) {
    window.location.assign(dest);
  }

  return false;
}

// Logout
export function logout(router) {
  clearTokens();

  // Build Cognito logout URL with redirect to role selection
  const params = new URLSearchParams({
    client_id: CONFIG.clientId,
    logout_uri: `${typeof window !== 'undefined' ? window.location.origin : ''}/life-sciences/app/login`,
  });

  const logoutUrl = `${CONFIG.cognitoDomain}/logout?${params.toString()}`;

  if (isBrowser()) {
    // Redirect to Cognito logout, which will then redirect to role selection
    window.location.href = logoutUrl;
  }
}

// Build login URL
export function buildLoginUrl(returnTo = "/life-sciences/app") {
  const encoded = encodeURIComponent(returnTo || "/life-sciences/app");
  return `/life-sciences/app/login?returnTo=${encoded}`;
}

// Build logout URL
export function buildLogoutUrl() {
  const params = new URLSearchParams({
    client_id: CONFIG.clientId,
    logout_uri: CONFIG.logoutUri,
  });
  return `${CONFIG.cognitoDomain}/logout?${params.toString()}`;
}

// Get user groups from ID token
export function getUserGroupsFromIdToken() {
  const tokens = getTokens();
  if (!tokens || !tokens.id_token) return [];
  
  const payload = parseJwt(tokens.id_token);
  return payload?.["cognito:groups"] || [];
}

// Backward compatibility exports for demo-login
export function setCurrentUser(user) {
  // Demo mode stub - does nothing in production
  console.warn("setCurrentUser called but demo mode is disabled in production");
  return false;
}

export function clearDemoSession() {
  // Demo mode stub - clears real tokens
  clearTokens();
}