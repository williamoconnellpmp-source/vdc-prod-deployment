// pages/life-sciences/app/login-approver.js
// Approver login - select account, auto-populate credentials, show MFA code

import { useState } from "react";
import { useRouter } from "next/router";
import { CONFIG } from "@/lib/life_sciences_app_lib/config";
import TOTPGenerator from "@/components/TOTPGenerator";

const APPROVER_ACCOUNTS = [
  { 
    id: 1, 
    email: 'williamoconnellpmp+approver1@gmail.com', 
    password: 'Password123!',
    label: 'Approver 1'
  },
  { 
    id: 2, 
    email: 'williamoconnellpmp+approver2@gmail.com', 
    password: 'Password123!',
    label: 'Approver 2'
  }
];

export default function ApproverLogin() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  };

  const handleLogin = () => {
    if (!selectedAccount) return;

    setIsRedirecting(true);

    // Build Cognito login URL
    const returnTo = router.query.returnTo || "/life-sciences/app/approval/approvals";
    
    // Use redirect_uri exactly as configured (no trailing slash modification)
    const redirectUri = CONFIG.redirectUri;
    
    const params = new URLSearchParams({
      client_id: CONFIG.clientId,
      response_type: "code",
      scope: CONFIG.scopes.join(" "),
      redirect_uri: redirectUri,  // URLSearchParams will encode this
      state: returnTo  // URLSearchParams will encode this automatically
      // Note: Cognito Hosted UI doesn't support username pre-fill via URL parameters
      // User must manually enter email and password on the Cognito login screen
    });

    // Use /oauth2/authorize endpoint (correct OAuth endpoint)
    const cognitoUrl = `${CONFIG.cognitoDomain}/oauth2/authorize?${params.toString()}`;
    
    // Debug: Log the URL being used (remove in production)
    console.log("=== Cognito Login Debug ===");
    console.log("Current URL:", window.location.href);
    console.log("Hostname:", window.location.hostname);
    console.log("Port:", window.location.port);
    console.log("Config Redirect URI:", CONFIG.redirectUri);
    console.log("Final Redirect URI:", redirectUri);
    console.log("Full Cognito URL:", cognitoUrl);
    console.log("Decoded redirect_uri from URL:", new URL(cognitoUrl).searchParams.get('redirect_uri'));
    console.log("===========================");
    
    // Redirect to Cognito with username pre-filled
    // User will enter password and MFA code manually
    window.location.href = cognitoUrl;
  };

  const handleBack = () => {
    router.push('/life-sciences/app/login');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button onClick={handleBack} className="back-button">← Back to Role Selection</button>

        <div className="login-header">
          <h1>Approver Login</h1>
          <p>Select your account and use the MFA code below</p>
        </div>

        <div className="account-selection">
          {APPROVER_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              onClick={() => handleAccountSelect(account)}
              className={`account-card ${selectedAccount?.id === account.id ? 'selected' : ''}`}
            >
              <div className="account-info">
                <div className="account-label">{account.label}</div>
                <div className="account-email">{account.email}</div>
              </div>
              {selectedAccount?.id === account.id && (
                <div className="selected-indicator">✓</div>
              )}
            </button>
          ))}
        </div>

        {selectedAccount && (
          <>
            <div className="credentials-preview">
              <div className="credential-item">
                <span className="label">Email:</span>
                <code>{selectedAccount.email}</code>
              </div>
              <div className="credential-item">
                <span className="label">Password:</span>
                <code>{selectedAccount.password}</code>
              </div>
            </div>

            <div className="mfa-section">
              <h3>MFA Code Required</h3>
              <TOTPGenerator email={selectedAccount.email} />
                  <div className="mfa-instructions">
                    <p><strong>⚠️ Instructions:</strong></p>
                    <ol>
                      <li>Click "Continue to Login" below</li>
                      <li>On the Cognito login screen, enter the email address shown above</li>
                      <li>Enter the password shown above</li>
                      <li>When asked for MFA, enter the 6-digit code shown above</li>
                      <li>The code refreshes every 30 seconds - use a fresh one!</li>
                    </ol>
                    <p style={{ marginTop: '0.75rem', color: '#fbbf24' }}>
                      <strong>Note:</strong> Cognito doesn't allow auto-fill for security reasons, so you'll need to type the email and password manually.
                    </p>
                  </div>
            </div>
          </>
        )}

        <button 
          onClick={handleLogin}
          disabled={!selectedAccount || isRedirecting}
          className="login-button"
        >
          {isRedirecting ? 'Redirecting to Cognito...' : 'Continue to Login'}
        </button>

        <div className="login-footer">
          <p>This is a demonstration system showcasing GxP-compliant document control.</p>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%);
          padding: 2rem;
        }

        .login-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .back-button {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem 0;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .back-button:hover {
          color: #fbbf24;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          color: #fff;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: #94a3b8;
        }

        .account-selection {
          margin-bottom: 1.5rem;
        }

        .account-card {
          width: 100%;
          background: #334155;
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s;
          text-align: left;
        }

        .account-card:hover {
          background: #475569;
          border-color: #fbbf24;
        }

        .account-card.selected {
          background: #1e3a5f;
          border-color: #fbbf24;
        }

        .account-info {
          flex: 1;
        }

        .account-label {
          color: #fff;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .account-email {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .selected-indicator {
          color: #fbbf24;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .credentials-preview {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .credential-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .credential-item:last-child {
          margin-bottom: 0;
        }

        .credential-item .label {
          color: #94a3b8;
          min-width: 80px;
          margin-right: 0.5rem;
        }

        .credential-item code {
          background: #1e293b;
          color: #60a5fa;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          flex: 1;
        }

        .mfa-section {
          margin-bottom: 1.5rem;
        }

        .mfa-section h3 {
          color: #fff;
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }

        .mfa-instructions {
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .mfa-instructions p {
          margin-bottom: 0.75rem;
        }

        .mfa-instructions strong {
          color: #fbbf24;
        }

        .mfa-instructions ol {
          margin: 0;
          padding-left: 1.5rem;
        }

        .mfa-instructions li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .login-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .login-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #334155;
        }

        .login-footer p {
          color: #94a3b8;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
