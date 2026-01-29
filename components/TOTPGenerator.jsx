// components/TOTPGenerator.jsx
// Live TOTP code generator for demo accounts

import { useState, useEffect } from 'react';
import { generateSync } from 'otplib';

// TOTP secrets for demo accounts - Actual secrets from Cognito MFA enrollment
// Base32 encoded secrets from Cognito MFA setup (2026-01-26)
// These are the REAL secrets that match Cognito's enrolled MFA devices
const DEMO_TOTP_SECRETS = {
  'williamoconnellpmp+submitter1@gmail.com': '2CLDKWW5T7YNDM3SUEEUKUYMENBU7P72SW7VQFONBRX6WMM7VWGA',
  'williamoconnellpmp+submitter2@gmail.com': 'BVV4RPSDDMTOEKFDHUIOKC4M2JY4SSUDX73RMFRDJ57V6AX4T3SA',
  'williamoconnellpmp+approver1@gmail.com': '4AIKZWZAKWPIUZIQWWHY5UVW67K7J2UCDKORQ54UBARZLC7QUMBA',
  'williamoconnellpmp+approver2@gmail.com': 'A6QQFOCIIN5KKFBPW2EBNCTQAKBAK6BGUFWWWP3A2FKCHY6FYU6Q'
};

export default function TOTPGenerator({ email, onCopyMfa, copiedField, fieldPrefix, onCodeChange }) {
  const [code, setCode] = useState('------');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isReady, setIsReady] = useState(false);
  const showCopy = !!onCopyMfa && code !== '------';
  const mfaKey = fieldPrefix ? `${fieldPrefix}-mfa` : 'mfa';
  const isCopied = copiedField === mfaKey;

  useEffect(() => {
    if (!DEMO_TOTP_SECRETS[email]) return;

    const secret = DEMO_TOTP_SECRETS[email];

    const updateCode = () => {
      try {
        const newCode = generateSync({
          secret: secret,
          digits: 6,
          step: 30,
          algorithm: 'sha1',
          encoding: 'base32'
        });
        
        if (newCode && typeof newCode === 'string' && newCode.length === 6) {
          setCode(newCode);
          if (typeof onCodeChange === 'function') onCodeChange(newCode);
        } else {
          setCode('------');
          if (typeof onCodeChange === 'function') onCodeChange('');
          console.error('Invalid TOTP code generated:', newCode);
        }
        
        const now = Math.floor(Date.now() / 1000);
        const remaining = 30 - (now % 30);
        setTimeLeft(remaining);
        setIsReady(remaining > 20);
      } catch (error) {
        console.error('TOTP generation error:', error);
      }
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [email, onCodeChange]);

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
        
        .totp-code-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .totp-copy-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .totp-copy-btn:hover {
          background: rgba(255,255,255,0.25);
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
