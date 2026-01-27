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
        
        // Small delay to show success message
        setTimeout(() => {
          router.replace(returnTo);
        }, 500);

      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err.message);
        setStatus("Authentication failed");
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