'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '@/store/productSlice';
import { addItemToCart } from '@/store/cartSlice';
import { addToast } from '@/store/uiSlice';
import { Star, Filter, ArrowUpDown, ChevronRight } from 'lucide-react';

export default function ProductListingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { products, pagination, loading } = useSelector(state => state.products);

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [activeBrand, setActiveBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeRating, setActiveRating] = useState('');
  const [activeSort, setActiveSort] = useState('newest');

  // Load products when query inputs change
  useEffect(() => {
    const params = {
      search: searchParams.get('search') || '',
      category: activeCategory,
      brand: activeBrand,
      minPrice,
      maxPrice,
      rating: activeRating,
      sort: activeSort,
      page: searchParams.get('page') || 1
    };

    dispatch(fetchProducts(params));
  }, [dispatch, searchParams, activeCategory, activeBrand, minPrice, maxPrice, activeRating, activeSort]);

  const handleFilterReset = () => {
    setActiveCategory('');
    setActiveBrand('');
    setMinPrice('');
    setMaxPrice('');
    setActiveRating('');
    setActiveSort('newest');
    router.push('/products');
  };

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
    <div className="container" style={{ padding: '40px 24px', display: 'flex', gap: '30px', flexDirection: 'row' }}>
      
      {/* 1. Left Sidebar Filters (Desktop) */}
      <aside className="glass-panel" style={{
        width: '280px',
        flexShrink: 0,
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        height: 'fit-content'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} /> Filters
          </h3>
          <button onClick={handleFilterReset} style={{ fontSize: '12px', color: 'hsl(var(--accent-primary))', fontWeight: 600 }}>
            Reset All
          </button>
        </div>

        {/* Category Filter */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase' }}>Category</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: '6652ed9a2d480d195cbb292a', name: 'Electronics' },
              { id: '6652ed9a2d480d195cbb292b', name: 'Fashion' },
              { id: '6652ed9a2d480d195cbb292c', name: 'Home & Kitchen' },
              { id: '6652ed9a2d480d195cbb292d', name: 'Fitness & Sports' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
                style={{
                  textAlign: 'left',
                  fontSize: '13px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeCategory === cat.id ? 'hsla(var(--accent-primary), 0.15)' : 'transparent',
                  color: activeCategory === cat.id ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                  fontWeight: activeCategory === cat.id ? 700 : 500
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase' }}>Brand</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Acoustics', 'Quantum Tech', 'Outback Gear', 'ChefTools'].map(brand => (
              <button
                key={brand}
                onClick={() => setActiveBrand(activeBrand === brand ? '' : brand)}
                style={{
                  textAlign: 'left',
                  fontSize: '13px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeBrand === brand ? 'hsla(var(--accent-primary), 0.15)' : 'transparent',
                  color: activeBrand === brand ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                  fontWeight: activeBrand === brand ? 700 : 500
                }}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase' }}>Price Range ($)</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '12px' }}
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '12px' }}
            />
          </div>
        </div>

        {/* Ratings Filter */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase' }}>Ratings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[4, 3, 2].map(rating => (
              <button
                key={rating}
                onClick={() => setActiveRating(activeRating === rating ? '' : rating)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeRating === rating ? 'hsla(var(--accent-primary), 0.15)' : 'transparent',
                  color: activeRating === rating ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                  fontWeight: activeRating === rating ? 700 : 500
                }}
              >
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map(starIdx => (
                    <Star
                      key={starIdx}
                      size={12}
                      fill={starIdx <= rating ? 'hsl(var(--accent-warning))' : 'transparent'}
                      style={{ color: starIdx <= rating ? 'hsl(var(--accent-warning))' : 'hsl(var(--text-muted))' }}
                    />
                  ))}
                </div>
                <span>& Up</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 2. Main Product Grid Section */}
      <section style={{ flexGrow: 1 }}>
        {/* Top Control Bar */}
        <div className="glass-panel" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>
            Showing <strong>{products.length}</strong> items in catalog
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ArrowUpDown size={14} style={{ color: 'hsl(var(--text-muted))' }} />
            <select
              value={activeSort}
              onChange={e => setActiveSort(e.target.value)}
              className="form-input"
              style={{ width: '160px', padding: '6px 12px', height: '36px', fontSize: '12px', cursor: 'pointer' }}
            >
              <option value="newest">Newest Additions</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="popularity">Average Rating</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid-responsive">
            {[1, 2, 6, 8].map(idx => (
              <div key={idx} className="glass-panel" style={{ height: '380px', borderRadius: 'var(--radius-md)' }} className="skeleton" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid-responsive">
            {products.map(prod => (
              <Link href={`/products/${prod._id}`} key={prod._id} className="glass-panel interactive-panel" style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}>
                <div style={{ position: 'relative', height: '200px', backgroundColor: 'hsl(var(--bg-tertiary))' }}>
                  <img
                    src={prod.images && prod.images[0] ? prod.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                    alt={prod.name}
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
                  <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4, color: 'hsl(var(--text-primary))' }}>
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
                      <span style={{ fontSize: '16px', fontWeight: 800 }}>${prod.price}</span>
                      {prod.discount > 0 && (
                        <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'hsl(var(--text-muted))', marginLeft: '6px' }}>
                          ${prod.originalPrice}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="btn btn-primary"
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 0', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>No products found</h4>
            <p style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))' }}>Try adjusting your filters or search query.</p>
          </div>
        )}
      </section>

      <style jsx global>{`
        @media (max-width: 768px) {
          aside { display: none !important; }
        }
      `}</style>
    </div>
  );
}
