'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '@/store/authSlice';
import { addToast } from '@/store/uiSlice';
import { User, Mail, Lock, Store } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSeller, setIsSeller] = useState(false);

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
    if (!name || !email || !password) {
      dispatch(addToast({ message: 'Please enter all fields', type: 'error' }));
      return;
    }

    const role = isSeller ? 'seller' : 'customer';

    dispatch(registerUser({ name, email, password, role })).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(addToast({ message: `Welcome to Apex, ${name}!`, type: 'success' }));
      } else {
        dispatch(addToast({ message: action.payload || 'Registration failed', type: 'error' }));
      }
    });
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
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Create Account</h2>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>Join our modern e-commerce marketplace.</p>
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
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '44px' }}
              placeholder="John Doe"
              required
            />
            <User size={16} style={{
              position: 'absolute',
              left: '16px',
              top: '40px',
              color: 'hsl(var(--text-muted))'
            }} />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '44px' }}
              placeholder="john@example.com"
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

          {/* Role Checkbox (Resume Highlight) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'hsl(var(--bg-tertiary))',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsl(var(--border-color))',
            marginBottom: '24px',
            cursor: 'pointer'
          }} onClick={() => setIsSeller(!isSeller)}>
            <input
              type="checkbox"
              checked={isSeller}
              onChange={() => {}} // handled by click on parent div
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={16} style={{ color: isSeller ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-muted))' }} />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>Register as a Vendor Seller</span>
                <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>List products & access the Seller Dashboard.</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{
          fontSize: '13px',
          color: 'hsl(var(--text-secondary))',
          textAlign: 'center',
          marginTop: '32px'
        }}>
          Already have an account? <Link href="/auth/login" style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
