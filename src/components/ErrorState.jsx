import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ errorDetails, onTryAgain }) {
  return (
    <div className="main-content">
      <div className="error-container">
        <div className="error-icon-wrapper">
          <AlertCircle size={28} />
        </div>
        <h2 className="error-title">Something went wrong.</h2>
        <p className="error-message">
          THINKPOINT couldn't process this right now.
        </p>

        {errorDetails && (
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.825rem',
            color: '#64748B',
            marginBottom: '1.25rem',
            textAlign: 'left',
            fontFamily: 'monospace'
          }}>
            {errorDetails}
          </div>
        )}

        <button type="button" className="btn-primary" onClick={onTryAgain}>
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
