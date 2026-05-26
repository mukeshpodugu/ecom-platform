'use client';
import { API_BASE_URL } from '@/config';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearCart } from '@/store/cartSlice';
import { saveAddress } from '@/store/authSlice';
import { addToast } from '@/store/uiSlice';
import { CreditCard, Truck, ShieldCheck, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, pricing } = useSelector(state => state.cart);
  const { user, token } = useSelector(state => state.auth);

  // Address Form State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('USA');

  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, token, router]);

  // Set default address if it exists on user profile
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setStreet(defaultAddr.street || '');
      setCity(defaultAddr.city || '');
      setState(defaultAddr.state || '');
      setZip(defaultAddr.zip || '');
      setCountry(defaultAddr.country || 'USA');
    }
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zip) {
      dispatch(addToast({ message: 'Please provide full address details', type: 'error' }));
      return;
    }

    setIsSubmitting(true);

    const shippingAddress = { street, city, state, zip, country };

    try {
      // First save address to profile if user has no addresses
      if (!user.addresses || user.addresses.length === 0) {
        await dispatch(saveAddress(shippingAddress));
      }

      // Place order in backend API
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod
        })
      });
      const data = await response.json();

      setIsSubmitting(false);

      if (data.success) {
        dispatch(clearCart());
        dispatch(addToast({ message: 'Order placed successfully!', type: 'success' }));
        router.push('/orders');
      } else {
        dispatch(addToast({ message: data.error || 'Failed to place order', type: 'error' }));
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      dispatch(addToast({ message: 'Network connection failure', type: 'error' }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>Your cart is empty</h2>
        <button onClick={() => router.push('/products')} className="btn btn-primary">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>Secure Checkout</h1>

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Billing Address & Payment options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Address Section */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} /> Shipping Address
            </h3>
            
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                value={street}
                onChange={e => setStreet(e.target.value)}
                className="form-input"
                placeholder="e.g. 100 Main St Apt 4"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="form-input"
                  placeholder="e.g. New York"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input
                  type="text"
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="form-input"
                  placeholder="e.g. NY"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Postal / Zip Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={e => setZip(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 10001"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="form-input"
                  placeholder="USA"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} /> Payment Options
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'Card', label: 'Credit / Debit Card (Stripe Sandbox)', desc: 'Pay securely using credit cards' },
                { id: 'UPI', label: 'UPI / NetBanking', desc: 'Scan and pay instantly' },
                { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay at your doorstep on delivery' }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${paymentMethod === opt.id ? 'hsl(var(--accent-primary))' : 'hsl(var(--border-color))'}`,
                    backgroundColor: paymentMethod === opt.id ? 'hsla(var(--accent-primary), 0.05)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    checked={paymentMethod === opt.id}
                    onChange={() => {}} // handled by click on parent div
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: 'hsl(var(--text-primary))' }}>
                      {opt.label}
                    </span>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>{opt.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Invoice/Cart Summary */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', position: 'sticky', top: '94px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Items Summary</h3>

          {/* Mini items list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '180px',
            overflowY: 'auto',
            marginBottom: '20px',
            paddingRight: '6px'
          }}>
            {items.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.product?.name} <strong style={{ color: 'hsl(var(--text-primary))' }}>x{item.quantity}</strong>
                </span>
                <span style={{ fontWeight: 600 }}>${(item.product?.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid hsl(var(--border-color))',
            paddingTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '12px',
            color: 'hsl(var(--text-secondary))',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--accent-success))' }}>
                <span>Coupon Applied</span>
                <span>-${pricing.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Taxes (18%)</span>
              <span>${pricing.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span>{pricing.shipping === 0 ? 'FREE' : `$${pricing.shipping.toFixed(2)}`}</span>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid hsl(var(--border-color))',
            paddingTop: '20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '16px',
            fontWeight: 800
          }}>
            <span>Order Total</span>
            <span>${pricing.grandTotal.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', gap: '8px' }}
            disabled={isSubmitting}
          >
            <CheckCircle size={16} /> {isSubmitting ? 'Processing Order...' : 'Complete Payment'}
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
            <ShieldCheck size={14} style={{ color: 'hsl(var(--accent-success))' }} /> 256-Bit SSL Encrypted checkout
          </p>
        </div>

      </form>
    </div>
  );
}
