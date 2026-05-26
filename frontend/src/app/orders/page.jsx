'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';
import { ClipboardList, Download, XCircle, Truck, Package, Clock, ShieldAlert } from 'lucide-react';

export default function OrdersHistoryPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector(state => state.auth);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from API
  const fetchMyOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchMyOrders();
  }, [token, router]);

  // Securely Download Invoice PDF via Fetch
  const handleDownloadInvoice = async (orderId) => {
    try {
      dispatch(addToast({ message: 'Generating invoice PDF...', type: 'info' }));

      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to generate invoice');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      dispatch(addToast({ message: 'Invoice downloaded successfully!', type: 'success' }));
    } catch (err) {
      console.error(err);
      dispatch(addToast({ message: 'Error downloading invoice', type: 'error' }));
    }
  };

  // Cancel order request
  const handleCancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order? This will restore stock levels.')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        dispatch(addToast({ message: 'Order cancelled successfully!', type: 'success' }));
        fetchMyOrders(); // reload
      } else {
        dispatch(addToast({ message: data.error || 'Failed to cancel', type: 'error' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTimelineStep = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Dispatched': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 0; // Cancelled
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-md)' }} />
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 24px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ClipboardList size={28} style={{ color: 'hsl(var(--accent-primary))' }} /> Your Orders
      </h1>

      {orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {orders.map(order => {
            const step = getTimelineStep(order.deliveryStatus);
            const dateStr = new Date(order.createdAt).toLocaleDateString();

            return (
              <div key={order._id} className="glass-panel" style={{
                borderRadius: 'var(--radius-md)',
                padding: '30px',
                border: '1px solid hsl(var(--border-color))'
              }}>
                {/* Header info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid hsl(var(--border-color))',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Order Placed
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{dateStr}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Order ID
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                      INV-{order._id.substring(0, 10).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Amount
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 800 }}>${order.grandTotal.toFixed(2)}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleDownloadInvoice(order._id)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', fontSize: '12px', gap: '6px' }}
                    >
                      <Download size={14} /> Invoice
                    </button>
                    {step > 0 && step <= 2 && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '12px', gap: '6px', color: 'hsl(var(--accent-danger))', borderColor: 'hsla(var(--accent-danger), 0.2)' }}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Items rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>
                        {item.product?.name || 'Product'} <strong style={{ color: 'hsl(var(--text-primary))' }}>x{item.quantity}</strong>
                      </span>
                      <span style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Tracker Timeline */}
                {step === 0 ? (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'hsla(var(--accent-danger), 0.1)',
                    border: '1px solid hsla(var(--accent-danger), 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'hsl(var(--accent-danger))',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <ShieldAlert size={16} /> This order was Cancelled. Stock levels have been restored.
                  </div>
                ) : (
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '14px', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))' }}>
                      Delivery Status
                    </h4>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '20px' }}>
                      {/* Connection track line */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '20px',
                        right: '20px',
                        height: '3px',
                        backgroundColor: 'hsl(var(--border-color))',
                        zIndex: 1
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '20px',
                        width: `${((step - 1) / 3) * 100}%`,
                        height: '3px',
                        backgroundColor: 'hsl(var(--accent-primary))',
                        zIndex: 2,
                        transition: 'width 0.4s'
                      }} />

                      {/* Steps */}
                      {[
                        { label: 'Placed', icon: <Clock size={12} /> },
                        { label: 'Dispatched', icon: <Package size={12} /> },
                        { label: 'Shipped', icon: <Truck size={12} /> },
                        { label: 'Delivered', icon: <CheckCircle size={12} /> }
                      ].map((itemStep, idx) => {
                        const stepNum = idx + 1;
                        const isDone = stepNum <= step;
                        const isCurrent = stepNum === step;

                        return (
                          <div key={idx} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 3,
                            width: '60px'
                          }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? 'hsl(var(--accent-primary))' : 'hsl(var(--bg-secondary))',
                              border: `2px solid ${isDone ? 'hsl(var(--accent-primary))' : 'hsl(var(--border-color))'}`,
                              color: isDone ? 'white' : 'hsl(var(--text-muted))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isCurrent ? '0 0 0 4px hsla(var(--accent-primary), 0.15)' : 'none'
                            }}>
                              {itemStep.icon}
                            </div>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? 'hsl(var(--accent-primary))' : isDone ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))',
                              marginTop: '8px',
                              textAlign: 'center',
                              whiteSpace: 'nowrap'
                            }}>
                              {itemStep.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 0', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>No order history</h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '20px' }}>Make purchases to view tracking reports.</p>
          <button onClick={() => router.push('/products')} className="btn btn-primary">Start Shopping</button>
        </div>
      )}
    </div>
  );
}
