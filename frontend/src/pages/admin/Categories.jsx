import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Bell, Sun, Plus, MoreVertical,
  ChevronRight, Filter, Edit, Trash2, ArrowLeft, ArrowRight
} from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../features/products/categorySlice';
import { fetchProducts } from '../../features/products/productSlice';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2 } from 'lucide-react';

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading } = useSelector((state) => state.categories);
  const { items: products } = useSelector((state) => state.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const [activeTab, setActiveTab] = useState('All Product');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const categoryData = { name, description, image };

    let result;
    if (isEditing) {
      result = await dispatch(updateCategory({ id: editId, categoryData }));
    } else {
      result = await dispatch(createCategory(categoryData));
    }

    if (createCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closeModal();
      }, 2000);
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setEditId(category._id);
    setName(category.name);
    setDescription(category.description || '');
    setImage(category.image || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All related items may be affected.')) {
      await dispatch(deleteCategory(id));
    }
  };

  const closeModal = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setDescription('');
    setImage('');
    setIsModalOpen(false);
  };

  const tabs = [
    { name: 'All Product', count: products.length },
    { name: 'Categories', count: categories.length },
    { name: 'Featured' },
    { name: 'Archived' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-800">

      {/* ── Discover Section ── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[20px] font-bold text-[#1f2937]">Discover</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#4c9f70] hover:bg-emerald-600 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
            >
              <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                <Plus size={10} strokeWidth={3} />
              </div>
              Create Category
            </button>
            <button
              onClick={() => navigate('/add-product')}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm transition-colors shadow-sm"
            >
              Add Product <Plus size={14} className="text-slate-500 ml-1" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full md:pr-14">
            {(categories.length > 0 ? categories : []).slice(0, 8).map((cat, idx) => (
              <div
                key={cat._id || idx}
                onClick={() => handleEdit(cat)}
                className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-500/30 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-[45px] h-[45px] rounded border border-slate-100 bg-white flex items-center justify-center p-1.5 flex-shrink-0 relative overflow-hidden group-hover:scale-110 transition-transform">
                  <img
                    src={cat.image && (cat.image.startsWith('http') || cat.image.startsWith('data:')) ? cat.image : `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=10b981&color=fff&bold=true`}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[13px] text-slate-800 uppercase tracking-tight">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage Assets</span>
                </div>
              </div>
            ))}
          </div>
          <button className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-[34px] h-[34px] bg-white rounded-full border border-slate-200 items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors shadow-sm">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Table Section ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mt-10">

        {/* Table Top Toolbar */}
        <div className="px-6 py-4 flex flex-col xl:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 w-full xl:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`text-[13px] font-bold pb-1 transition-colors ${activeTab === tab.name
                  ? 'text-[#2c7a4b] bg-emerald-50 px-3 py-1.5 rounded-md'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab.name} {tab.count !== undefined && <span className="opacity-60">({tab.count})</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto">
            <div className="relative w-full md:w-[240px]">
              <input
                type="text"
                placeholder="Search catalog..."
                className="w-full pl-4 pr-9 py-2 bg-slate-50 border border-slate-100 rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50">
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 uppercase text-[11px] tracking-wider text-slate-400">
                <th className="px-4 py-4 rounded-l-lg w-10 text-center"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" /></th>
                <th className="px-3 py-4 font-black">Category Identity</th>
                <th className="px-3 py-4 font-black text-center">Description</th>
                <th className="px-3 py-4 font-black text-center">Last Modified</th>
                <th className="px-3 py-4 font-black text-right rounded-r-lg">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px]">
            {(categories || []).map((cat, index) => (
                <tr key={cat._id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-center text-slate-400 font-bold">{index + 1}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-[40px] h-[40px] rounded-lg border border-slate-100 bg-white flex items-center justify-center p-1 flex-shrink-0 shadow-sm">
                        <img
                          src={cat.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=10b981&color=fff&bold=true`}
                          alt={cat.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 uppercase tracking-tight">{cat.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{cat.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center text-slate-500 font-medium italic truncate max-w-[200px]">
                    {cat.description || 'Global taxonomy segment for product organization.'}
                  </td>
                  <td className="px-3 py-4 text-center font-bold text-slate-700">
                    {new Date(cat.updatedAt || Date.now()).toLocaleDateString('en-GB').replace(/\//g, '-')}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all font-bold"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && categories.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating Categories...</span>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={14} /> Previous
          </button>

          <div className="flex gap-1.5 items-center">
            <button className="w-[30px] h-[30px] flex items-center justify-center rounded bg-[#a4dcbb] text-[#1c6439] font-bold text-[13px]">1</button>
            {[2, 3, 4, 5].map((num) => (
              <button key={num} className="w-[30px] h-[30px] flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:border-[#4c9f70] hover:text-[#4c9f70] transition-colors font-medium text-[13px]">
                {num}
              </button>
            ))}
            <span className="w-[30px] h-[30px] flex items-center justify-center text-slate-400 font-bold tracking-widest text-[13px]">...</span>
            <button className="w-[30px] h-[30px] flex items-center justify-center rounded bg-white border border-slate-200 text-slate-500 hover:border-[#4c9f70] hover:text-[#4c9f70] transition-colors font-medium text-[13px]">24</button>
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in transition-all">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-500 relative">
            <button
              onClick={closeModal}
              className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="mb-10 text-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                {isEditing ? 'Modify Category' : 'New Main Category'}
              </h3>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 px-10">
                {isEditing ? 'Updating Taxonomy Node' : 'Initialize a new global product classification'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Display Name</label>
                <input
                  required value={name} onChange={e => setName(e.target.value)}
                  type="text" placeholder="e.g. Computing"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Icon Overlay / Identity (URL)</label>
                <input
                  value={image} onChange={e => setImage(e.target.value)}
                  type="text" placeholder="https://assets.store.com/category-icon.png"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Global Segment Focus</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  rows="3" placeholder="Define the scope of this global category segment..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700 resize-none outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-slate-900/10 active:scale-95 text-xs uppercase tracking-widest mt-4"
              >
                {loading ? 'Processing...' : (isEditing ? 'Synchronize Data' : 'Initialize Category')}
              </button>
            </form>

            {success && (
              <div className="mt-8 flex items-center justify-center gap-3 text-emerald-500 font-black uppercase tracking-widest text-[10px] animate-bounce">
                <CheckCircle2 size={16} /> Data Persisted Successfully
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
