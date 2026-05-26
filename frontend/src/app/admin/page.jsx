'use client';
import { API_BASE_URL } from '@/config';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';
import { ShieldCheck, BarChart3, Users, ClipboardList, ShieldAlert, Ban, Unlock } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);

  const [stats, setStats] = useState({});
  const [usersList, setUsersList] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      // 1. Fetch Analytics
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        setSalesHistory(statsData.salesHistory || []);
      }

      // 2. Fetch Users
      const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsersList(usersData.users);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || (user && user.role !== 'admin')) {
      dispatch(addToast({ message: 'Unauthorized! Admins only.', type: 'error' }));
      router.push('/');
      return;
    }
    fetchAdminData();
  }, [token, user, router]);

  const handleToggleUserBlock = async (userId, currentlyBlocked) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: !currentlyBlocked })
      });
      const data = await res.json();
      if (data.success) {
        dispatch(addToast({ message: data.message, type: 'success' }));
        fetchAdminData(); // reload
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

  // Calculate SVG Chart coordinates
  const maxVal = salesHistory.length > 0 ? Math.max(...salesHistory.map(s => s.revenue)) * 1.2 : 1000;
  const svgWidth = 500;
  const svgHeight = 150;
  const points = salesHistory.map((s, idx) => {
    const x = (idx / (salesHistory.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - ((s.revenue / maxVal) * (svgHeight - 40) + 20);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <ShieldCheck size={28} style={{ color: 'hsl(var(--accent-primary))' }} />
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Admin Analytics Panel</h1>
          <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Overview of Apex marketplace registrations and sales.</span>
        </div>
      </div>

      {/* 1. Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {[
          { icon: <BarChart3 size={20} />, label: 'Total Sales Revenue', value: `$${stats.totalRevenue || '0'}` },
          { icon: <ClipboardList size={20} />, label: 'Orders Processed', value: stats.totalSalesCount || '0' },
          { icon: <Users size={20} />, label: 'Registered Customers', value: stats.totalUsers || '0' },
          { icon: <ShieldAlert size={20} />, label: 'Pending Shipments', value: stats.pendingOrders || '0' }
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
              color: 'hsl(var(--accent-primary))'
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

      {/* 2. Interactive SVG Graph & User Block Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '30px', alignItems: 'start' }}>
        
        {/* Sales Chart */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Marketplace Monthly Revenue Trends</h3>

          {salesHistory.length > 0 && (
            <div>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                {/* Background Grid Lines */}
                <line x1="20" y1="20" x2={svgWidth - 20} y2="20" stroke="hsl(var(--border-color))" strokeDasharray="4 4" />
                <line x1="20" y1="75" x2={svgWidth - 20} y2="75" stroke="hsl(var(--border-color))" strokeDasharray="4 4" />
                <line x1="20" y1="130" x2={svgWidth - 20} y2="130" stroke="hsl(var(--border-color))" />

                {/* Line graph */}
                <polyline
                  fill="none"
                  stroke="hsl(var(--accent-primary))"
                  strokeWidth="3"
                  points={points}
                />

                {/* Data Points */}
                {salesHistory.map((s, idx) => {
                  const x = (idx / (salesHistory.length - 1)) * (svgWidth - 40) + 20;
                  const y = svgHeight - ((s.revenue / maxVal) * (svgHeight - 40) + 20);
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="hsl(var(--accent-secondary))" stroke="white" strokeWidth="1.5" />
                      <text x={x} y={y - 12} fontSize="8" fontWeight="700" fill="hsl(var(--text-primary))" textAnchor="middle">
                        ${Math.round(s.revenue)}
                      </text>
                      <text x={x} y="145" fontSize="8" fontWeight="600" fill="hsl(var(--text-muted))" textAnchor="middle">
                        {s.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* User Block Control */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>User Directory Controls</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto', paddingRight: '6px' }}>
            {usersList.map(u => {
              const blocked = !u.isVerified; // mapping blocked/unblocked status

              return (
                <div key={u._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid hsl(var(--border-color))',
                  fontSize: '13px'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block' }}>{u.name}</span>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'block' }}>{u.email}</span>
                    <span className="badge badge-new" style={{ fontSize: '8px', padding: '2px 6px', marginTop: '4px', display: 'inline-block' }}>
                      {u.role}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleUserBlock(u._id, blocked)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: blocked ? 'hsla(var(--accent-success), 0.15)' : 'hsla(var(--accent-danger), 0.15)',
                      color: blocked ? 'hsl(var(--accent-success))' : 'hsl(var(--accent-danger))'
                    }}
                  >
                    {blocked ? (
                      <><Unlock size={12} /> Unblock</>
                    ) : (
                      <><Ban size={12} /> Block</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
