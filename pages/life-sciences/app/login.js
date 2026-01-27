import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/life_sciences_app_lib/config";
import TOTPGenerator from "@/components/TOTPGenerator";

// User credentials for demonstration
export const USER_CREDENTIALS = {
  submitter1: {
    email: "williamoconnellpmp+submitter1@gmail.com",
    password: "Password123!",
    role: "Submitter",
    displayName: "Submitter 1",
    requiresMFA: true, // MFA now required for all users
  },
  submitter2: {
    email: "williamoconnellpmp+submitter2@gmail.com",
    password: "Password123!",
    role: "Submitter",
    displayName: "Submitter 2",
    requiresMFA: true, // MFA now required for all users
  },
  approver1: {
    email: "williamoconnellpmp+approver1@gmail.com",
    password: "Password123!",
    role: "Approver",
    displayName: "Approver 1",
    requiresMFA: true,
  },
  approver2: {
    email: "williamoconnellpmp+approver2@gmail.com",
    password: "Password123!",
    role: "Approver",
    displayName: "Approver 2",
    requiresMFA: true,
  },
};

export default function ProductionLoginPage() {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState(null);
  const [approverMfaVisible, setApproverMfaVisible] = useState(null); // Track which approver MFA to show prominently

  // Check if user is already logged in - redirect to app
  // BUT: If there's a ?force=true query param or logout flag, always show login page
  useEffect(() => {
    if (typeof window === "undefined" || !router.isReady) return;
    
    // Check for logout flag (set during logout)
    const logoutFlag = typeof window !== "undefined" ? window.sessionStorage.getItem("vdc_logout_flag") : null;
    const isForcedLogout = router.query.force === "true" || logoutFlag;
    
    // Debug logging
    console.log("[Login Page] Check:", {
      force: router.query.force,
      logoutFlag: logoutFlag,
      isForcedLogout: isForcedLogout,
      hasTokens: !!window.localStorage.getItem("vdc_cognito_tokens")
    });
    
    // If force=true or logout flag exists, clear any tokens and show login page
    // This MUST run before the isLoggedIn check
    if (isForcedLogout) {
      console.log("[Login Page] Forced logout detected - clearing tokens");
      try {
        const { clearTokens } = require("@/lib/life_sciences_app_lib/auth");
        // Clear tokens immediately
        clearTokens();
        // Also manually clear to be absolutely sure
        window.localStorage.removeItem("vdc_cognito_tokens");
        // Clear the logout flag
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("vdc_logout_flag");
        }
        // Remove the force parameter from URL after a brief delay
        if (router.query.force === "true") {
          setTimeout(() => {
            const newQuery = { ...router.query };
            delete newQuery.force;
            router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
          }, 50);
        }
        console.log("[Login Page] Tokens cleared, showing login page");
        // CRITICAL: Return early to prevent any redirect check
        return;
      } catch (e) {
        console.error("Error clearing tokens on force logout:", e);
        // Continue to show login page even on error
        return;
      }
    }
    
    // Only check if logged in if we're NOT forcing a logout
    // Double-check that force is not set and logout flag doesn't exist
    if (!isForcedLogout) {
      try {
        const { getCurrentUser, isLoggedIn } = require("@/lib/life_sciences_app_lib/auth");
        const loggedIn = isLoggedIn && isLoggedIn();
        console.log("[Login Page] Checking login status:", { loggedIn });
        
        if (loggedIn) {
          const user = getCurrentUser();
          console.log("[Login Page] User found, redirecting:", user);
          if (user) {
            // User is already logged in - redirect to appropriate page
            const returnTo = router.query.returnTo || 
                           (user.role === "Approver" ? "/life-sciences/app/approval/approvals" : "/life-sciences/app");
            router.replace(returnTo);
          }
        }
      } catch (e) {
        console.error("[Login Page] Error checking login:", e);
        // Auth functions not available or error - continue to show login page
      }
    }
  }, [router.isReady, router.query.force]);

  // Handle OAuth callback
  useEffect(() => {
    if (!router.isReady) return;

    const { code, error: oauthErr, error_description } = router.query;

    // If Cognito sent an OAuth error
    if (oauthErr) {
      console.error("OAuth error:", oauthErr, error_description);
      setApproverMfaVisible(null); // Clear MFA box on error
      return;
    }

    // If we have a code, redirect to callback handler
    if (code) {
      router.replace(`/life-sciences/app/callback?code=${code}`);
      return;
    }
  }, [router.isReady, router.query]);

  // Listen for successful login from popup window
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleMessage(event) {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "VDC_LOGIN_SUCCESS") {
        // Clear sticky MFA box when login succeeds
        setApproverMfaVisible(null);
        sessionStorage.removeItem("vdc_approver_mfa_needed");
        sessionStorage.removeItem("vdc_selected_user");
        
        // If callback provided a returnTo, redirect there
        // Otherwise, the callback will handle redirect in the popup
        if (event.data?.returnTo) {
          // Small delay to ensure popup closes first
          setTimeout(() => {
            window.location.href = event.data.returnTo;
          }, 500);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  function copyToClipboard(text, fieldName) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  function handleUserSelect(userKey, openCognito = true) {
    const user = USER_CREDENTIALS[userKey];

    // Store selected user info for reference (not for auto-fill per GxP)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vdc_selected_user", userKey);
      // Store MFA flag (used by callback / other flows)
      if (user.requiresMFA) {
        sessionStorage.setItem("vdc_approver_mfa_needed", "true");
      }
    }
    
    // Only proceed with Cognito login if explicitly requested
    if (!openCognito) {
      return;
    }
    
    // Build Cognito login URL
    const returnTo = router.query.returnTo || (user.role === "Approver" ? "/life-sciences/app/approval/approvals" : "/life-sciences/app");
    const redirectUri = CONFIG.redirectUri;
    
    const params = new URLSearchParams({
      client_id: CONFIG.clientId,
      response_type: "code",
      scope: CONFIG.scopes.join(" "),
      redirect_uri: redirectUri,
      state: returnTo,
      login_hint: user.email, // Hint to Cognito which email to use (helps with autofill)
      prompt: "login", // Force Cognito to show login page even if user has active session
    });
    
    // Add timestamp to URL to make it unique and prevent Cognito from using cached session
    const timestamp = Date.now();
    const cognitoUrl = `${CONFIG.cognitoDomain}/oauth2/authorize?${params.toString()}&_t=${timestamp}`;
    
    // Show prominent MFA & credentials for this user in the sticky panel
    setApproverMfaVisible(userKey);
    
    // First, try to clear Cognito session by opening logout in hidden iframe
    // This helps prevent Cognito from auto-logging in with previous session
    const clearCognitoSession = () => {
      return new Promise((resolve) => {
        // For localhost, skip Cognito logout (may not be registered)
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (isLocalhost) {
          resolve();
          return;
        }
        
        try {
          const logoutUrl = `${CONFIG.cognitoDomain}/logout?` +
            `client_id=${CONFIG.clientId}&` +
            `logout_uri=${encodeURIComponent(window.location.origin + "/life-sciences/app/login")}`;
          
          // Create hidden iframe to clear Cognito session
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.src = logoutUrl;
          document.body.appendChild(iframe);
          
          // Wait a bit for logout to complete, then remove iframe
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch (e) {
          console.warn("Could not clear Cognito session:", e);
          resolve(); // Continue anyway
        }
      });
    };
    
    // Clear session, then open login popup
    clearCognitoSession().then(() => {
      // Open in new window/tab - user can see MFA codes and credentials on original page
      // Add a timestamp to the window name to prevent browser from reusing the same window
      const windowName = `CognitoLogin_${Date.now()}`;
      const cognitoWindow = window.open(
        cognitoUrl,
        windowName,
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );
      
      // Focus on new window but keep original page visible
      if (cognitoWindow) {
        // Don't focus immediately - let user see the sticky MFA box first
        setTimeout(() => {
          cognitoWindow.focus();
        }, 1000);
        
        // Monitor when popup closes or navigates away (login success)
        const checkClosed = setInterval(() => {
          if (cognitoWindow.closed) {
            clearInterval(checkClosed);
            setApproverMfaVisible(null);
            sessionStorage.removeItem("vdc_approver_mfa_needed");
            sessionStorage.removeItem("vdc_selected_user");
          } else {
            // Check if popup has navigated to callback (login success)
            try {
              const popupUrl = cognitoWindow.location.href;
              if (popupUrl && popupUrl.includes("/callback")) {
                clearInterval(checkClosed);
                // Don't clear MFA box yet - wait for callback to complete
                // The callback will send a message to close it
              }
            } catch (e) {
              // Cross-origin error - popup is on Cognito domain, can't access
              // This is normal, continue checking
            }
          }
        }, 500);
      } else {
        // If popup blocked, fall back to same window redirect with warning
        const proceed = confirm("Popup blocked. If you proceed, this page will redirect and you'll need to open this login page in another tab to see MFA codes.\n\nClick OK to proceed, or Cancel to allow popups and try again.");
        if (proceed) {
          window.location.href = cognitoUrl;
        } else {
          setApproverMfaVisible(null); // Clear if cancelled
        }
      }
    });
  }

  return (
    <>
      <Head>
        <title>VDC Production Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        {/* Sticky MFA & Credentials Display (shown when login window is open for any user) */}
        {approverMfaVisible && (
          <div style={styles.stickyMfaContainer}>
            <div style={styles.stickyMfaBox}>
              <div style={styles.stickyMfaHeader}>
                <div style={styles.stickyMfaTitle}>
                  🔐 MFA Code for {USER_CREDENTIALS[approverMfaVisible].displayName}
                </div>
                <button
                  type="button"
                  onClick={() => setApproverMfaVisible(null)}
                  style={styles.stickyMfaClose}
                  title="Close"
                >
                  ×
                </button>
              </div>
              <div style={styles.stickyMfaContent}>
                <div style={styles.stickyMfaEmailWarning}>
                  <strong>⚠️ Verify Email in Cognito Popup:</strong><br />
                  Expected: <code style={styles.stickyMfaEmailCode}>{USER_CREDENTIALS[approverMfaVisible].email}</code><br />
                  <small>If the Cognito popup shows a different email, clear it and type the correct one above.</small>
                </div>
                {/* Credentials for this role (email + password) */}
                <div style={styles.credentialsSection}>
                  <div style={styles.credentialField}>
                    <div style={styles.fieldLabel}>Email:</div>
                    <div style={styles.fieldValue}>
                      <code style={styles.code}>{USER_CREDENTIALS[approverMfaVisible].email}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(USER_CREDENTIALS[approverMfaVisible].email, `${approverMfaVisible}-email`)}
                        style={styles.copyButton}
                        title="Copy email to clipboard"
                      >
                        {copiedField === `${approverMfaVisible}-email` ? "✓" : "📋"}
                      </button>
                    </div>
                  </div>
                  <div style={styles.credentialField}>
                    <div style={styles.fieldLabel}>Password:</div>
                    <div style={styles.fieldValue}>
                      <code style={styles.code}>{USER_CREDENTIALS[approverMfaVisible].password}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(USER_CREDENTIALS[approverMfaVisible].password, `${approverMfaVisible}-password`)}
                        style={styles.copyButton}
                        title="Copy password to clipboard"
                      >
                        {copiedField === `${approverMfaVisible}-password` ? "✓" : "📋"}
                      </button>
                    </div>
                  </div>
                </div>
                <TOTPGenerator email={USER_CREDENTIALS[approverMfaVisible].email} />
                <div style={styles.stickyMfaInstructions}>
                  <strong>Keep this page open!</strong><br />
                  Copy the email, password, and the MFA code above when Cognito asks for them during login.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top header */}
        <header style={styles.topHeader}>
          <div style={styles.headerContainer}>
            <Link href="/" style={styles.homeLink}>Home</Link>
            <div style={styles.headerDivider}>|</div>
            <div style={styles.headerInfo}>
              <span style={styles.headerName}>William O&apos;Connell</span>
              <span style={styles.headerSep}>|</span>
              <span>Seattle, WA</span>
              <span style={styles.headerSep}>|</span>
              <span>(206) 551-5524</span>
              <span style={styles.headerSep}>|</span>
              <span>WilliamOConnellPMP@gmail.com</span>
            </div>
          </div>
        </header>

        <div style={styles.centerWrap}>
          <div style={styles.card}>
            <h1 style={styles.h1}>VDC Production Login</h1>
            <p style={styles.subtitle}>Validated Document Control System</p>

            {/* GxP Disclaimer */}
            <div style={styles.disclaimerBox}>
              <div style={styles.disclaimerTitle}>⚠️ Important: GxP Compliance Notice</div>
              <div style={styles.disclaimerText}>
                <strong>This demonstration system uses a non-standard authentication approach that is NOT compliant with GxP regulations.</strong>
              </div>
              <div style={styles.disclaimerText}>
                GxP strictly forbids displaying credentials on login screens and auto-populating authentication fields. 
                This approach is used <strong>solely for demonstration purposes</strong> to showcase AWS Cognito authentication 
                and MFA capabilities. In a production GxP environment, credentials would never be displayed, and users 
                would authenticate through secure, compliant methods.
              </div>
              <div style={styles.disclaimerText}>
                <strong>Best practices require:</strong> Individual user accounts, secure credential management, 
                no credential display, and proper identity verification. This demo violates these practices intentionally 
                to demonstrate Cognito and MFA functionality.
              </div>
            </div>

            {/* User Selection Notice with Role Buttons */}
            <div style={styles.noticeBox}>
              <div style={styles.noticeTitle}>🔐 Authorized Users Only</div>
              <div style={styles.noticeText}>
                <strong>Only the following four user accounts are authorized to access this system.</strong><br />
                Select a role below to open the Cognito login page and show credentials + MFA for that role in the top-right panel.
              </div>
              <div style={styles.roleButtonsContainer}>
                <button
                  type="button"
                  onClick={() => handleUserSelect("submitter1", true)}
                  style={{
                    ...styles.roleButton,
                    ...(approverMfaVisible === "submitter1" ? styles.roleButtonActive : {})
                  }}
                >
                  Submitter 1
                </button>
                <button
                  type="button"
                  onClick={() => handleUserSelect("submitter2", true)}
                  style={{
                    ...styles.roleButton,
                    ...(approverMfaVisible === "submitter2" ? styles.roleButtonActive : {})
                  }}
                >
                  Submitter 2
                </button>
                <button
                  type="button"
                  onClick={() => handleUserSelect("approver1", true)}
                  style={{
                    ...styles.roleButton,
                    ...(approverMfaVisible === "approver1" ? styles.roleButtonActive : {})
                  }}
                >
                  Approver 1
                </button>
                <button
                  type="button"
                  onClick={() => handleUserSelect("approver2", true)}
                  style={{
                    ...styles.roleButton,
                    ...(approverMfaVisible === "approver2" ? styles.roleButtonActive : {})
                  }}
                >
                  Approver 2
                </button>
              </div>
              <div style={styles.noticeText}>
                <strong>Your own email address will NOT work.</strong> You must use one of the four accounts listed above.
              </div>
            </div>

            {/* Footer Note */}
            <div style={styles.footerNote}>
              <div style={styles.footerTitle}>📝 Instructions:</div>
              <div style={styles.footerText}>
                <strong>MFA is required for all users.</strong><br /><br />
                
                1. Click one of the role buttons above (Submitter 1, Submitter 2, Approver 1, or Approver 2).<br />
                2. Copy the email and password shown, then click "Sign in with Cognito".<br />
                3. A popup window will open with the Cognito login page - <strong>keep this page open!</strong><br />
                4. Paste the email and password into the Cognito login form.<br />
                5. When Cognito asks for MFA, a <strong>sticky MFA code box</strong> will appear on this page (top right).<br />
                6. Copy the 6-digit MFA code from the sticky box and paste it into Cognito.<br />
                7. <strong>Important:</strong> Keep this page visible so you can see the MFA code - it updates every 30 seconds!<br /><br />
                
                <strong>Note:</strong> Fields are not auto-populated in accordance with GxP best practices, 
                even though this demonstration violates other GxP requirements for credential display.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #071023 0%, #0b1a35 100%)",
    color: "#ffffff",
  },
  topHeader: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
  },
  headerContainer: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "10px 18px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  homeLink: {
    textDecoration: "none",
    fontWeight: 800,
    color: "#fff",
    opacity: 0.95,
  },
  headerDivider: {
    opacity: 0.35,
    color: "#fff",
  },
  headerInfo: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    fontSize: 14,
    color: "#fff",
    opacity: 0.95,
  },
  headerName: {
    fontWeight: 900,
  },
  headerSep: {
    opacity: 0.35,
  },
  centerWrap: {
    minHeight: "calc(100vh - 52px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "24px",
    paddingTop: "40px",
  },
  card: {
    width: "100%",
    maxWidth: 900,
    borderRadius: 18,
    padding: 32,
    background: "rgba(10, 20, 40, 0.72)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
    color: "#ffffff",
  },
  h1: {
    margin: 0,
    fontSize: 36,
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 24,
  },
  disclaimerBox: {
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    background: "rgba(185, 28, 28, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#fca5a5",
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 10,
  },
  noticeBox: {
    marginTop: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    background: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(96, 165, 250, 0.3)",
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#93c5fd",
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  userList: {
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 1.8,
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 20,
    fontSize: 22,
    fontWeight: 800,
    color: "#ffffff",
  },
  roleCard: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 14,
    background: "rgba(15, 25, 45, 0.6)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  roleHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  roleIcon: {
    fontSize: 32,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 20,
    fontWeight: 900,
    color: "#ffffff",
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  roleArrow: {
    fontSize: 24,
    color: "rgba(255,255,255,0.6)",
  },
  credentialsSection: {
    marginTop: 20,
  },
  userButtons: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  userButton: {
    flex: 1,
    minWidth: 200,
    padding: "14px 20px",
    borderRadius: 12,
    border: "1px solid rgba(91, 108, 255, 0.4)",
    background: "linear-gradient(90deg, rgba(91, 108, 255, 0.2), rgba(139, 92, 246, 0.2))",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s",
  },
  credentialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
  },
  credentialCard: {
    padding: 16,
    borderRadius: 12,
    background: "rgba(6, 12, 28, 0.75)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  credentialTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  credentialField: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 6,
  },
  fieldValue: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  code: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    background: "rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#5b6cff",
    fontFamily: "monospace",
    fontSize: 13,
    wordBreak: "break-all",
  },
  copyButton: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    minWidth: 40,
  },
  footerNote: {
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.85)",
  },
  stickyMfaContainer: {
    position: "fixed",
    top: "60px",
    right: "20px",
    zIndex: 1000,
    maxWidth: 350,
  },
  stickyMfaBox: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    border: "2px solid rgba(255,255,255,0.3)",
  },
  stickyMfaHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stickyMfaTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: "#ffffff",
  },
  stickyMfaClose: {
    background: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "50%",
    width: 28,
    height: 28,
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  stickyMfaContent: {
    color: "#ffffff",
  },
  stickyMfaEmailWarning: {
    marginBottom: 16,
    padding: 12,
    background: "rgba(251, 191, 36, 0.25)",
    border: "1px solid rgba(251, 191, 36, 0.5)",
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 1.6,
  },
  stickyMfaEmailCode: {
    fontFamily: "monospace",
    fontSize: 11,
    background: "rgba(0,0,0,0.3)",
    padding: "2px 6px",
    borderRadius: 4,
    color: "#fef3c7",
  },
  stickyMfaInstructions: {
    marginTop: 12,
    padding: 12,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.5,
  },
  roleButtonsContainer: {
    display: "flex",
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  roleButton: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid rgba(91, 108, 255, 0.4)",
    background: "rgba(91, 108, 255, 0.1)",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.2s",
    minWidth: 120,
  },
  roleButtonActive: {
    background: "linear-gradient(90deg, rgba(91, 108, 255, 0.3), rgba(139, 92, 246, 0.3))",
    border: "1px solid rgba(91, 108, 255, 0.6)",
    boxShadow: "0 0 10px rgba(91, 108, 255, 0.3)",
  },
  selectedUserCard: {
    marginTop: 24,
    padding: 24,
    borderRadius: 14,
    background: "rgba(15, 25, 45, 0.8)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
  },
  selectedUserHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  selectedUserTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 900,
    color: "#ffffff",
  },
  selectedUserClose: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "50%",
    width: 32,
    height: 32,
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 900,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  selectedUserCredentials: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  selectedUserField: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  selectedUserLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(255,255,255,0.8)",
  },
  selectedUserValue: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  selectedUserCode: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 8,
    background: "rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#5b6cff",
    fontFamily: "monospace",
    fontSize: 14,
    wordBreak: "break-all",
  },
  loginButton: {
    width: "100%",
    padding: "16px 24px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, rgba(91, 108, 255, 0.8), rgba(139, 92, 246, 0.8))",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
    marginTop: 8,
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(91, 108, 255, 0.3)",
  },
};
