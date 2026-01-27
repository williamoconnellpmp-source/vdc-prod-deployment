// pages/life-sciences/app/login-submitter.js
// Submitter login - select account and auto-populate credentials

import { useState } from "react";
import { useRouter } from "next/router";
import { CONFIG } from "@/lib/life_sciences_app_lib/config";

const SUBMITTER_ACCOUNTS = [
  { 
    id: 1, 
    email: 'williamoconnellpmp+submitter1@gmail.com', 
    password: 'Password123!',
    label: 'Submitter 1'
  },
  { 
    id: 2, 
    email: 'williamoconnellpmp+submitter2@gmail.com', 
    password: 'Password123!',
    label: 'Submitter 2'
  }
];

export default function SubmitterLogin() {
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
    const returnTo = router.query.returnTo || "/life-sciences/app";
    
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
    console.log("Cognito Login URL:", cognitoUrl);
    console.log("Redirect URI:", CONFIG.redirectUri);
    
    // Redirect to Cognito
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
          <h1>Submitter Login</h1>
          <p>Select your account to continue</p>
        </div>

        <div className="account-selection">
          {SUBMITTER_ACCOUNTS.map((account) => (
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
          <div className="credentials-preview">
            <div className="credential-item">
              <span className="label">Email:</span>
              <code>{selectedAccount.email}</code>
            </div>
            <div className="credential-item">
              <span className="label">Password:</span>
              <code>{selectedAccount.password}</code>
            </div>
            <div className="info-note">
              <strong>⚠️ Important:</strong> On the next screen (Cognito login), you'll need to:
              <ol style={{ marginTop: '0.5rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
                <li>Enter the email address shown above</li>
                <li>Enter the password shown above</li>
              </ol>
              <strong>Note:</strong> Cognito doesn't allow auto-fill for security reasons, so you'll need to type the password manually.
            </div>
          </div>
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
          max-width: 500px;
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
          color: #60a5fa;
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
          border-color: #60a5fa;
        }

        .account-card.selected {
          background: #1e3a5f;
          border-color: #60a5fa;
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
          color: #60a5fa;
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

        .info-note {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #334155;
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .info-note strong {
          color: #fbbf24;
        }

        .login-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
