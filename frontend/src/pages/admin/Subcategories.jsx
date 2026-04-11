import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, Edit, Trash2, Filter, X, 
  Layers, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import { fetchCategories, fetchSubcategories, createSubcategory } from '../../features/products/categorySlice';

const Subcategories = () => {
  const dispatch = useDispatch();
  const { categories, subcategories, loading } = useSelector((state) => state.categories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories()); // Fetch all
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createSubcategory({ name, category: categoryId, description }));
    if (createSubcategory.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsModalOpen(false);
        setName('');
        setCategoryId('');
        setDescription('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 animate-fadeIn space-y-10">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <Layers className="text-emerald-500" size={32} />
             Subcategories
          </h1>
          <p className="text-slate-500 font-medium mt-1 ml-11 uppercase tracking-widest text-[10px]">
            Index of {subcategories.length} Specialized Groups
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search sub-niches..."
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95 text-xs uppercase tracking-widest"
          >
            <Plus size={20} strokeWidth={3} />
            New Link
          </button>
        </div>
      </div>

      {/* ── Subcategories Table ── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="px-10 py-6">Identity</th>
              <th className="px-10 py-6">Parent Root</th>
              <th className="px-10 py-6">Description</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {subcategories.map((sub) => (
              <tr key={sub._id} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-10 py-6">
                  <span className="font-bold text-slate-900 uppercase text-sm tracking-tight group-hover:text-emerald-500 transition-colors">
                    {sub.name}
                  </span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">
                      {sub.category?.name || 'Unlinked'}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-6 max-w-xs truncate">
                  <span className="text-[12px] text-slate-400 font-medium italic">
                    {sub.description || 'Dedicated segment for specialized inventory distribution.'}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                   <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"><Edit size={18} /></button>
                      <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                   </div>
                </td>
              </tr>
            ))}
            {subcategories.length === 0 && (
              <tr>
                <td colSpan="4" className="py-20 text-center">
                   <div className="flex flex-col items-center gap-2 text-slate-300">
                      <AlertCircle size={48} />
                      <p className="font-black uppercase tracking-widest text-[10px]">No classifications found in cluster</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in transition-all">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl max-w-md w-full animate-in zoom-in-95 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>

            <div className="mb-10">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Categorize</h3>
              <p className="text-slate-400 font-bold text-sm mt-2 font-outfit">Create a specialized nexus for your products</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Display Name</label>
                <input
                  required value={name} onChange={e => setName(e.target.value)}
                  type="text" placeholder="e.g. Wireless Audio"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Parent Category</label>
                <div className="relative">
                  <select
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Root...</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Contextual Info</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  rows="3" placeholder="Strategic segment details..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700 resize-none outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 text-lg uppercase tracking-tight mt-4"
              >
                {loading ? 'Propagating...' : 'Form Classification'}
              </button>
            </form>

            {success && (
              <div className="mt-8 flex items-center justify-center gap-3 text-emerald-500 font-black uppercase tracking-widest text-[10px] animate-bounce">
                <CheckCircle2 size={18} /> Subcategory Successfully Synced
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Subcategories;
