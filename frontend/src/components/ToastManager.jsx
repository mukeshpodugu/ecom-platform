'use client';

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '@/store/uiSlice';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function ToastManager() {
  const { toasts } = useSelector(state => state.ui);
  const dispatch = useDispatch();

  return (
    <div style={{
      position: 'fixed',
      top: '90px',
      right: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '360px',
      width: '100%'
    }}>
      {toasts.map(toast => {
        // Setup timer to auto-delete toast
        return (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={(id) => dispatch(removeToast(id))}
          />
        );
      })}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000); // Close after 4s
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          borderLeft: '4px solid hsl(var(--accent-success))',
          icon: <CheckCircle size={18} style={{ color: 'hsl(var(--accent-success))' }} />
        };
      case 'error':
        return {
          borderLeft: '4px solid hsl(var(--accent-danger))',
          icon: <AlertCircle size={18} style={{ color: 'hsl(var(--accent-danger))' }} />
        };
      default:
        return {
          borderLeft: '4px solid hsl(var(--accent-primary))',
          icon: <Info size={18} style={{ color: 'hsl(var(--accent-primary))' }} />
        };
    }
  };

  const styleConfig = getStyle();

  return (
    <div
      className="glass-panel"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        borderLeft: styleConfig.borderLeft,
        justifyContent: 'space-between',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {styleConfig.icon}
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--text-primary))' }}>
          {toast.message}
        </span>
      </div>
      <button onClick={() => onClose(toast.id)} style={{ color: 'hsl(var(--text-muted))' }}>
        <X size={16} />
      </button>

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
