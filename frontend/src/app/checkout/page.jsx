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

  // Credit Card Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  useEffect(() => {
    setInvoiceNumber(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
  }, []);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 19);
    let formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.slice(0, 4);
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setCardExpiry(value);
  };

  const handleCardCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    setCardCvv(value.slice(0, 4));
  };

  const isAddressFilled = street.trim() !== '' && city.trim() !== '' && state.trim() !== '' && zip.trim() !== '';

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
    if (paymentMethod === 'Card') {
      const cleanCardNum = cardNumber.replace(/\s+/g, '');
      if (!cardName.trim() || cardName.trim().length < 3) {
        dispatch(addToast({ message: 'Please enter a valid cardholder name (min 3 characters)', type: 'error' }));
        return;
      }
      if (!/^\d{13,19}$/.test(cleanCardNum)) {
        dispatch(addToast({ message: 'Please enter a valid 13-19 digit card number', type: 'error' }));
        return;
      }
      // Luhn check
      let sum = 0;
      let shouldDouble = false;
      for (let i = cleanCardNum.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanCardNum.charAt(i));
        if (shouldDouble) {
          if ((digit *= 2) > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      if (sum % 10 !== 0) {
        dispatch(addToast({ message: 'Invalid card number (Luhn checksum failed)', type: 'error' }));
        return;
      }

      // Expiry validation
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        dispatch(addToast({ message: 'Expiry date must be in MM/YY format', type: 'error' }));
        return;
      }
      const [expMonthStr, expYearStr] = cardExpiry.split('/');
      const expMonth = parseInt(expMonthStr);
      const expYear = parseInt('20' + expYearStr);
      if (expMonth < 1 || expMonth > 12) {
        dispatch(addToast({ message: 'Expiry month must be between 01 and 12', type: 'error' }));
        return;
      }
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        dispatch(addToast({ message: 'The card has expired', type: 'error' }));
        return;
      }

      // CVV validation
      if (!/^\d{3,4}$/.test(cardCvv)) {
        dispatch(addToast({ message: 'CVV must be 3 or 4 digits', type: 'error' }));
        return;
      }
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
      
      {/* Checkout Progress Stepper */}
      <div className="stepper-wrapper" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 40px auto',
        maxWidth: '640px',
        padding: '18px 24px',
        backgroundColor: 'var(--glass-bg)',
        border: '1px solid hsl(var(--border-color))',
        backdropFilter: 'blur(var(--glass-blur))',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 4px 20px 0 rgba(var(--shadow-color), 0.02)'
      }}>
        {[
          { num: 1, label: 'Shopping Cart', active: false, done: true },
          { num: 2, label: 'Shipping Details', active: !isAddressFilled, done: isAddressFilled },
          { num: 3, label: 'Secure Payment', active: isAddressFilled, done: false }
        ].map((step, idx, arr) => (
          <React.Fragment key={step.num}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px',
                backgroundColor: step.done ? 'hsl(var(--accent-success))' : step.active ? 'hsl(var(--accent-primary))' : 'hsl(var(--bg-tertiary))',
                color: (step.active || step.done) ? 'white' : 'hsl(var(--text-muted))',
                boxShadow: step.active ? '0 0 12px hsla(var(--accent-primary), 0.4)' : 'none',
                border: step.active ? '2px solid hsla(var(--accent-primary), 0.2)' : 'none'
              }}>
                {step.done ? '✓' : step.num}
              </div>
              <span className="stepper-text" style={{
                fontSize: '13px',
                fontWeight: (step.active || step.done) ? 700 : 500,
                color: (step.active || step.done) ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))'
              }}>
                {step.label}
              </span>
            </div>
            {idx < arr.length - 1 && (
              <div className="stepper-line" style={{
                flexGrow: 1,
                height: '2px',
                backgroundColor: step.done ? 'hsl(var(--accent-success))' : 'hsl(var(--border-color))',
                margin: '0 20px',
                minWidth: '40px'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

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

            {/* Dynamic Interactive Sub-forms based on payment method */}
            {paymentMethod === 'Card' && (
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid hsl(var(--border-color))',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }} className="animate-fade-in">
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--text-primary))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Secure Card Details
                </h4>
                
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Johnathan Doe"
                    required={paymentMethod === 'Card'}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="form-input"
                      placeholder="4111 1111 1111 1111"
                      required={paymentMethod === 'Card'}
                      style={{ paddingLeft: '44px' }}
                    />
                    <CreditCard size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: 'hsl(var(--text-muted))' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label">Expiration Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                      className="form-input"
                      placeholder="MM/YY"
                      required={paymentMethod === 'Card'}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label">CVV / CVC</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={handleCardCvvChange}
                      className="form-input"
                      placeholder="123"
                      required={paymentMethod === 'Card'}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid hsl(var(--border-color))',
                textAlign: 'center',
                padding: '20px',
                backgroundColor: 'hsla(var(--accent-primary), 0.03)',
                borderRadius: 'var(--radius-md)'
              }} className="animate-fade-in">
                <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '12px' }}>
                  Scan the QR code on the next screen or pay via instant UPI ID below:
                </span>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: 'hsla(var(--accent-primary), 0.1)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'hsl(var(--accent-primary))',
                  fontFamily: 'monospace'
                }}>
                  merchant@apexec
                </div>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid hsl(var(--border-color))',
                padding: '16px',
                backgroundColor: 'hsla(var(--accent-warning), 0.08)',
                border: '1px dashed hsla(var(--accent-warning), 0.3)',
                borderRadius: 'var(--radius-md)'
              }} className="animate-fade-in">
                <span style={{ fontSize: '13px', color: 'hsl(var(--accent-warning))', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Cash On Delivery Policy
                </span>
                <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', lineHeight: 1.4, display: 'block' }}>
                  A nominal convenience fee of $2.00 is added for COD orders. Please ensure exact amount is ready for our delivery partner.
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Invoice/Cart Summary */}
        <div className="glass-panel" style={{
          padding: '30px 24px',
          borderRadius: 'var(--radius-md)',
          position: 'sticky',
          top: '94px',
          background: 'linear-gradient(to bottom, var(--glass-bg), hsla(var(--bg-tertiary), 0.5))',
          border: '1px solid hsl(var(--border-color))',
          boxShadow: '0 8px 32px 0 rgba(var(--shadow-color), 0.08)'
        }}>
          {/* Invoice Header */}
          <div style={{
            textAlign: 'center',
            borderBottom: '2px dashed hsl(var(--border-color))',
            paddingBottom: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'hsl(var(--accent-primary))', marginBottom: '4px' }}>
              Invoice Statement
            </h3>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'hsl(var(--text-muted))', display: 'block' }}>
              {invoiceNumber}
            </span>
            <span style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>
              Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--text-muted))', marginBottom: '12px', letterSpacing: '0.5px' }}>
            Purchased Items
          </h4>

          {/* Mini items list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '180px',
            overflowY: 'auto',
            marginBottom: '20px',
            paddingRight: '6px',
            borderBottom: '1px dashed hsl(var(--border-color))',
            paddingBottom: '16px'
          }}>
            {items.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}>
                  <span style={{ color: 'hsl(var(--text-primary))', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product?.name}
                  </span>
                  <span style={{ color: 'hsl(var(--text-muted))', fontSize: '10px' }}>
                    Qty: {item.quantity} × ${item.product?.price}
                  </span>
                </div>
                <span style={{ fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
                  ${(item.product?.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '12px',
            color: 'hsl(var(--text-secondary))',
            marginBottom: '20px',
            borderBottom: '2px dashed hsl(var(--border-color))',
            paddingBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>${pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--accent-success))', fontWeight: 600 }}>
                <span>Coupon Applied</span>
                <span>-${pricing.discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>GST / Sales Tax (18%)</span>
              <span style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>${pricing.tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping & Handling</span>
              <span style={{ fontWeight: 600, color: pricing.shipping === 0 ? 'hsl(var(--accent-success))' : 'hsl(var(--text-primary))' }}>
                {pricing.shipping === 0 ? 'FREE' : `$${pricing.shipping.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Grand Total */}
          <div style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 800,
            color: 'hsl(var(--text-primary))'
          }}>
            <span>Total Payable</span>
            <span style={{ color: 'hsl(var(--accent-primary))' }}>${pricing.grandTotal.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', height: '46px', gap: '8px', fontSize: '14px', borderRadius: 'var(--radius-md)' }}
            disabled={isSubmitting}
          >
            <CheckCircle size={16} /> {isSubmitting ? 'Processing Payment...' : 'Authorize & Pay'}
          </button>

          <p style={{
            fontSize: '11px',
            color: 'hsl(var(--text-muted))',
            textAlign: 'center',
            marginTop: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={14} style={{ color: 'hsl(var(--accent-success))' }} /> 256-Bit SSL Encrypted checkout
          </p>
        </div>

      </form>
    </div>
  );
}
