'use client';

import React, { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Captured by Product Error Boundary:', error);
  }, [error]);

  return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '640px', margin: '0 auto', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(var(--accent-danger))', marginBottom: '16px' }}>
          Oops! Something went wrong
        </h2>
        <p style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '24px', lineHeight: 1.6 }}>
          We encountered an error while loading this product. Here is the detail:
        </p>
        <div style={{
          backgroundColor: 'hsl(var(--bg-tertiary))',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'left',
          fontSize: '13px',
          fontFamily: 'monospace',
          overflowX: 'auto',
          marginBottom: '24px',
          border: '1px solid hsl(var(--border-color))',
          color: 'hsl(var(--text-primary))'
        }}>
          {error?.message || String(error)}
        </div>
        <button onClick={() => reset()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
