import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, Filter, Edit, Trash2, X, ImagePlus,
  AlertCircle, CheckCircle2, ChevronDown, MoreHorizontal,
  Package, DollarSign, Layers, Tag, Bell, Moon
} from 'lucide-react';
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  clearProductError,
  clearSuccessMessage,
} from '../../features/products/productSlice';
import { fetchCategories } from '../../features/products/categorySlice';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, loading, error, successMessage } = useSelector((s) => s.products);
  const { categories } = useSelector((s) => s.categories);

  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => dispatch(clearSuccessMessage()), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteProduct(id));
    setDeleteConfirm(null);
  };

  const filtered = (products || []).filter((p) =>
    (p?.name || '').toLowerCase().includes((search || '').toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-10 space-y-10">

      {/* ── Header Section ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Products Catalog</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-1">
              Currently Managing {filtered.length} Unique Items
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Deep catalog search..."
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-80 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
            />
          </div>
          <button onClick={() => navigate('/add-product')} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
            <Plus size={20} strokeWidth={3} /> ADD PRODUCT
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50 bg-slate-50/20">
          <div className="flex p-1.5 bg-slate-100/80 rounded-2xl w-fit">
            <button className="px-6 py-2.5 rounded-xl text-sm font-black bg-white text-emerald-600 shadow-md">All Stock</button>
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500">Low Inventory</button>
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500">Out of Stock</button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3.5 bg-white border border-slate-100 text-slate-500 rounded-2xl hover:text-emerald-600 transition-all shadow-sm">
              <Filter size={20} />
            </button>
            <button className="p-3.5 bg-white border border-slate-100 text-slate-500 rounded-2xl hover:text-emerald-600 transition-all shadow-sm">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.15em]">
                <th className="px-8 py-6">Product Details</th>
                <th className="px-8 py-6">Taxonomy</th>
                <th className="px-8 py-6">Brand</th>
                <th className="px-8 py-6 text-center">Price Points</th>
                <th className="px-8 py-6 text-center">Availability</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                        <Package size={32} />
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No products matched your parameters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100 group-hover:shadow-xl group-hover:scale-105 transition-all duration-500 flex-shrink-0">
                          <img
                            src={product?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.name || 'Item')}&background=10b981&color=fff&bold=true`}
                            className="w-full h-full object-cover"
                            alt={product?.name}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight truncate group-hover:text-emerald-500 transition-colors">
                            {product?.name || 'Unknown Item'}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-400 truncate mt-1 uppercase tracking-widest">
                            UID: {product?._id ? product._id.slice(-6) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">
                          {product.category?.name || 'General'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                          {product.subcategory?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         {product.brand?.logo && (
                           <img src={product.brand.logo} className="w-5 h-5 rounded-full object-contain" alt="" />
                         )}
                         <span className="text-[11px] font-black uppercase text-slate-600">{product.brand?.name || 'Generic'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-black text-slate-900 text-lg tracking-tighter">${Number(product.price).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20' :
                            product.stock > 0 ? 'bg-amber-50 text-amber-600 ring-amber-500/20' :
                              'bg-rose-50 text-rose-600 ring-rose-500/20'
                          }`}>
                          {product.stock > 0 ? 'AVAILABLE' : 'DEPLETED'}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">{product.stock} units</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <button
                          onClick={() => navigate(`/edit-product/${product._id}`)}
                          className="p-3 bg-white text-slate-400 hover:text-blue-500 hover:bg-blue-50 border border-slate-100 rounded-2xl shadow-sm transition-all"
                          title="Edit Details"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product._id)}
                          className="p-3 bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 rounded-2xl shadow-sm transition-all"
                          title="Purge Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── High Fidelity Pagination ── */}
        <div className="p-8 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Records <span className="text-slate-900">1 - {filtered.length}</span> of {products.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all opacity-50 cursor-not-allowed">Previous</button>
            <div className="flex gap-1.5">
              <button className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20">1</button>
              <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 font-bold text-xs hover:bg-slate-50 transition-all">2</button>
            </div>
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Next</button>
          </div>
        </div>
      </div>

      {/* ── Purge Confirmation ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in active:scale-100 transition-all">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_32px_128px_rgb(0,0,0,0.2)] max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner ring-4 ring-rose-50">
              <AlertCircle size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">Purge Product?</h3>
              <p className="text-slate-500 font-bold text-sm mt-3 px-4">This record will be permanently deleted from the primary database cluster.</p>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-4 bg-rose-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95">Confirm Purge</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications ── */}
      {successMessage && (
        <div className="fixed bottom-10 right-10 z-[1000] bg-emerald-500 text-white px-8 py-5 rounded-[2rem] shadow-2xl shadow-emerald-500/30 flex items-center gap-4 animate-in slide-in-from-bottom-10">
          <CheckCircle2 size={24} />
          <span className="font-black text-xs uppercase tracking-widest">{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Products;
