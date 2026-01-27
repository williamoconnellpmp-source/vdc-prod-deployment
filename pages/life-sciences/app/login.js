import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CONFIG } from "@/lib/life_sciences_app_lib/config";
import TOTPGenerator from "@/components/TOTPGenerator";

// User credentials for demonstration
const USER_CREDENTIALS = {
  submitter1: {
    email: "williamoconnellpmp+submitter1@gmail.com",
    password: "Password123!",
    role: "Submitter",
    displayName: "Submitter 1",
    requiresMFA: false,
  },
  submitter2: {
    email: "williamoconnellpmp+submitter2@gmail.com",
    password: "Password123!",
    role: "Submitter",
    displayName: "Submitter 2",
    requiresMFA: false,
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

  // Handle OAuth callback
  useEffect(() => {
    if (!router.isReady) return;

    const { code, error: oauthErr, error_description } = router.query;

    // If Cognito sent an OAuth error
    if (oauthErr) {
      console.error("OAuth error:", oauthErr, error_description);
      return;
    }

    // If we have a code, redirect to callback handler
    if (code) {
      router.replace(`/life-sciences/app/callback?code=${code}`);
      return;
    }
  }, [router.isReady, router.query]);

  function copyToClipboard(text, fieldName) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  function handleUserSelect(userKey) {
    const user = USER_CREDENTIALS[userKey];
    
    // Store selected user info for reference (not for auto-fill per GxP)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("vdc_selected_user", userKey);
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
    });
    
    const cognitoUrl = `${CONFIG.cognitoDomain}/oauth2/authorize?${params.toString()}`;
    
    // Redirect to Cognito hosted UI
    window.location.href = cognitoUrl;
  }

  return (
    <>
      <Head>
        <title>VDC Production Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
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

            {/* User Selection Notice */}
            <div style={styles.noticeBox}>
              <div style={styles.noticeTitle}>🔐 Authorized Users Only</div>
              <div style={styles.noticeText}>
                <strong>Only the following four user accounts are authorized to access this system:</strong>
              </div>
              <ul style={styles.userList}>
                <li><strong>Submitter 1</strong> - williamoconnellpmp+submitter1@gmail.com</li>
                <li><strong>Submitter 2</strong> - williamoconnellpmp+submitter2@gmail.com</li>
                <li><strong>Approver 1</strong> - williamoconnellpmp+approver1@gmail.com (MFA Required)</li>
                <li><strong>Approver 2</strong> - williamoconnellpmp+approver2@gmail.com (MFA Required)</li>
              </ul>
              <div style={styles.noticeText}>
                <strong>Your own email address will NOT work.</strong> You must use one of the four accounts listed above.
              </div>
            </div>

            <h2 style={styles.sectionTitle}>Select Your Role</h2>

            {/* Submitter Role Card */}
            <div style={styles.roleCard}>
              <div style={styles.roleHeader}>
                <div style={styles.roleIcon}>📄</div>
                <div style={styles.roleInfo}>
                  <div style={styles.roleName}>Submitter</div>
                  <div style={styles.roleDesc}>Submit documents for approval</div>
                </div>
                <div style={styles.roleArrow}>→</div>
              </div>

              {/* Submitter Credentials */}
              <div style={styles.credentialsSection}>
                <div style={styles.userButtons}>
                  <button
                    type="button"
                    onClick={() => handleUserSelect("submitter1")}
                    style={styles.userButton}
                  >
                    Login as Submitter 1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserSelect("submitter2")}
                    style={styles.userButton}
                  >
                    Login as Submitter 2
                  </button>
                </div>

                <div style={styles.credentialsGrid}>
                  {/* Submitter 1 */}
                  <div style={styles.credentialCard}>
                    <div style={styles.credentialTitle}>Submitter 1</div>
                    <div style={styles.credentialField}>
                      <div style={styles.fieldLabel}>Email:</div>
                      <div style={styles.fieldValue}>
                        <code style={styles.code}>{USER_CREDENTIALS.submitter1.email}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(USER_CREDENTIALS.submitter1.email, "submitter1-email")}
                          style={styles.copyButton}
                          title="Copy to clipboard"
                        >
                          {copiedField === "submitter1-email" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div style={styles.credentialField}>
                      <div style={styles.fieldLabel}>Password:</div>
                      <div style={styles.fieldValue}>
                        <code style={styles.code}>{USER_CREDENTIALS.submitter1.password}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(USER_CREDENTIALS.submitter1.password, "submitter1-password")}
                          style={styles.copyButton}
                          title="Copy to clipboard"
                        >
                          {copiedField === "submitter1-password" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submitter 2 */}
                  <div style={styles.credentialCard}>
                    <div style={styles.credentialTitle}>Submitter 2</div>
                    <div style={styles.credentialField}>
                      <div style={styles.fieldLabel}>Email:</div>
                      <div style={styles.fieldValue}>
                        <code style={styles.code}>{USER_CREDENTIALS.submitter2.email}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(USER_CREDENTIALS.submitter2.email, "submitter2-email")}
                          style={styles.copyButton}
                          title="Copy to clipboard"
                        >
                          {copiedField === "submitter2-email" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div style={styles.credentialField}>
                      <div style={styles.fieldLabel}>Password:</div>
                      <div style={styles.fieldValue}>
                        <code style={styles.code}>{USER_CREDENTIALS.submitter2.password}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(USER_CREDENTIALS.submitter2.password, "submitter2-password")}
                          style={styles.copyButton}
                          title="Copy to clipboard"
                        >
                          {copiedField === "submitter2-password" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approver Role Card */}
            <div style={styles.roleCard}>
              <div style={styles.roleHeader}>
                <div style={styles.roleIcon}>✓</div>
                <div style={styles.roleInfo}>
                  <div style={styles.roleName}>Approver</div>
                  <div style={styles.roleDesc}>Review and approve documents (MFA Required)</div>
                </div>
                <div style={styles.roleArrow}>→</div>
              </div>

              {/* Approver Credentials */}
              <div style={styles.credentialsSection}>
                <div style={styles.userButtons}>
                  <button
                    type="button"
                    onClick={() => handleUserSelect("approver1")}
                    style={styles.userButton}
                  >
                    Login as Approver 1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserSelect("approver2")}
                    style={styles.userButton}
                  >
                    Login as Approver 2
                  </button>
                </div>

                <div style={styles.credentialsGrid}>
                  {/* Approver 1 */}
                  <div style={styles.credentialCard}>
                    <div style={styles.credentialTitle}>Approver 1</div>
                    <div style={styles.credentialField}>
                      <div style={styles.fieldLabel}>Email:</div>
                      <div style={styles.fieldValue}>
                        <code style={styles.code}>{USER_CREDENTIALS.approver1.email}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(USER_CREDENTIALS.approver1.email, "approver1-email")}
                          style={styles.copyButton}
                          title="Copy to clipboard"
                        >
                          {copiedField === "approver1-email" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div style={styles.credentialField}>
                      <div style={styles.fieldLabel}>Password:</div>
                      <div style={styles.fieldValue}>
                        <code style={styles.code}>{USER_CREDENTIALS.approver1.password}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(USER_CREDENTIALS.approver1.password, "approver1-password")}
                          style={styles.copyButton}
                          title="Copy to clipboard"
                        >
                          {copiedField === "approver1-password" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div style={styles.credentialField}>
                      <TOTPGenerator email={USER_CREDENTIALS.approver1.email} />
                    </div>
                  </div>

                  {/* Approver 2 */}
                  <div style={styles.credentialCard}>
                    <div style={styles.credentialTitle}>Approver 2</div>
                    <div style={styles.credentialField}>
                      <div style={styles.fieldLabel}>Email:</div>
                      <div style={styles.fieldValue}>
                        <code style={styles.code}>{USER_CREDENTIALS.approver2.email}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(USER_CREDENTIALS.approver2.email, "approver2-email")}
                          style={styles.copyButton}
                          title="Copy to clipboard"
                        >
                          {copiedField === "approver2-email" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div style={styles.credentialField}>
                      <div style={styles.fieldLabel}>Password:</div>
                      <div style={styles.fieldValue}>
                        <code style={styles.code}>{USER_CREDENTIALS.approver2.password}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(USER_CREDENTIALS.approver2.password, "approver2-password")}
                          style={styles.copyButton}
                          title="Copy to clipboard"
                        >
                          {copiedField === "approver2-password" ? "✓" : "📋"}
                        </button>
                      </div>
                    </div>
                    <div style={styles.credentialField}>
                      <TOTPGenerator email={USER_CREDENTIALS.approver2.email} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div style={styles.footerNote}>
              <div style={styles.footerTitle}>📝 Instructions:</div>
              <div style={styles.footerText}>
                1. Click one of the four user buttons above to proceed to the Cognito login page.<br />
                2. Copy and paste the email and password for your selected user into the Cognito login form.<br />
                3. For Approvers, copy the MFA code from above when prompted during login.<br />
                4. <strong>Note:</strong> Fields are not auto-populated in accordance with GxP best practices, 
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
};
