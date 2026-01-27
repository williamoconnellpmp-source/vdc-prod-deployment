// lib/life_sciences_app_lib/api.js
//
// PROD mode API client (with Cognito JWT):
// - Uses JWT tokens from Cognito authentication
// - Sends Authorization header with Bearer token
// - API Gateway validates JWT via JWT Authorizer

import { CONFIG } from "./config";
import { getCurrentUser, requireAuthOrRedirect, getAccessToken, clearTokens } from "./auth";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    (value.constructor === Object || Object.getPrototypeOf(value) === Object.prototype)
  );
}

export async function apiFetch(path, options = {}, router = null) {
  // Prevent accidental server-side calls (should only be used in effects / handlers).
  if (typeof window === "undefined") {
    throw new ApiError("apiFetch is client-only in demo mode.", 500);
  }

  // Require demo login
  const ok = requireAuthOrRedirect(router, window.location.pathname || "/life-sciences/app");
  if (!ok) throw new ApiError("Not signed in.", 401);

  const user = getCurrentUser();
  const url = `${CONFIG.apiBaseUrl}${path}`;

  const headers = new Headers(options.headers || {});

  // Body handling:
  // - FormData: send as-is, do NOT set JSON content-type
  // - Plain object: JSON.stringify and set application/json
  // - String/Blob/etc: send as-is; caller controls headers
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

  let body = options?.body;

  if (isFormData) {
    // let browser set multipart boundary
  } else if (isPlainObject(body)) {
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");
    body = JSON.stringify(body);
  } else if (typeof body === "string") {
    // assume caller knows what they're doing
  } else if (body == null) {
    // no body
  } else {
    // For other body types (Blob/ArrayBuffer/etc), do not force JSON
    // but if caller didn't set anything and it's not FormData, default JSON is NOT safe here.
  }

  // PROD: Send JWT token in Authorization header
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    // If no token, redirect to login
    if (router) {
      router.push("/life-sciences/app/login");
    }
    throw new ApiError("Not authenticated. Please log in.", 401);
  }

  // Log request details for debugging
  console.log("[apiFetch] Making request:", {
    url,
    method: options.method || "GET",
    hasToken: !!accessToken,
    tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : "none"
  });

  let res;
  try {
    res = await fetch(url, { ...options, body, headers });
  } catch (fetchError) {
    // Network error (CORS, connection refused, etc.)
    console.error("[apiFetch] Fetch error:", fetchError);
    throw new ApiError(
      `Network error: ${fetchError.message}. Check API endpoint (${url}) and CORS configuration.`,
      0,
      { originalError: fetchError.message, url }
    );
  }
  
  // If 401, clear tokens and redirect to login
  if (res.status === 401) {
    clearTokens();
    if (router) {
      router.push("/life-sciences/app/login");
    }
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  let bodyText = "";
  try {
    bodyText = await res.text();
  } catch {
    bodyText = "";
  }

  let data = null;
  try {
    data = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    data = bodyText || null;
  }

  if (!res.ok) {
    // Log detailed error information for debugging
    console.error("[apiFetch] API Error Response:", {
      status: res.status,
      statusText: res.statusText,
      url: url,
      responseData: data,
      responseText: bodyText
    });
    
    // Try to extract meaningful error message
    let msg = `Request failed (${res.status})`;
    
    if (data) {
      // Check various common error response formats
      if (data.error) {
        msg = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
      } else if (data.message) {
        msg = data.message;
      } else if (data.errorMessage) {
        msg = data.errorMessage;
      } else if (typeof data === "string") {
        msg = data;
      } else if (data.errors && Array.isArray(data.errors)) {
        msg = data.errors.map(e => e.message || e).join(", ");
      } else {
        // Fallback: show the whole response if it's small
        const dataStr = JSON.stringify(data);
        if (dataStr.length < 200) {
          msg = dataStr;
        }
      }
    } else if (bodyText && bodyText.length < 200) {
      msg = bodyText;
    }
    
    throw new ApiError(msg, res.status, data);
  }

  return data;
}
