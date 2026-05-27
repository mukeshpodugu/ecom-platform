'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, updateCartItemQty, removeCartItem, applyCartCoupon } from '@/store/cartSlice';
import { addToast } from '@/store/uiSlice';
import { Trash2, ShoppingBag, ArrowRight, Ticket, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, pricing, loading, error } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);

  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleQtyChange = (itemId, quantity) => {
    dispatch(updateCartItemQty({ itemId, quantity }))
      .then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          dispatch(addToast({ message: 'Quantity updated!', type: 'success' }));
        } else {
          dispatch(addToast({ message: action.payload || 'Insufficient stock', type: 'error' }));
        }
      });
  };

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId)).then(() => {
      dispatch(addToast({ message: 'Item removed from cart', type: 'success' }));
    });
  };

  const handleCouponApply = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    dispatch(applyCartCoupon(couponCode)).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(addToast({ message: action.payload.message, type: 'success' }));
      } else {
        dispatch(addToast({ message: action.payload || 'Invalid coupon', type: 'error' }));
      }
    });
  };

  const handleCouponRemove = () => {
    dispatch(applyCartCoupon('')).then(() => {
      setCouponCode('');
      dispatch(addToast({ message: 'Coupon removed', type: 'info' }));
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '480px', margin: '0 auto', padding: '40px', borderRadius: 'var(--radius-lg)' }}>
          <ShoppingBag size={48} style={{ color: 'hsl(var(--accent-primary))', marginBottom: '20px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>Your Cart is empty</h2>
          <p style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>
            Please login to view your cart items and complete checkout.
          </p>
          <Link href="/auth/login" className="btn btn-primary">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
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
          { num: 1, label: 'Shopping Cart', active: true, done: false },
          { num: 2, label: 'Shipping Details', active: false, done: false },
          { num: 3, label: 'Secure Payment', active: false, done: false }
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
                backgroundColor: 'hsl(var(--accent-primary))',
                color: 'white',
                boxShadow: '0 0 12px hsla(var(--accent-primary), 0.4)',
                border: '2px solid hsla(var(--accent-primary), 0.2)'
              }}>
                {step.num}
              </div>
              <span className="stepper-text" style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'hsl(var(--text-primary))'
              }}>
                {step.label}
              </span>
            </div>
            {idx < arr.length - 1 && (
              <div className="stepper-line" style={{
                flexGrow: 1,
                height: '2px',
                backgroundColor: 'hsl(var(--border-color))',
                margin: '0 20px',
                minWidth: '40px'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>Shopping Cart</h1>

      {items.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
          
          {/* Left Column: Cart items table list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {items.map(item => {
              const product = item.product || {};
              const variantText = item.selectedVariant 
                ? Object.keys(item.selectedVariant).map(k => `${k}: ${item.selectedVariant[k]}`).join(', ')
                : '';

              return (
                <div key={item._id} className="glass-panel" style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr 120px 120px 40px',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)'
                }}>
                  {/* Image */}
                  <div style={{ height: '80px', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <img src={product.images?.[0]} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>

                  {/* Details */}
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{product.name}</h3>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: 700 }}>
                      Brand: {product.brand}
                    </span>
                    {variantText && (
                      <p style={{ fontSize: '12px', color: 'hsl(var(--accent-primary))', marginTop: '4px', fontWeight: 600 }}>
                        {variantText}
                      </p>
                    )}
                  </div>

                  {/* Qty Adjustment */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid hsl(var(--border-color))',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    width: '100px'
                  }}>
                    <button
                      onClick={() => handleQtyChange(item._id, item.quantity - 1)}
                      style={{ padding: '6px 8px', backgroundColor: 'hsl(var(--bg-tertiary))' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ flexGrow: 1, textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item._id, item.quantity + 1)}
                      style={{ padding: '6px 8px', backgroundColor: 'hsl(var(--bg-tertiary))' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'right', fontSize: '16px', fontWeight: 800 }}>
                    ${(product.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove Button */}
                  <button onClick={() => handleRemove(item._id)} style={{ color: 'hsl(var(--accent-danger))' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Column: Pricing details and checkout card */}
          <div>
            {/* Coupon Application card */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={16} /> Promo Coupon Code
              </h3>
              {pricing.couponCode ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  backgroundColor: 'hsla(var(--accent-success), 0.15)',
                  border: '1px solid hsla(var(--accent-success), 0.3)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--accent-success))' }}>{pricing.couponCode}</span>
                    <span style={{ fontSize: '11px', display: 'block', color: 'hsl(var(--text-secondary))' }}>Discount applied!</span>
                  </div>
                  <button onClick={handleCouponRemove} style={{ fontSize: '11px', color: 'hsl(var(--accent-danger))', fontWeight: 600 }}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCouponApply} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. SAVE20)"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="form-input"
                    style={{ height: '40px', fontSize: '13px', textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ height: '40px', padding: '0 16px' }}>
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Totals Summary */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
                  <span>Subtotal</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>
                {pricing.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'hsl(var(--accent-success))' }}>
                    <span>Coupon Discount</span>
                    <span>-${pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
                  <span>Sales Tax (18%)</span>
                  <span>${pricing.tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
                  <span>Shipping Fees</span>
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
                <span>Grand Total</span>
                <span>${pricing.grandTotal.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
                Checkout <ArrowRight size={16} />
              </Link>
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 0', borderRadius: 'var(--radius-md)' }}>
          <ShoppingBag size={40} style={{ color: 'hsl(var(--text-muted))', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Your shopping cart is empty</h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>Add items from the store to make purchases.</p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
