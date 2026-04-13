import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productSlice';
import categoriesReducer from '../features/products/categorySlice';
import brandReducer from '../features/products/brandSlice';
import authReducer from '../features/auth/authSlice';
import { orderApi } from '../features/orders/orderApi';
import { transactionApi } from '../features/transactions/transactionApi';
import { customerApi } from '../features/customers/customerApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
    brands: brandReducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(orderApi.middleware)
      .concat(transactionApi.middleware)
      .concat(customerApi.middleware),
});
