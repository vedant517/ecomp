import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/categories';

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
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeader(thunkAPI),
        },
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

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeader(thunkAPI),
        },
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
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

export const updateSubcategory = createAsyncThunk(
  'categories/updateSubcategory',
  async ({ id, subcategoryData }, thunkAPI) => {
    try {
      const response = await axios.put(`${API_URL}/subcategories/${id}`, subcategoryData, {
        headers: getAuthHeader(thunkAPI),
      });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteSubcategory = createAsyncThunk(
  'categories/deleteSubcategory',
  async (id, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/subcategories/${id}`, {
        headers: getAuthHeader(thunkAPI),
      });
      return id;
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
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.subcategories = Array.isArray(action.payload.data) ? action.payload.data : [];
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c._id !== action.payload);
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.subcategories.push(action.payload);
      })
      .addCase(updateSubcategory.fulfilled, (state, action) => {
        const index = state.subcategories.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.subcategories[index] = action.payload;
      })
      .addCase(deleteSubcategory.fulfilled, (state, action) => {
        state.subcategories = state.subcategories.filter(s => s._id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
