import React from 'react';
import Link from 'next/link';
import { AlertOctagon, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '40px 24px',
      background: 'radial-gradient(circle at top, hsl(var(--bg-tertiary)) 0%, hsl(var(--bg-primary)) 100%)'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        padding: '50px 40px',
        textAlign: 'center',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn 0.4s ease forwards'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'hsla(var(--accent-danger), 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--accent-danger))',
          marginBottom: '24px'
        }}>
          <AlertOctagon size={32} />
        </div>

        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Page Not Found</h2>
        <p style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', lineHeight: 1.6, marginBottom: '32px' }}>
          Sorry, the page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>

        <Link href="/" className="btn btn-primary" style={{ height: '44px', gap: '8px', padding: '0 24px', display: 'inline-flex' }}>
          <Home size={16} /> Back to Homepage
        </Link>
      </div>
    </div>
  );
}
