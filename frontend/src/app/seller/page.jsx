'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';
import { Store, Plus, Trash2, ShieldCheck, DollarSign, Package, Tag, ArrowRight } from 'lucide-react';

export default function SellerDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [productsList, setProductsList] = useState([]);
  
  // Product Creation State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('6652ed9a2d480d195cbb292a'); // default Electronics

  const fetchSellerData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/sellers/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStoreInfo(data.storeInfo);
        setAnalytics(data.analytics);
        setProductsList(data.products || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || (user && user.role !== 'seller' && user.role !== 'admin')) {
      dispatch(addToast({ message: 'Access denied. Sellers only!', type: 'error' }));
      router.push('/');
      return;
    }
    fetchSellerData();
  }, [token, user, router]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !description || !price || !originalPrice || !brand || !stock) {
      dispatch(addToast({ message: 'Please fill out all fields', type: 'error' }));
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/sellers/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          price,
          originalPrice,
          categoryId,
          brand,
          stock
        })
      });
      const data = await res.json();

      if (data.success) {
        dispatch(addToast({ message: 'Product published successfully!', type: 'success' }));
        setShowAddForm(false);
        // Clear inputs
        setName('');
        setDescription('');
        setPrice('');
        setOriginalPrice('');
        setBrand('');
        setStock('');
        fetchSellerData(); // reload
      } else {
        dispatch(addToast({ message: data.error || 'Failed to add product', type: 'error' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/sellers/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        dispatch(addToast({ message: 'Product removed from marketplace', type: 'success' }));
        fetchSellerData(); // reload
      } else {
        dispatch(addToast({ message: data.error, type: 'error' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Store size={28} style={{ color: 'hsl(var(--accent-secondary))' }} />
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800 }}>{storeInfo.storeName}</h1>
            <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>
              Store Verification: <strong>Active</strong> | Rating: <strong>{storeInfo.rating || '4.8'} ⭐</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ height: '40px', padding: '0 16px', gap: '6px' }}
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* 1. Dashboard Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {[
          { icon: <DollarSign size={20} />, label: 'Total Earnings', value: `$${analytics.totalEarnings || '0'}` },
          { icon: <Package size={20} />, label: 'Items Sold', value: analytics.itemsSold || '0' },
          { icon: <Tag size={20} />, label: 'Active Products', value: analytics.activeProducts || '0' }
        ].map((card, idx) => (
          <div key={idx} className="glass-panel" style={{
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'hsl(var(--bg-tertiary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--accent-secondary))'
            }}>
              {card.icon}
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                {card.label}
              </span>
              <span style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px', display: 'block' }}>{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Product List */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Active Inventory Listings</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {productsList.length > 0 ? (
              productsList.map(prod => (
                <div key={prod._id} style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 100px 100px 40px',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid hsl(var(--border-color))',
                  fontSize: '13px'
                }}>
                  <div style={{ height: '50px', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <img src={prod.images?.[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block' }}>{prod.name}</span>
                    <span style={{ fontSize: '10px', color: 'hsl(var(--text-muted))' }}>{prod.brand}</span>
                  </div>
                  <div style={{ fontWeight: 700 }}>${prod.price}</div>
                  <div>Stock: <strong>{prod.stock}</strong></div>
                  <button onClick={() => handleDeleteProduct(prod._id)} style={{ color: 'hsl(var(--accent-danger))' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', padding: '40px 0', color: 'hsl(var(--text-muted))', fontSize: '13px' }}>
                Your inventory is empty. Click "Add Product" to make your first listing!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Add Product Form Panel */}
        {showAddForm && (
          <div className="glass-panel animate-fade-in" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Publish Product
            </h3>

            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" placeholder="Titan watch..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="form-input" rows={3} placeholder="Describe details..." required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Selling Price ($)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="form-input" placeholder="199" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price ($)</label>
                  <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="form-input" placeholder="249" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="form-input" placeholder="Acoustics" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Units</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="form-input" placeholder="50" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="form-input"
                  style={{ height: '40px', fontSize: '13px' }}
                >
                  <option value="6652ed9a2d480d195cbb292a">Electronics</option>
                  <option value="6652ed9a2d480d195cbb292b">Fashion</option>
                  <option value="6652ed9a2d480d195cbb292c">Home & Kitchen</option>
                  <option value="6652ed9a2d480d195cbb292d">Fitness & Sports</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', gap: '6px' }}>
                Publish <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
