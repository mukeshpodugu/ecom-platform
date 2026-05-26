import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') || 'dark';
  }
  return 'dark';
};

const initialState = {
  theme: getInitialTheme(),
  isChatOpen: false,
  toasts: [], // Array of { id, message, type: 'success' | 'error' | 'info' }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
        document.documentElement.setAttribute('data-theme', action.payload);
      }
    },
    toggleChat: (state) => {
      state.isChatOpen = !state.isChatOpen;
    },
    setChatStatus: (state, action) => {
      state.isChatOpen = action.payload;
    },
    addToast: (state, action) => {
      const id = Math.random().toString(36).substring(2, 9);
      state.toasts.push({
        id,
        message: action.payload.message,
        type: action.payload.type || 'info'
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    }
  }
});

export const { toggleTheme, setTheme, toggleChat, setChatStatus, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
