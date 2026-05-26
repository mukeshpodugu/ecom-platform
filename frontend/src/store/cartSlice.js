import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api/cart';

// Async Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    if (!token) return thunkAPI.rejectWithValue('Please login to view your cart');
    try {
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (itemData, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    if (!token) return thunkAPI.rejectWithValue('Please login to add items to cart');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const updateCartItemQty = createAsyncThunk(
  'cart/updateQty',
  async ({ itemId, quantity }, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const response = await fetch(`${API_URL}/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (itemId, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const response = await fetch(`${API_URL}/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const applyCartCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    try {
      const response = await fetch(`${API_URL}/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  pricing: {
    subtotal: 0,
    discount: 0,
    couponCode: '',
    tax: 0,
    shipping: 0,
    grandTotal: 0
  },
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.pricing = {
        subtotal: 0,
        discount: 0,
        couponCode: '',
        tax: 0,
        shipping: 0,
        grandTotal: 0
      };
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    const handleCartFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload.cart.items || [];
      state.pricing = action.payload.pricing;
    };

    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, handleCartFulfilled)
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Item
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItemToCart.fulfilled, handleCartFulfilled)
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Qty
      .addCase(updateCartItemQty.fulfilled, handleCartFulfilled)
      .addCase(updateCartItemQty.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove Item
      .addCase(removeCartItem.fulfilled, handleCartFulfilled)
      // Apply Coupon
      .addCase(applyCartCoupon.fulfilled, handleCartFulfilled)
      .addCase(applyCartCoupon.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
