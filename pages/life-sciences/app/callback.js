// pages/life-sciences/app/callback.js
// OAuth callback handler - exchanges authorization code for tokens

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { exchangeCodeForTokens, setTokens, getUserFromToken } from "@/lib/life_sciences_app_lib/auth";

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get code and state from URL
        const code = router.query.code;
        const state = router.query.state;
        const errorParam = router.query.error;

        // Check for OAuth errors
        if (errorParam) {
          throw new Error(`Authentication failed: ${errorParam}`);
        }

        if (!code) {
          setStatus("Waiting for authorization code...");
          return;
        }

        setStatus("Exchanging authorization code for tokens...");

        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);
        
        if (!tokens) {
          throw new Error("Failed to obtain access tokens");
        }

        setStatus("Storing authentication tokens...");

        // Store tokens
        setTokens(tokens);

        setStatus("Getting user information...");

        // Get user info from token
        const user = getUserFromToken(tokens.id_token);
        
        if (!user) {
          throw new Error("Failed to extract user information from token");
        }

        // Validate that the logged-in user matches the selected user (if one was selected)
        const selectedUserKey = typeof window !== "undefined" ? window.sessionStorage.getItem("vdc_selected_user") : null;
        if (selectedUserKey) {
          // Expected emails for each user key
          const expectedEmails = {
            submitter1: "williamoconnellpmp+submitter1@gmail.com",
            submitter2: "williamoconnellpmp+submitter2@gmail.com",
            approver1: "williamoconnellpmp+approver1@gmail.com",
            approver2: "williamoconnellpmp+approver2@gmail.com",
          };
          
          const expectedEmail = expectedEmails[selectedUserKey];
          if (expectedEmail && expectedEmail !== user.email) {
            console.error(`[Callback] User mismatch! Expected ${expectedEmail}, got ${user.email}`);
            // Clear tokens and redirect back to login with error
            const { clearTokens } = require("@/lib/life_sciences_app_lib/auth");
            clearTokens();
            throw new Error(`You were logged in as ${user.email}, but you selected a different user. Please log out from Cognito and try again with the correct account.`);
          } else if (expectedEmail) {
            console.log(`[Callback] User match confirmed: ${user.email}`);
          }
        }

        setStatus("Login successful! Redirecting...");

        // Check user role from token and redirect accordingly
        const userRole = user?.role || 'Submitter';
        let returnTo;
        
        if (state) {
          // Use the state parameter if provided (from login page)
          returnTo = decodeURIComponent(state);
        } else if (userRole === 'Approver') {
          // Approvers go to Pending Approvals
          returnTo = "/life-sciences/app/approval/approvals";
        } else {
          // Submitters go to Overview
          returnTo = "/life-sciences/app";
        }

        // Close login popup window if this callback is in a popup
        // Also notify parent window to clear sticky MFA box
        if (typeof window !== "undefined") {
          // Check if we're in a popup window
          if (window.opener && !window.opener.closed) {
            // We're in a popup - notify parent to clear MFA box and redirect
            try {
              const selectedUser = sessionStorage.getItem("vdc_selected_user");
              window.opener.postMessage({ 
                type: "VDC_LOGIN_SUCCESS", 
                userKey: selectedUser,
                returnTo: returnTo
              }, window.location.origin);
              
              // Clear session storage in popup
              sessionStorage.removeItem("vdc_approver_mfa_needed");
              sessionStorage.removeItem("vdc_selected_user");
            } catch (e) {
              console.log("Could not notify parent window:", e);
            }
          } else {
            // We're in the main window - clear MFA box from sessionStorage
            sessionStorage.removeItem("vdc_approver_mfa_needed");
            sessionStorage.removeItem("vdc_selected_user");
          }
        }
        
        // Small delay to show success message, then redirect
        setTimeout(() => {
          // If in popup, redirect parent and close popup
          if (window.opener && !window.opener.closed) {
            try {
              // Redirect parent window to the app
              window.opener.location.href = returnTo;
              // Small delay to ensure redirect starts, then close popup
              setTimeout(() => {
                window.close();
              }, 300);
            } catch (e) {
              // If we can't access opener (cross-origin), just close popup
              window.close();
            }
          } else {
            // Normal redirect in main window
            router.replace(returnTo);
          }
        }, 500);

      } catch (err) {
        console.error("OAuth callback error:", err);
        
        // If it's a user mismatch error, provide a helpful message with logout option
        if (err.message && err.message.includes("but you selected a different user")) {
          setError(err.message);
          setStatus("User mismatch detected");
        } else {
          setError(err.message);
          setStatus("Authentication failed");
        }
      }
    }

    if (router.isReady) {
      handleCallback();
    }
  }, [router, router.isReady, router.query]);

  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#0a1628"
      }}>
        <div style={{ 
          padding: "2rem", 
          textAlign: "center",
          maxWidth: "500px"
        }}>
          <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>
            Authentication Error
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
            {error}
          </p>
          {error && error.includes("but you selected a different user") ? (
            <>
              <p style={{ color: "#fbbf24", marginBottom: "1rem", fontSize: "0.9rem" }}>
                Redirecting to Cognito logout in 3 seconds... Or click below to go to login page.
              </p>
              <button
                onClick={() => {
                  const { CONFIG } = require("@/lib/life_sciences_app_lib/config");
                  const { clearTokens } = require("@/lib/life_sciences_app_lib/auth");
                  clearTokens();
                  window.location.href = "/life-sciences/app/login?force=true";
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  marginRight: "0.5rem"
                }}
              >
                Go to Login Page
              </button>
              <button
                onClick={() => {
                  const { CONFIG } = require("@/lib/life_sciences_app_lib/config");
                  const cognitoLogoutUrl = `${CONFIG.cognitoDomain}/logout?` +
                    `client_id=${CONFIG.clientId}&` +
                    `logout_uri=${encodeURIComponent(window.location.origin + "/life-sciences/app/login?force=true")}`;
                  window.location.href = cognitoLogoutUrl;
                }}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                Logout from Cognito
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/life-sciences/app/login")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "100vh",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#0a1628"
    }}>
      <div style={{ 
        padding: "2rem", 
        textAlign: "center",
        maxWidth: "400px"
      }}>
        <h2 style={{ color: "#fff", marginBottom: "1rem" }}>
          {status}
        </h2>
        <div style={{ 
          marginTop: "2rem",
          display: "flex",
          justifyContent: "center"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #334155",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
        </div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}