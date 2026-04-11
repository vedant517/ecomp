import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productSlice';
import categoriesReducer from '../features/products/categorySlice';
import brandReducer from '../features/products/brandSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
    brands: brandReducer,
  },
});
