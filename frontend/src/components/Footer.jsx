import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'hsl(var(--bg-secondary))',
      borderTop: '1px solid hsl(var(--border-color))',
      padding: '60px 0 30px 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Company Info */}
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 800,
            marginBottom: '20px',
            background: 'linear-gradient(135deg, hsl(var(--accent-primary)), hsl(var(--accent-secondary)))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            APEX MARKETPLACE
          </h3>
          <p style={{
            color: 'hsl(var(--text-secondary))',
            fontSize: '13px',
            lineHeight: 1.6,
            marginBottom: '15px'
          }}>
            Experience the future of digital commerce. Shop curated premium items, track shipments in real-time, and get AI recommendations suited to your tastes.
          </p>
          <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
            © 2026 Apex Inc. All rights reserved.
          </span>
        </div>

        {/* Categories */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase' }}>Shop Categories</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['Electronics', 'Fashion & Apparel', 'Home & Living', 'Fitness & Outdoors'].map((item) => (
              <li key={item} style={{ marginBottom: '12px' }}>
                <Link href="/products" className="footer-link" style={{ fontSize: '13px' }}>
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase' }}>Resources</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {[
              { name: 'About Us', href: '/about' },
              { name: 'Contact Support', href: '/contact' },
              { name: 'Careers', href: '#' },
              { name: 'Privacy Policy', href: '#' },
              { name: 'Terms of Service', href: '#' }
            ].map((item) => (
              <li key={item.name} style={{ marginBottom: '12px' }}>
                <Link href={item.href} className="footer-link" style={{ fontSize: '13px' }}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px', textTransform: 'uppercase' }}>Stay Connected</h4>
          <p style={{
            color: 'hsl(var(--text-secondary))',
            fontSize: '13px',
            marginBottom: '15px'
          }}>
            Subscribe to receive flash deals, stock alerts, and curated discounts.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input"
              style={{
                height: '40px',
                fontSize: '13px'
              }}
            />
            <button className="btn btn-primary" style={{ padding: '0 16px', height: '40px' }}>
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Payment methods badges */}
      <div className="container" style={{
        borderTop: '1px solid hsl(var(--border-color))',
        paddingTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', gap: '15px', color: 'hsl(var(--text-muted))', fontSize: '12px' }}>
          <span>Secure checkout via Stripe / Razorpay</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['Visa', 'Mastercard', 'UPI', 'PayPal'].map(badge => (
            <span key={badge} className="glass-panel" style={{
              padding: '4px 10px',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              color: 'hsl(var(--text-secondary))'
            }}>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
