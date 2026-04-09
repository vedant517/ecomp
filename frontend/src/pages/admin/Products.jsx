import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, X, ImagePlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  clearProductError,
  clearSuccessMessage,
} from '../../features/products/productSlice';

// ─── Default form state ──────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', description: '', price: '', category: '', stock: '' };

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty', 'Books', 'Toys', 'Other'];

// ─── Component ───────────────────────────────────────────────────────────────
const Products = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error, successMessage } = useSelector((s) => s.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = add mode
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);

  // ── Fetch on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // ── Auto-clear toast messages
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccessMessage()), 3500);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearProductError()), 4000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  // ── Open modal helpers
  const openAddModal = () => {
    setEditProduct(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
    });
    setImageFile(null);
    setImagePreview(product.image || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditProduct(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
  };

  // ── Image pick
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Submit (add or update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);

    if (editProduct) {
      dispatch(updateProduct({ id: editProduct._id, productData: fd }));
    } else {
      dispatch(addProduct(fd));
    }
    closeModal();
  };

  // ── Delete
  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    setDeleteConfirm(null);
  };

  // ── Filtered products
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* ── Toast Notifications ── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            key="success-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl backdrop-blur-md text-emerald-300 font-semibold shadow-2xl"
          >
            <CheckCircle2 size={18} /> {successMessage}
          </motion.div>
        )}
        {error && (
          <motion.div
            key="error-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 bg-red-500/20 border border-red-500/40 rounded-xl backdrop-blur-md text-red-300 font-semibold shadow-2xl"
          >
            <AlertCircle size={18} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Products Management</h1>
          <p className="text-slate-400">
            {loading ? 'Loading…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button id="add-product-btn" onClick={openAddModal} className="btn-primary flex items-center space-x-2 w-fit">
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* ── Search ── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            id="product-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category…"
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-all font-medium"
          />
        </div>
        <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl flex items-center space-x-2 hover:bg-white/10 transition-all">
          <Filter size={18} className="text-slate-400" />
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {/* ── Product Table ── */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      Loading products…
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                    No products found. Start by adding one.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <motion.tr
                    key={product._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-all group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                          <img
                            src={product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=6366f1&color=fff&size=48`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{product.name}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-400">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200">${Number(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">{product.stock} in stock</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-white/10 hover:text-primary-400 transition-colors"
                          title="Edit product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Delete Confirm Dialog ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative glass-card p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-14 h-14 bg-red-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Product?</h3>
              <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-bold text-white">
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add / Edit Product Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-8 shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  <X size={22} />
                </button>
              </div>

              <form id="product-form" onSubmit={handleSubmit} className="space-y-5">

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400">Product Image</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full h-40 bg-white/5 border-2 border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/60 hover:bg-white/8 transition-all overflow-hidden group"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImagePlus size={32} className="text-slate-500 mb-2 group-hover:text-primary-400 transition-colors" />
                        <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">Click to upload image</span>
                        <span className="text-xs text-slate-600 mt-1">JPG, PNG, WebP — max 5 MB</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    id="product-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-400">Product Name *</label>
                  <input
                    id="product-name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Midnight Tech Jacket"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-400">Price ($) *</label>
                    <input
                      id="product-price"
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="99.99"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-400">Stock *</label>
                    <input
                      id="product-stock"
                      required
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="50"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-400">Category *</label>
                  <select
                    id="product-category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-all appearance-none"
                  >
                    <option value="" disabled className="bg-slate-900">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-400">Description *</label>
                  <textarea
                    id="product-description"
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the product details…"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-all resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  id="product-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                  ) : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
