import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, Bell, Moon, MoreHorizontal,
  ChevronRight, Edit, Trash2, Filter, X, Upload, CheckCircle2,
  Bookmark, ShieldCheck, ExternalLink
} from 'lucide-react';
import { fetchBrands, createBrand } from '../../features/products/brandSlice';

const Brands = () => {
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createBrand({ name, description, logo }));
    if (createBrand.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsModalOpen(false);
        setName('');
        setDescription('');
        setLogo('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-10 space-y-10">

      {/* ── Premium Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bookmark size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Brand Partners</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-1">
              Managing {brands.length} Verified Manufacturers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search store partners..."
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl w-80 shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 text-xs tracking-widest uppercase"
          >
            <Plus size={18} strokeWidth={3} /> New Partner
          </button>
        </div>
      </div>

      {/* ── Brand Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {brands.map((brand) => (
          <div
            key={brand._id}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 transition-colors group-hover:bg-emerald-50/50"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center p-5 shadow-inner border border-slate-50 group-hover:scale-110 transition-transform duration-500">
                <img
                  src={brand.logo && (brand.logo.startsWith('http') || brand.logo.startsWith('data:')) ? brand.logo : `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=6366f1&color=fff&bold=true`}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain mix-blend-multiply opacity-90 transition-opacity group-hover:opacity-100"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{brand.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Partner</span>
                </div>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-4 px-2 italic">
                  "{brand.description || 'Global manufacturer specializing in high-end consumer products.'}"
                </p>
              </div>

              <div className="pt-4 flex gap-2 w-full">
                <button className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                  <Edit size={16} className="mx-auto" />
                </button>
                <button className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                  <Trash2 size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Card Placeholder */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-white hover:border-emerald-500/20 hover:shadow-2xl transition-all duration-500 group"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:rotate-90 transition-all duration-500 shadow-sm group-hover:shadow-md">
            <Plus size={32} />
          </div>
          <span className="mt-4 font-black text-slate-400 group-hover:text-slate-600 text-xs uppercase tracking-widest">Register Partner</span>
        </div>
      </div>

      {/* ── Modal Overlay ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in transition-all">
          <div className="bg-white p-12 rounded-[4rem] shadow-[0_32px_128px_rgb(0,0,0,0.2)] max-w-md w-full animate-in zoom-in-95 duration-500 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>

            <div className="mb-10">
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">New Partner</h3>
              <p className="text-slate-400 font-bold text-sm">Register a new brand in the Dealport ecosystem</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Legal Brand Name</label>
                <input
                  required value={name} onChange={e => setName(e.target.value)}
                  type="text" placeholder="e.g. Sony Corporation"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Logo Digital Asset (URL)</label>
                <input
                  value={logo} onChange={e => setLogo(e.target.value)}
                  type="text" placeholder="https://assets.dealport.com/..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Brand Mission / Info</label>
                <textarea
                  value={description} onChange={e => setDescription(e.target.value)}
                  rows="3" placeholder="Core brand values and segment focus..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-700 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2rem] transition-all shadow-xl shadow-emerald-500/30 active:scale-95 text-lg uppercase tracking-tight mt-4"
              >
                {loading ? 'Authenticating...' : 'Register Partner'}
              </button>
            </form>

            {success && (
              <div className="mt-8 flex items-center justify-center gap-3 text-emerald-500 font-black uppercase tracking-widest text-[10px] animate-bounce">
                <CheckCircle2 size={18} /> Partner Registered Successfully
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
