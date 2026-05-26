import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api/products';

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (filterParams = {}, thunkAPI) => {
    try {
      // Build query string
      const query = new URLSearchParams();
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] !== undefined && filterParams[key] !== '') {
          query.append(key, filterParams[key]);
        }
      });

      const response = await fetch(`${API_URL}?${query.toString()}`);
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (productId, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/${productId}`);
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data.product;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchSimilarRecommendations = createAsyncThunk(
  'products/fetchSimilar',
  async (productId, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/${productId}/recommendations`);
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data.recommendations;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchPersonalizedRecommendations = createAsyncThunk(
  'products/fetchPersonalized',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const response = await fetch(`${API_URL}/user/recommendations`, { headers });
      const data = await response.json();
      if (!response.ok) return thunkAPI.rejectWithValue(data.error);
      return data.recommendations;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const initialState = {
  products: [],
  selectedProduct: null,
  similarProducts: [],
  personalizedRecommendations: [],
  suggestions: [],
  pagination: {
    page: 1,
    limit: 12,
    totalPages: 1,
    totalProducts: 0
  },
  loading: false,
  detailLoading: false,
  error: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.similarProducts = [];
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single
      .addCase(fetchProductById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      // Similar recommendations
      .addCase(fetchSimilarRecommendations.fulfilled, (state, action) => {
        state.similarProducts = action.payload || [];
      })
      // Personalized recommendations
      .addCase(fetchPersonalizedRecommendations.fulfilled, (state, action) => {
        state.personalizedRecommendations = action.payload || [];
      });
  }
});

export const { clearSelectedProduct, setSuggestions } = productSlice.actions;
export default productSlice.reducer;
