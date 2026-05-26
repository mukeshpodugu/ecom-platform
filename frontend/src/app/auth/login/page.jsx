'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, setMockUser, clearAuthError } from '@/store/authSlice';
import { addToast } from '@/store/uiSlice';
import { Sparkles, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [isAuthenticated, router, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      dispatch(addToast({ message: 'Please enter all fields', type: 'error' }));
      return;
    }

    dispatch(loginUser({ email, password })).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(addToast({ message: 'Welcome back!', type: 'success' }));
      } else {
        dispatch(addToast({ message: action.payload || 'Login failed', type: 'error' }));
      }
    });
  };

  // Mock Google Login Helper
  const handleGoogleLoginMock = () => {
    const mockUser = {
      _id: 'google-user-id',
      name: 'Google Test User',
      email: 'googleuser@gmail.com',
      role: 'customer',
      isVerified: true,
      addresses: []
    };
    dispatch(setMockUser({ user: mockUser, token: 'mock-google-jwt-token' }));
    dispatch(addToast({ message: 'Logged in with Google!', type: 'success' }));
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 24px',
      background: 'radial-gradient(circle at top, hsl(var(--bg-tertiary)) 0%, hsl(var(--bg-primary)) 100%)'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '420px',
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        animation: 'fadeIn 0.4s ease forwards'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Sign In</h2>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>Access your orders, cart, and personalized feed.</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'hsla(var(--accent-danger), 0.1)',
            border: '1px solid hsla(var(--accent-danger), 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'hsl(var(--accent-danger))',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '44px' }}
              placeholder="name@example.com"
              required
            />
            <Mail size={16} style={{
              position: 'absolute',
              left: '16px',
              top: '40px',
              color: 'hsl(var(--text-muted))'
            }} />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '44px' }}
              placeholder="••••••••"
              required
            />
            <Lock size={16} style={{
              position: 'absolute',
              left: '16px',
              top: '40px',
              color: 'hsl(var(--text-muted))'
            }} />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          fontSize: '12px',
          color: 'hsl(var(--text-muted))'
        }}>
          <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid hsl(var(--border-color))' }} />
          <span style={{ padding: '0 12px' }}>OR CONTINUE WITH</span>
          <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid hsl(var(--border-color))' }} />
        </div>

        {/* Google OAuth mock */}
        <button
          onClick={handleGoogleLoginMock}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.85-2.22 2.27v1.88h3.58c2.1-1.94 3.69-5.12 3.69-9.98z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.58-2.77c-.99.66-2.23 1.06-4.35 1.06-3.36 0-6.21-2.27-7.22-5.33H1.15v2.88C3.13 20.18 7.24 24 12 24z"/>
            <path fill="#FBBC05" d="M4.78 14.05c-.26-.77-.41-1.6-.41-2.45s.15-1.68.41-2.45V6.27H1.15C.42 7.72 0 9.5 0 11.6s.42 3.88 1.15 5.33l3.63-2.88z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.24 0 3.13 3.82 1.15 7.72l3.63 2.88c1.01-3.06 3.86-5.33 7.22-5.33z"/>
          </svg>
          Google Login (Mock)
        </button>

        <p style={{
          fontSize: '13px',
          color: 'hsl(var(--text-secondary))',
          textAlign: 'center',
          marginTop: '32px'
        }}>
          New to Apex? <Link href="/auth/signup" style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600 }}>Create an account</Link>
        </p>

        {/* Demo Credentials Alert */}
        <div className="glass-panel" style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'hsl(var(--bg-tertiary))',
          border: '1px solid hsl(var(--border-color))'
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <ShieldCheck size={14} style={{ color: 'hsl(var(--accent-success))' }} /> Demo Accounts:
          </h4>
          <ul style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))', paddingLeft: '16px' }}>
            <li><strong>Customer:</strong> user@apex.com (pwd: user123)</li>
            <li><strong>Seller:</strong> seller@apex.com (pwd: seller123)</li>
            <li><strong>Admin:</strong> admin@apex.com (pwd: admin123)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
