import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/admin/Login';
import Categories from './pages/admin/Categories';
import AddProduct from './pages/admin/AddProduct';
import Brands from './pages/admin/Brands';
import Subcategories from './pages/admin/Subcategories';
import Products from './pages/admin/Products';
import Order from './pages/admin/Order';
import Transactions from './pages/admin/Transactions';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Dashboard Routes */}
        <Route
          element={isAuthenticated ? <AdminLayout setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/" replace />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/subcategories" element={<Subcategories />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/edit-product/:id" element={<AddProduct />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="*" element={<div className="p-8 text-slate-400 text-center">Page under construction</div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
