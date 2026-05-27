'use client';
import { API_BASE_URL } from '@/config';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import { toggleTheme } from '@/store/uiSlice';
import { Search, ShoppingCart, Heart, User, Sun, Moon, LogOut, Menu, X } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const { theme } = useSelector(state => state.ui);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const suggestionRef = useRef(null);

  // Debounced search autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/search/suggestions?query=${searchQuery}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.suggestions);
        }
      } catch (err) {
        console.error('Autocomplete Error:', err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/products?search=${searchQuery}`);
    }
  };

  const handleSuggestionClick = (id) => {
    setSearchQuery('');
    setShowSuggestions(false);
    router.push(`/products/${id}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      borderRadius: 0
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: '22px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '1px'
        }}>
          APEX
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} ref={suggestionRef} className="header-search-form" style={{
          position: 'relative',
          width: '40%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search premium electronics, fashion..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="form-input"
            style={{
              paddingLeft: '44px',
              paddingRight: '16px',
              height: '42px',
              fontSize: '13px',
              borderRadius: 'var(--radius-full)'
            }}
          />
          <Search size={18} style={{
            position: 'absolute',
            left: '16px',
            color: 'hsl(var(--text-muted))'
          }} />

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '48px',
              left: 0,
              width: '100%',
              backgroundColor: 'hsl(var(--bg-secondary))',
              border: '1px solid hsl(var(--border-color))',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              zIndex: 110
            }}>
              {suggestions.map(s => (
                <div
                  key={s.id}
                  onClick={() => handleSuggestionClick(s.id)}
                  style={{
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid hsl(var(--border-color))',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--bg-tertiary))'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontWeight: 500 }}>{s.name}</span>
                  <span className="badge badge-new" style={{ fontSize: '9px' }}>In Catalog</span>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Action Buttons (Desktop) */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }} className="desktop-nav">
          <Link href="/products" style={{ fontSize: '14px', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>
            Shop
          </Link>

          <button onClick={() => dispatch(toggleTheme())} style={{
            color: 'hsl(var(--text-secondary))',
            padding: '8px',
            borderRadius: 'var(--radius-full)',
            transition: 'background-color 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'hsl(var(--bg-tertiary))'}
             onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <Link href="/wishlist" style={{ color: 'hsl(var(--text-secondary))', position: 'relative' }}>
            <Heart size={20} />
          </Link>

          <Link href="/cart" style={{
            color: 'hsl(var(--text-secondary))',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'hsl(var(--bg-tertiary))'
          }}>
            <ShoppingCart size={20} style={{ marginRight: '8px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Cart</span>
            {cartCount > 0 && (
              <span className="badge-discount" style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'hsl(var(--accent-primary))',
                color: 'white',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/profile'} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                <User size={18} />
                <span>{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} style={{ color: 'hsl(var(--accent-danger))' }}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}>
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Nav Icons (shown only on mobile) */}
        <div className="mobile-nav-toggle" style={{
          display: 'none',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Cart Icon directly visible in header on mobile */}
          <Link href="/cart" style={{
            color: 'hsl(var(--text-secondary))',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: '6px'
          }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="badge-discount" style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: 'hsl(var(--accent-primary))',
                color: 'white',
                fontSize: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger Menu Toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            color: 'hsl(var(--text-secondary))',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {mobileMenuOpen ? <X size={22} style={{ color: 'hsl(var(--accent-danger))' }} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: 0,
          width: '100%',
          height: 'calc(100vh - 70px)',
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid hsl(var(--border-color))',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          padding: '30px 24px',
          gap: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }} className="animate-fade-in">
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, display: 'block', padding: '10px 0', borderBottom: '1px solid hsl(var(--border-color))' }}>
            Shop Catalog
          </Link>

          <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', borderBottom: '1px solid hsl(var(--border-color))' }}>
            <Heart size={18} /> My Wishlist
          </Link>

          {isAuthenticated && (
            <Link href="/orders" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, display: 'block', padding: '10px 0', borderBottom: '1px solid hsl(var(--border-color))' }}>
              My Orders
            </Link>
          )}

          {isAuthenticated ? (
            <Link href={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/profile'} onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0', borderBottom: '1px solid hsl(var(--border-color))' }}>
              <User size={18} /> My Account ({user.name.split(' ')[0]})
            </Link>
          ) : null}

          {/* Theme Toggle in Mobile Menu */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid hsl(var(--border-color))' }}>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>Switch Mode</span>
            <button onClick={() => dispatch(toggleTheme())} style={{
              color: 'hsl(var(--text-secondary))',
              padding: '8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'hsl(var(--bg-tertiary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <div style={{ marginTop: 'auto', paddingBottom: '60px' }}>
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ width: '100%', height: '48px', color: 'hsl(var(--accent-danger))', borderColor: 'hsla(var(--accent-danger), 0.2)' }}>
                <LogOut size={16} /> Sign Out
              </button>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%', height: '48px' }}>
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
          .header-search-form { width: 50% !important; margin: 0 10px !important; }
        }
        @media (max-width: 480px) {
          .header-search-form { width: 42% !important; }
        }
      `}</style>
    </header>
  );
}
