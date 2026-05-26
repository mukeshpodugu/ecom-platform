'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { fetchProfile } from '@/store/authSlice';
import { fetchCart } from '@/store/cartSlice';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}

function AppInitializer({ children }) {
  useEffect(() => {
    // 1. Initial themes load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Fetch User Profile and Cart Items if token exists
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(fetchProfile()).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          store.dispatch(fetchCart());
        }
      });
    }
  }, []);

  return <>{children}</>;
}
