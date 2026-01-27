// components/TOTPGenerator.jsx
// Live TOTP code generator for demo accounts

import { useState, useEffect } from 'react';
import { generateSync } from 'otplib';

// TOTP secrets for demo accounts (these would be the actual secrets from Cognito MFA setup)
// Base32 encoded secrets - must be at least 26 characters to decode to 16+ bytes
const DEMO_TOTP_SECRETS = {
  'williamoconnellpmp+approver1@gmail.com': 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
  'williamoconnellpmp+approver2@gmail.com': 'MJSWG3DPEBUW23DPMJSWG3DPEBUW23DP'
};

export default function TOTPGenerator({ email }) {
  const [code, setCode] = useState('------');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!DEMO_TOTP_SECRETS[email]) return;

    const secret = DEMO_TOTP_SECRETS[email];

    const updateCode = () => {
      try {
        const newCode = generateSync({ secret: secret });
        if (newCode && typeof newCode === 'string') {
          setCode(newCode);
        } else {
          setCode('------');
        }
        
        // Calculate time left until next code
        const now = Math.floor(Date.now() / 1000);
        const remaining = 30 - (now % 30);
        setTimeLeft(remaining);
        
        // Code is "ready" if it has more than 20 seconds left (fresh code)
        setIsReady(remaining > 20);
      } catch (error) {
        console.error('TOTP generation error:', error);
      }
    };

    // Update immediately
    updateCode();

    // Update every second
    const interval = setInterval(updateCode, 1000);

    return () => clearInterval(interval);
  }, [email]);

  if (!DEMO_TOTP_SECRETS[email]) {
    return null;
  }

  return (
    <div className="totp-generator">
      {isReady && (
        <div className="ready-indicator">
          ✅ Ready to Login - Code is fresh!
        </div>
      )}
      
      <div className="totp-display">
        <div className="totp-label">Current MFA Code:</div>
        <div className={`totp-code ${isReady ? 'ready' : ''}`}>
          {code.slice(0, 3)} {code.slice(3, 6)}
        </div>
        <div className="totp-timer">
          Refreshes in {timeLeft}s
          {!isReady && timeLeft <= 20 && (
            <span className="wait-warning"> ⏳ Wait for new code</span>
          )}
        </div>
      </div>
      
      <div className="totp-instructions">
        <p className="text-sm text-gray-400">
          {isReady 
            ? "✅ Code is fresh! Click 'Sign in with Cognito' now and use this code when prompted."
            : "Copy this 6-digit code when prompted for MFA during login"
          }
        </p>
      </div>

      <style jsx>{`
        .totp-generator {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0;
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          position: relative;
        }
        
        .ready-indicator {
          background: rgba(34, 197, 94, 0.9);
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .totp-display {
          text-align: center;
        }
        
        .totp-label {
          color: rgba(255,255,255,0.8);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .totp-code {
          font-family: 'Courier New', monospace;
          font-size: 2.5rem;
          font-weight: bold;
          color: #ffffff;
          letter-spacing: 0.5rem;
          margin: 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.3s;
        }
        
        .totp-code.ready {
          transform: scale(1.05);
          text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }
        
        .totp-timer {
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        .wait-warning {
          color: #fbbf24;
          font-weight: 600;
        }
        
        .totp-instructions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
