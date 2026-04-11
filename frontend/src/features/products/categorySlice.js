import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/categories';

const getAuthHeader = (thunkAPI) => ({
  Authorization: `Bearer ${thunkAPI.getState().auth?.token}`,
});

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, thunkAPI) => {
    try {
      const response = await axios.post(API_URL, categoryData, {
        headers: getAuthHeader(thunkAPI),
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  'categories/fetchSubcategories',
  async (categoryId = null, thunkAPI) => {
    try {
      const url = categoryId ? `${API_URL}/${categoryId}/subcategories` : `${API_URL}/subcategories`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createSubcategory = createAsyncThunk(
  'categories/createSubcategory',
  async (subcategoryData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_URL}/subcategories`, subcategoryData, {
        headers: getAuthHeader(thunkAPI),
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    subcategories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.subcategories = action.payload.data;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.subcategories.push(action.payload);
      });
  },
});

export default categorySlice.reducer;
