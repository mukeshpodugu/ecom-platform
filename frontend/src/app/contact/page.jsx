'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';
import { Mail, MapPin, Clock, Send, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      dispatch(addToast({ message: 'Please fill out all fields first', type: 'error' }));
      return;
    }

    setSubmitting(true);

    // Simulate server request delay
    setTimeout(() => {
      setSubmitting(false);
      dispatch(addToast({ message: 'Message sent! Our support team will contact you shortly.', type: 'success' }));
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  const contactCards = [
    { icon: <Mail size={18} />, label: 'Email Address', val: 'support@apex-ecom.com', desc: 'Direct support correspondence' },
    { icon: <MapPin size={18} />, label: 'Corporate Office', val: 'Silicon Valley, California', desc: '100 Innovation Way, Suite 400' },
    { icon: <Clock size={18} />, label: 'Business Hours', val: 'Monday - Friday', desc: '9:00 AM - 6:00 PM PST' }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.5px' }}>Contact Support</h1>
        <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', maxWidth: '460px', margin: '0 auto', lineHeight: 1.5 }}>
          Have a question about your order, tracking number, refund status, or selling on Horizon Mall? Send us a ticket!
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Direct Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {contactCards.map((card, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'hsl(var(--bg-tertiary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--accent-primary))',
                marginBottom: '16px'
              }}>
                {card.icon}
              </div>
              <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                {card.label}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, display: 'block', margin: '4px 0 2px 0', color: 'hsl(var(--text-primary))' }}>
                {card.val}
              </span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>
                {card.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Right Column: Message Form */}
        <div className="glass-panel" style={{ padding: '35px', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Send a Message</h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-input"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="jane@email.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="form-input"
                placeholder="How can we help you?"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="form-input"
                rows={5}
                placeholder="Provide detailed order numbers, transaction values, or tracking IDs if applicable..."
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', gap: '8px' }}
              disabled={submitting}
            >
              <Send size={16} /> {submitting ? 'Sending Message...' : 'Submit Message'}
            </button>

            <p style={{
              fontSize: '11px',
              color: 'hsl(var(--text-muted))',
              textAlign: 'center',
              marginTop: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={14} style={{ color: 'hsl(var(--accent-success))' }} /> Encrypted transport routing
            </p>
          </form>
        </div>

      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
