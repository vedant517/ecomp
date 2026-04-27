import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../services/apiConfig';

const API_URL = `${API_BASE_URL}/brands`;

const getAuthHeader = (thunkAPI) => ({
  Authorization: `Bearer ${thunkAPI.getState().auth?.token}`,
});

export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async (categoryId = null, thunkAPI) => {
    try {
      const url = categoryId ? `${API_URL}?category=${categoryId}` : API_URL;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createBrand = createAsyncThunk(
  'brands/createBrand',
  async (brandData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, brandData, {
        headers: getAuthHeader(thunkAPI),
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateBrand = createAsyncThunk(
  'brands/updateBrand',
  async ({ id, brandData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, brandData, {
        headers: getAuthHeader(thunkAPI),
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteBrand = createAsyncThunk(
  'brands/deleteBrand',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader(thunkAPI),
      });
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const brandSlice = createSlice({
  name: 'brands',
  initialState: {
    brands: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => { state.loading = true; })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.data;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.push(action.payload);
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.brands.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.brands[index] = action.payload;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b._id !== action.payload);
      });
  },
});

export default brandSlice.reducer;
