import React from 'react';

export default function LoadingSpinner({ fullPage = false, size = 36, message = '' }) {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div className="loading-spinner" style={{ width: size, height: size }} />
      {message && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', width: '100%'
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
