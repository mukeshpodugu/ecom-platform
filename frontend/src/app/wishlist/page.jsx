'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { addItemToCart } from '@/store/cartSlice';
import { addToast } from '@/store/uiSlice';
import { Heart, ShoppingCart, Trash2, ArrowRight, Eye, Star } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector(state => state.auth);

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlistItems(data.wishlist?.products || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      dispatch(addToast({ message: 'Please login to view your wishlist', type: 'error' }));
      router.push('/auth/login');
      return;
    }
    fetchWishlist();
  }, [token, router]);

  const handleRemove = async (productId, name) => {
    try {
      const res = await fetch(`http://localhost:5000/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlistItems(data.wishlist?.products || []);
        dispatch(addToast({ message: `${name} removed from wishlist`, type: 'info' }));
      } else {
        dispatch(addToast({ message: data.error || 'Failed to remove', type: 'error' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToCart = async (product) => {
    dispatch(addItemToCart({ productId: product._id, quantity: 1 }))
      .then(async (action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          dispatch(addToast({ message: `${product.name} moved to cart!`, type: 'success' }));
          // Remove from wishlist
          await handleRemove(product._id, product.name);
        } else {
          dispatch(addToast({ message: action.payload || 'Failed to add', type: 'error' }));
        }
      });
  };

  if (loading) {
    return (
      <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px' }}>Your Wishlist</h1>
        <div className="grid-responsive">
          {[1, 2, 3].map(idx => (
            <div key={idx} className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <Heart size={28} fill="hsl(var(--accent-danger))" style={{ color: 'hsl(var(--accent-danger))' }} />
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Your Wishlist</h1>
          <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
            Products you saved for later purchase.
          </span>
        </div>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid-responsive">
          {wishlistItems.map(prod => (
            <div
              key={prod._id}
              className="glass-panel interactive-panel"
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative'
              }}
            >
              {/* Product Image */}
              <div style={{ position: 'relative', height: '220px', backgroundColor: 'hsl(var(--bg-tertiary))' }}>
                <img
                  src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                  alt={prod.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(prod._id, prod.name)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: 'hsl(var(--accent-danger))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'hsl(var(--accent-danger))';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.color = 'hsl(var(--accent-danger))';
                  }}
                >
                  <Trash2 size={16} />
                </button>

                {prod.discount > 0 && (
                  <span className="badge badge-discount" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    {prod.discount}% Off
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  {prod.brand}
                </span>
                
                <Link href={`/products/${prod._id}`} style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  lineHeight: 1.4,
                  color: 'hsl(var(--text-primary))'
                }}>
                  {prod.name}
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                  <Star size={14} fill="hsl(var(--accent-warning))" style={{ color: 'hsl(var(--accent-warning))' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{prod.rating || '4.5'}</span>
                  <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>({prod.reviewsCount || '0'})</span>
                </div>

                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 800 }}>${prod.price}</span>
                    {prod.discount > 0 && (
                      <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'hsl(var(--text-muted))', marginLeft: '6px' }}>
                        ${prod.originalPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleMoveToCart(prod)}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      height: '36px',
                      gap: '4px'
                    }}
                  >
                    <ShoppingCart size={14} /> Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{
          textAlign: 'center',
          padding: '60px 24px',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '480px',
          margin: '40px auto 0 auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'hsla(var(--accent-primary), 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--accent-primary))',
            marginBottom: '20px'
          }}>
            <Heart size={30} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Your Wishlist is Empty</h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '24px', lineHeight: 1.5 }}>
            Browse through our premium tech catalog and save items here for later checks.
          </p>
          <Link href="/products" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Browse Catalog <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
