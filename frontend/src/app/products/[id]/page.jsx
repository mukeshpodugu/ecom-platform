'use client';
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById, fetchSimilarRecommendations, clearSelectedProduct } from '@/store/productSlice';
import { addItemToCart } from '@/store/cartSlice';
import { addToast } from '@/store/uiSlice';
import { Star, ShoppingCart, Heart, Shield, Undo, Calendar, User, ThumbsUp, Send } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const { selectedProduct, similarProducts, detailLoading } = useSelector(state => state.products);
  const { token, user } = useSelector(state => state.auth);

  const [activeImage, setActiveImage] = useState('');
  const [selectedVariants, setSelectedVariants] = useState({});
  const [qty, setQty] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: '0% 0%', transform: 'scale(1)' });

  // Tabs and Estimator States
  const [activeTab, setActiveTab] = useState('description');
  const [pincode, setPincode] = useState('');
  const [deliveryEst, setDeliveryEst] = useState('');
  const [ratingFilter, setRatingFilter] = useState(null);

  // Reviews submission state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const handleCheckDelivery = () => {
    if (!pincode || pincode.length < 5) {
      dispatch(addToast({ message: 'Please enter a valid zip code', type: 'error' }));
      return;
    }
    const days = (Number(pincode) % 3) + 2;
    setDeliveryEst(`Estimated delivery to ${pincode} within ${days} days (Free Express Shipping)`);
  };

  useEffect(() => {
    dispatch(fetchProductById(params.id));
    dispatch(fetchSimilarRecommendations(params.id));

    // Fetch reviews directly from api
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/product/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, params.id]);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImage(selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600');
      // Set default variants selection
      const initialVars = {};
      selectedProduct.variants?.forEach(v => {
        initialVars[v.name] = v.options[0];
      });
      setSelectedVariants(initialVars);
    }
  }, [selectedProduct]);

  // Zoom magnifier effect
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.6)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: '0% 0%', transform: 'scale(1)' });
  };

  const handleAddToCart = () => {
    dispatch(addItemToCart({
      productId: selectedProduct._id,
      quantity: qty,
      selectedVariant: selectedVariants
    })).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(addToast({ message: 'Added to cart!', type: 'success' }));
      } else {
        dispatch(addToast({ message: action.payload || 'Failed to add', type: 'error' }));
      }
    });
  };

  // Submit new review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      dispatch(addToast({ message: 'Please login to leave a review', type: 'error' }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });
      const data = await response.json();

      if (data.success) {
        dispatch(addToast({ message: 'Review posted!', type: 'success' }));
        setReviews(prev => [data.review, ...prev]);
        setReviewTitle('');
        setReviewComment('');
      } else {
        dispatch(addToast({ message: data.error || 'Failed to submit review', type: 'error' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (detailLoading || !selectedProduct) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>
          <div className="skeleton" style={{ height: '420px', borderRadius: 'var(--radius-lg)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="skeleton" style={{ height: '32px', width: '60%', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '24px', width: '40%', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: '80px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: '48px', borderRadius: 'var(--radius-md)' }} />
            <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      </div>
    );
  }

  const filteredReviews = ratingFilter 
    ? reviews.filter(r => r.rating === ratingFilter) 
    : reviews;

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
      
      {/* 1. Main Specs Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '60px',
        marginBottom: '80px'
      }}>
        {/* Left Column: Image Gallery */}
        <div>
          {/* Main Zoom Window */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'relative',
              height: '420px',
              backgroundColor: 'hsl(var(--bg-tertiary))',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid hsl(var(--border-color))',
              overflow: 'hidden',
              cursor: 'zoom-in',
              marginBottom: '20px'
            }}
          >
            <img
              src={activeImage}
              alt={selectedProduct.name}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transition: 'transform 0.1s ease-out',
                ...zoomStyle
              }}
            />
          </div>

          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {selectedProduct.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${activeImage === img ? 'hsl(var(--accent-primary))' : 'hsl(var(--border-color))'}`,
                  overflow: 'hidden',
                  backgroundColor: 'white'
                }}
              >
                <img src={img} alt="thumbnail" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Specs details */}
        <div>
          <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: 800 }}>
            {selectedProduct.brand}
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', marginBottom: '16px', lineHeight: 1.2 }}>
            {selectedProduct.name}
          </h1>

          {/* Ratings & reviews count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  size={16}
                  fill={i <= Math.round(selectedProduct.rating) ? 'hsl(var(--accent-warning))' : 'transparent'}
                  style={{ color: i <= Math.round(selectedProduct.rating) ? 'hsl(var(--accent-warning))' : 'hsl(var(--text-muted))' }}
                />
              ))}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedProduct.rating || '0'} Rating</span>
            <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>| {selectedProduct.reviewsCount || '0'} Verified Customer Reviews</span>
          </div>

          {/* Pricing */}
          <div style={{
            padding: '20px',
            backgroundColor: 'hsl(var(--bg-tertiary))',
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsl(var(--border-color))',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: 'hsl(var(--text-primary))' }}>${selectedProduct.price}</span>
              {selectedProduct.discount > 0 && (
                <>
                  <span style={{ fontSize: '18px', textDecoration: 'line-through', color: 'hsl(var(--text-muted))' }}>
                    ${selectedProduct.originalPrice}
                  </span>
                  <span className="badge badge-discount" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    {selectedProduct.discount}% OFF
                  </span>
                </>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '8px' }}>
              Inclusive of all local taxes. Free shipping on this order!
            </p>
          </div>

          {/* Stock Meter */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '13px' }}>
              <span style={{ fontWeight: 600 }}>Availability:</span>
              <span style={{
                fontWeight: 700,
                color: selectedProduct.stock > 0 
                  ? (selectedProduct.stock < 10 ? 'hsl(var(--accent-warning))' : 'hsl(var(--accent-success))')
                  : 'hsl(var(--accent-danger))'
              }}>
                {selectedProduct.stock > 0 
                  ? (selectedProduct.stock < 10 ? `Only ${selectedProduct.stock} left in stock!` : 'In Stock')
                  : 'Out of Stock'}
              </span>
            </div>
            {selectedProduct.stock > 0 && (
              <div style={{ width: '100%', height: '6px', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (selectedProduct.stock / 50) * 100)}%`,
                  height: '100%',
                  backgroundColor: selectedProduct.stock < 10 ? 'hsl(var(--accent-warning))' : 'hsl(var(--accent-success))',
                  borderRadius: 'var(--radius-full)'
                }} />
              </div>
            )}
          </div>

          {/* Tabs Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid hsl(var(--border-color))',
            marginBottom: '20px',
            marginTop: '30px'
          }}>
            {[
              { id: 'description', label: 'Details & Specs' },
              { id: 'shipping', label: 'Shipping & Returns' },
              { id: 'seller', label: 'Verified Seller' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderBottom: activeTab === tab.id ? '2px solid hsl(var(--accent-primary))' : 'none',
                  color: activeTab === tab.id ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div style={{ minHeight: '120px', fontSize: '13px', lineHeight: '1.6', color: 'hsl(var(--text-secondary))', marginBottom: '30px' }}>
            {activeTab === 'description' && (
              <div>
                <p style={{ marginBottom: '16px' }}>{selectedProduct.description}</p>
                {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
                    <tbody>
                      {Object.keys(selectedProduct.specs).map(key => (
                        <tr key={key} style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
                          <td style={{ padding: '8px 0', fontWeight: 600, color: 'hsl(var(--text-primary))', width: '40%' }}>{key}</td>
                          <td style={{ padding: '8px 0' }}>{selectedProduct.specs[key]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <p style={{ marginBottom: '10px' }}>📦 <strong>Free Express Shipping:</strong> Orders are processed within 24 hours and typically delivered within 2-4 business days.</p>
                <p style={{ marginBottom: '10px' }}>🛡️ <strong>7 Days Replacements:</strong> If your product arrives damaged or defective, request a replacement within 7 days via your Orders timeline.</p>
                <p>🔒 <strong>Secure Checkout:</strong> Industry-standard 256-bit SSL encryption protects all payment details (Stripe sandbox & UPI mock channels).</p>
              </div>
            )}

            {activeTab === 'seller' && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'hsla(var(--accent-success), 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'hsl(var(--accent-success))'
                }}>
                  <Shield size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'hsl(var(--text-primary))' }}>Apex Premium Seller</h4>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>ID: {selectedProduct.seller || 'Apex Verified Merchant'}</p>
                  <span className="badge badge-stock" style={{ display: 'inline-block', marginTop: '6px', fontSize: '9px' }}>Verified Brand Partner</span>
                </div>
              </div>
            )}
          </div>

          {/* Variant Selector */}
          {selectedProduct.variants?.map(variant => (
            <div key={variant.name} style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase' }}>
                Select {variant.name}
              </h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {variant.options.map(option => {
                  const isSelected = selectedVariants[variant.name] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: option }))}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid hsl(var(--border-color))',
                        backgroundColor: isSelected ? 'hsl(var(--text-primary))' : 'hsl(var(--bg-secondary))',
                        color: isSelected ? 'hsl(var(--bg-secondary))' : 'hsl(var(--text-primary))',
                        transition: 'all 0.15s'
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Quantity */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid hsl(var(--border-color))',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              height: '48px'
            }}>
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ width: '40px', fontSize: '18px', fontWeight: 700, backgroundColor: 'hsl(var(--bg-tertiary))' }}
              >
                -
              </button>
              <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>{qty}</span>
              <button
                onClick={() => setQty(Math.min(selectedProduct.stock, qty + 1))}
                style={{ width: '40px', fontSize: '18px', fontWeight: 700, backgroundColor: 'hsl(var(--bg-tertiary))' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ flexGrow: 1, height: '48px', fontSize: '15px' }}
              disabled={selectedProduct.stock === 0}
            >
              <ShoppingCart size={18} /> {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Delivery Estimator */}
          <div className="glass-panel" style={{ padding: '16px', borderRadius: 'var(--radius-md)', margin: '24px 0', backgroundColor: 'hsl(var(--bg-tertiary))' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} /> Check Delivery Estimator
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter Pincode / Zip Code"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                className="form-input"
                style={{ padding: '8px 12px', fontSize: '13px', height: '36px' }}
              />
              <button
                type="button"
                onClick={handleCheckDelivery}
                className="btn btn-primary"
                style={{ padding: '0 16px', height: '36px', fontSize: '12px' }}
              >
                Check
              </button>
            </div>
            {deliveryEst && (
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--accent-success))', marginTop: '10px' }}>
                {deliveryEst}
              </p>
            )}
          </div>

          {/* Trust Guarantees */}
          <div style={{
            borderTop: '1px solid hsl(var(--border-color))',
            paddingTop: '24px',
            marginTop: '32px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
              <Shield size={16} style={{ color: 'hsl(var(--accent-success))' }} /> Secure checkout transaction
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
              <Undo size={16} style={{ color: 'hsl(var(--accent-primary))' }} /> 7 Days replacement warranty
            </div>
          </div>
        </div>
      </div>

      {/* 2. Reviews Section */}
      <section style={{ borderTop: '1px solid hsl(var(--border-color))', paddingTop: '60px', marginBottom: '80px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '32px' }}>Customer Reviews</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          {/* Write review form */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Leave a Review</h3>
            {token ? (
              <form onSubmit={handleReviewSubmit} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={e => setReviewRating(Number(e.target.value))}
                    className="form-input"
                    style={{ height: '40px', fontSize: '13px' }}
                  >
                    {[5, 4, 3, 2, 1].map(v => (
                      <option key={v} value={v}>{v} Stars</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Review Headline</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Excellent bass performance"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Write your thoughts</label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="form-input"
                    rows={4}
                    placeholder="Describe what you like or dislike about the product..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  <Send size={14} /> Submit Feedback
                </button>
              </form>
            ) : (
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '15px' }}>
                  Please login to leave a review.
                </p>
                <Link href="/auth/login" className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* List of reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Star Rating Filters Row */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'hsl(var(--text-secondary))' }}>Filter:</span>
              <button
                type="button"
                onClick={() => setRatingFilter(null)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: ratingFilter === null ? 'hsl(var(--text-primary))' : 'hsl(var(--bg-tertiary))',
                  color: ratingFilter === null ? 'hsl(var(--bg-secondary))' : 'hsl(var(--text-primary))'
                }}
              >
                All ({reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = reviews.filter(r => r.rating === stars).length;
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setRatingFilter(stars)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: ratingFilter === stars ? 'hsl(var(--text-primary))' : 'hsl(var(--bg-tertiary))',
                      color: ratingFilter === stars ? 'hsl(var(--bg-secondary))' : 'hsl(var(--text-primary))'
                    }}
                  >
                    {stars}★ ({count})
                  </button>
                );
              })}
            </div>

            {filteredReviews.length > 0 ? (
              filteredReviews.map(rev => (
                <div key={rev._id} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'hsl(var(--bg-tertiary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <User size={14} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600 }}>
                          {rev.user && rev.user.name ? rev.user.name : 'Verified Customer'}
                        </h4>
                        <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>
                          Verified Purchase | {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          size={12}
                          fill={i <= rev.rating ? 'hsl(var(--accent-warning))' : 'transparent'}
                          style={{ color: i <= rev.rating ? 'hsl(var(--accent-warning))' : 'hsl(var(--text-muted))' }}
                        />
                      ))}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>{rev.title}</h4>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', lineHeight: 1.5, marginBottom: '14px' }}>
                    {rev.comment}
                  </p>

                  <button style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: 'hsl(var(--text-muted))',
                    fontWeight: 600
                  }}>
                    <ThumbsUp size={12} /> Helpful ({rev.likes || 0})
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'hsl(var(--text-muted))', fontSize: '13px' }}>
                {ratingFilter ? 'No reviews match this rating filter.' : 'No reviews yet. Be the first to review this product!'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Similar Products Section */}
      <section style={{ borderTop: '1px solid hsl(var(--border-color))', paddingTop: '60px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '32px' }}>Similar Recommendations</h2>

        <div className="grid-responsive">
          {similarProducts.length > 0 ? (
            similarProducts.slice(0, 4).map(prod => (
              <Link href={`/products/${prod._id}`} key={prod._id} className="glass-panel interactive-panel" style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'block'
              }}>
                <div style={{ height: '180px', backgroundColor: 'hsl(var(--bg-tertiary))' }}>
                  <img src={prod.images?.[0]} alt={prod.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>{prod.name}</h3>
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>${prod.price}</span>
                </div>
              </Link>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', color: 'hsl(var(--text-muted))', fontSize: '13px' }}>
              No similar products found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
