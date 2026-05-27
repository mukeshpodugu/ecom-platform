'use client';
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPersonalizedRecommendations } from '@/store/productSlice';
import { addItemToCart } from '@/store/cartSlice';
import { addToast } from '@/store/uiSlice';
import { Sparkles, ShoppingBag, Eye, Star, Flame, Award, Truck } from 'lucide-react';

export default function HomePage() {
  const dispatch = useDispatch();
  const { personalizedRecommendations } = useSelector(state => state.products);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Categories list
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const data = await res.json();
        // Generate mock categories or extract from products
        setCategories([
          { id: '6652ed9a2d480d195cbb292a', name: 'Electronics', count: '12 Items', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300', slug: 'electronics' },
          { id: '6652ed9a2d480d195cbb292b', name: 'Fashion', count: '8 Items', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300', slug: 'fashion' },
          { id: '6652ed9a2d480d195cbb292c', name: 'Home & Kitchen', count: '15 Items', img: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300', slug: 'home-living' },
          { id: '6652ed9a2d480d195cbb292d', name: 'Fitness & Sports', count: '6 Items', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300', slug: 'fitness-outdoors' }
        ]);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchCats();
    dispatch(fetchPersonalizedRecommendations());
  }, [dispatch, isAuthenticated]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    dispatch(addItemToCart({ productId: product._id, quantity: 1 }))
      .then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          dispatch(addToast({ message: `${product.name} added to cart!`, type: 'success' }));
        } else {
          dispatch(addToast({ message: action.payload || 'Failed to add', type: 'error' }));
        }
      });
  };

  return (
    <div style={{ paddingBottom: '80px' }} className="animate-fade-in">
      {/* 1. Hero Banner Section */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, hsl(222, 47%, 10%), hsl(263, 40%, 15%))',
        color: 'white',
        padding: '100px 0 120px 0',
        overflow: 'hidden'
      }}>
        {/* Background visual circles */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(var(--accent-primary), 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(var(--accent-secondary), 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }} />

        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '60px',
          position: 'relative',
          zIndex: 2
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: 'hsl(var(--accent-primary))',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '24px'
            }}>
              <Sparkles size={14} /> Summer Tech Launch 2026
            </div>
            
            <h1 style={{
              fontSize: '52px',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '20px',
              letterSpacing: '-1px'
            }}>
              Explore Premium <br/>
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Next-Gen Devices</span>
            </h1>
            
            <p style={{
              color: 'hsl(var(--text-secondary))',
              fontSize: '16px',
              lineHeight: 1.6,
              marginBottom: '35px',
              maxWidth: '460px'
            }}>
              Upgrade your setup with our collection of active noise cancelling headphones, high-precision tracking smartwatches, and TS-certified commuter backpacks.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                <ShoppingBag size={18} /> Shop the Collection
              </Link>
              <a href="#deals" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                Explore Offers
              </a>
            </div>

            {/* Floating stats row */}
            <div style={{
              display: 'flex',
              gap: '24px',
              marginTop: '40px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '24px',
              flexWrap: 'wrap'
            }}>
              <div>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'white', display: 'block' }}>15k+</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Active Orders</span>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '24px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'white', display: 'block' }}>4.9★</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Customer Reviews</span>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '24px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'white', display: 'block' }}>24/7</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Developer Support</span>
              </div>
            </div>
          </div>

          {/* Hero product mock */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="glass-panel" style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '380px',
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
                alt="Headphones"
                loading="lazy"
                style={{
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  marginBottom: '20px',
                  width: '100%',
                  height: '240px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Titan ANC Headphones</h3>
                <span className="badge badge-discount">-20% OFF</span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '15px' }}>Studio quality audio. Active Noise Cancellation.</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '20px', fontWeight: 800 }}>$199.00</span>
                  <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#64748b', marginLeft: '8px' }}>$249.00</span>
                </div>
                <Link href="/products/6652ed9a2d480d195cbb294a" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  Buy Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Value Propositions */}
      <section className="container" style={{
        marginTop: '-40px',
        position: 'relative',
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        {[
          { icon: <Truck size={22} style={{ color: 'hsl(var(--accent-primary))' }} />, title: 'Free Express Delivery', desc: 'Complimentary shipping on orders above $100' },
          { icon: <Award size={22} style={{ color: 'hsl(var(--accent-secondary))' }} />, title: 'Genuine Warranty', desc: '100% authentic inventory directly from verified sellers' },
          { icon: <Flame size={22} style={{ color: 'hsl(var(--accent-warning))' }} />, title: 'Interactive Returns', desc: 'Download invoices and request refunds easily' }
        ].map((prop, idx) => (
          <div key={idx} className="glass-panel" style={{
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'hsl(var(--bg-tertiary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {prop.icon}
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{prop.title}</h4>
              <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', lineHeight: 1.4 }}>{prop.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Category Grid */}
      <section className="container" style={{ marginTop: '120px', borderTop: '1px solid hsla(var(--border-color), 0.5)', paddingTop: '60px' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Shop by Category</h2>
          <p style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Select a category to browse premium curated collections</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {categories.map(cat => (
            <Link href={`/products?category=${cat.id}`} key={cat.id} className="glass-panel interactive-panel" style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              display: 'block'
            }}>
              <div style={{ position: 'relative', height: '160px' }}>
                <img
                  src={cat.img}
                  alt={cat.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 10%, transparent 70%)'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  color: 'white'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{cat.name}</h3>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>{cat.count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. AI Recommendations / Trending Products Section */}
      <section className="container" style={{ marginTop: '120px', borderTop: '1px solid hsla(var(--border-color), 0.5)', paddingTop: '60px' }} id="deals">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={24} style={{ color: 'hsl(var(--accent-secondary))' }} /> Recommended For You
          </h2>
          <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>Powered by AI Recommendations</span>
        </div>

        {loading ? (
          <div className="grid-responsive">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="glass-panel" style={{ height: '380px', borderRadius: 'var(--radius-md)' }} className="skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid-responsive">
            {personalizedRecommendations.length > 0 ? (
              personalizedRecommendations.map(prod => (
                <Link href={`/products/${prod._id}`} key={prod._id} className="glass-panel interactive-panel" style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}>
                  <div style={{ position: 'relative', height: '220px', backgroundColor: 'hsl(var(--bg-tertiary))' }}>
                    <img
                      src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                      alt={prod.name}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {prod.discount > 0 && (
                      <span className="badge badge-discount" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        {prod.discount}% Off
                      </span>
                    )}
                  </div>

                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      {prod.brand}
                    </span>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4, color: 'hsl(var(--text-primary))' }}>
                      {prod.name}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                      <Star size={14} fill="hsl(var(--accent-warning))" style={{ color: 'hsl(var(--accent-warning))' }} />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{prod.rating || '4.5'}</span>
                      <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>({prod.reviewsCount || '0'})</span>
                    </div>

                    <div style={{
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
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
                        onClick={(e) => handleAddToCart(e, prod)}
                        className="btn btn-primary"
                        style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'hsl(var(--text-muted))' }}>
                No recommendations found. Try logging in to get customized predictions.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
