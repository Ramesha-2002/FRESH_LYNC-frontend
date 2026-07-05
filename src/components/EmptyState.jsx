import React from 'react';

export default function EmptyState({ icon: Icon, title, subtitle, action, actionLabel }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center',
    }}>
      {Icon && (
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--color-background)',
          border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <Icon size={32} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      )}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: 360, lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {subtitle}
        </p>
      )}
      {action && (
        <button className="btn-primary" onClick={action}>{actionLabel}</button>
      )}
    </div>
  );
}
