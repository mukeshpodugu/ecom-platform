'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { saveAddress, updateDetails } from '@/store/authSlice';
import { addToast } from '@/store/uiSlice';
import { User, MapPin, Plus, ShieldCheck, Mail } from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector(state => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Address Modal/Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('USA');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, token, router]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    dispatch(updateDetails({ name, email })).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(addToast({ message: 'Profile details updated!', type: 'success' }));
      } else {
        dispatch(addToast({ message: action.payload || 'Failed to update', type: 'error' }));
      }
    });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) {
      dispatch(addToast({ message: 'Please provide all details', type: 'error' }));
      return;
    }

    dispatch(saveAddress({ street, city, state, zip, country, isDefault })).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(addToast({ message: 'Address saved successfully!', type: 'success' }));
        setShowAddressForm(false);
        setStreet('');
        setCity('');
        setState('');
        setZip('');
        setIsDefault(false);
      }
    });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>Account Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Profile edit and active addresses list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* User details */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} style={{ color: 'hsl(var(--accent-primary))' }} /> Profile Details
            </h3>

            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="form-input"
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
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                Save Changes
              </button>
            </form>
          </div>

          {/* Addresses */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} style={{ color: 'hsl(var(--accent-secondary))' }} /> Shipping Addresses
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} style={{
                padding: '20px',
                border: '1px dashed hsl(var(--border-color))',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
                backgroundColor: 'hsl(var(--bg-tertiary))'
              }}>
                <div className="form-group">
                  <label className="form-label">Street</label>
                  <input type="text" value={street} onChange={e => setStreet(e.target.value)} className="form-input" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" value={state} onChange={e => setState(e.target.value)} className="form-input" required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label">Zip Code</label>
                    <input type="text" value={zip} onChange={e => setZip(e.target.value)} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="form-input" required />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} style={{ cursor: 'pointer' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>Set as default shipping address</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>Save Address</button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>Cancel</button>
                </div>
              </form>
            )}

            {/* List saved addresses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr, idx) => (
                  <div key={idx} style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid hsl(var(--border-color))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600 }}>{addr.street}</p>
                      <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
                        {addr.city}, {addr.state} {addr.zip}, {addr.country}
                      </p>
                    </div>
                    {addr.isDefault && (
                      <span className="badge badge-stock" style={{ fontSize: '9px' }}>Default</span>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '20px 0' }}>
                  No addresses saved yet. Add one to speed up checkout.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Roles and Security info */}
        <div>
          <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Account Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Role</span>
                <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'hsl(var(--accent-primary))' }}>
                  {user.role}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Verification</span>
                <span style={{ fontWeight: 700, color: 'hsl(var(--accent-success))' }}>Verified Account</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>OAuth Provider</span>
                <span style={{ fontWeight: 600 }}>Credentials File</span>
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid hsl(var(--border-color))', margin: '20px 0' }} />
            
            <p style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', lineHeight: 1.4 }}>
              If you wish to test vendor features, please create a new account checking the <strong>"Register as a Vendor Seller"</strong> box in the signup page.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
