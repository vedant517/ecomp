import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Bell, Sun, Plus, MoreVertical,
  ChevronRight, Filter, Edit, Trash2, ArrowLeft, ArrowRight
} from 'lucide-react';
import { fetchCategories } from '../../features/products/categorySlice';
import { fetchProducts } from '../../features/products/productSlice';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories } = useSelector((state) => state.categories);
  const { items: products } = useSelector((state) => state.products);

  const [activeTab, setActiveTab] = useState('All Product');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const tabs = [
    { name: 'All Product', count: 145 },
    { name: 'Featured Products' },
    { name: 'On Sale' },
    { name: 'Out of Stock' }
  ];

  const dummyDiscover = [
    { name: 'Electronics', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { name: 'Fashion', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { name: 'Accessories', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { name: 'Home & Kitchen', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { name: 'Sports & Outdoors', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { name: 'Toys & Games', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { name: 'Health & Fitness', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
    { name: 'Books', img: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' },
  ];

  // We map the actual dynamic categories with the dummy data to reflect exact layout blocks
  const displayDiscover = categories?.length > 0 ? categories : dummyDiscover;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans text-slate-800">

      {/* ── Top Header ── */}
      <div className="flex justify-between items-center mb-10 w-full">
        <h1 className="text-[22px] font-bold text-[#1f2937]">Categories</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-[340px]">
            <input
              type="text"
              placeholder="Search data, users, or reports"
              className="w-full pl-5 pr-10 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] bg-red-500 rounded-full"></span>
            </button>
            <div className="w-[42px] h-[24px] bg-[#e1ecd8] rounded-full flex items-center px-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Sun size={10} className="text-emerald-700" />
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer ml-1">
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* ── Discover Section ── */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[20px] font-bold text-[#1f2937]">Discover</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/add-product')}
              className="flex items-center gap-2 px-4 py-2 bg-[#4c9f70] hover:bg-emerald-600 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
            >
              <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                <Plus size={10} strokeWidth={3} />
              </div>
              Add Product
            </button>
            <button className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm transition-colors shadow-sm">
              More Action <MoreVertical size={14} className="text-slate-500 ml-1" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-4 gap-4 w-full pr-14">
            {displayDiscover.slice(0, 8).map((cat, idx) => (
              <div
                key={cat._id || idx}
                className="flex items-center gap-4 bg-white p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500/30 transition-colors cursor-pointer"
              >
                <div className="w-[45px] h-[45px] rounded border border-slate-100 bg-white flex items-center justify-center p-1.5 flex-shrink-0 relative overflow-hidden">
                  {/* Dynamic image mapped to state or fallback to exact placeholder */}
                  <img
                    src={cat.image && (cat.image.startsWith('http') || cat.image.startsWith('data:')) ? cat.image : 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-semibold text-[13px] text-slate-800">{cat.name}</span>
              </div>
            ))}
          </div>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 w-[34px] h-[34px] bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors shadow-sm">
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
                  ? 'text-[#2c7a4b] bg-[#e1ebd9] px-3 py-1.5 rounded-md'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab.name} {tab.count !== undefined && <span className={`${activeTab === tab.name ? 'text-[#2c7a4b]' : 'text-[#4c9f70]'}`}>({tab.count})</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto">
            <div className="relative w-[240px]">
              <input
                type="text"
                placeholder="Search your product"
                className="w-full pl-4 pr-9 py-2 bg-[#f8fafc] border border-slate-200 rounded-md text-[13px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            </div>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50">
              <Filter size={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50">
              <Plus size={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50">
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              </span>
            </button>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto px-6 pb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#e9f2ee] uppercase text-[12px] tracking-wider">
                <th className="px-4 py-3.5 rounded-l-lg w-10"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4c9f70] focus:ring-[#4c9f70]" /></th>
                <th className="px-3 py-3.5 font-bold text-[#358756]">No.</th>
                <th className="px-3 py-3.5 font-bold text-[#358756]">Product</th>
                <th className="px-3 py-3.5 font-bold text-[#358756]">Created Date</th>
                <th className="px-3 py-3.5 font-bold text-[#358756]">Order</th>
                <th className="px-3 py-3.5 font-bold text-[#358756] rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products?.map((prod, index) => (
                <tr key={prod._id || index} className="group transition-colors border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-4 w-10"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4c9f70] focus:ring-[#4c9f70]" /></td>
                  <td className="px-3 py-4 text-[13px] font-medium text-slate-600">1</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-[38px] h-[38px] rounded border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 p-1">
                        <img
                          src={prod.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.name)}&background=10b981&color=fff&bold=true`}
                          alt={prod.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="font-semibold text-slate-800 text-[13px]">{prod.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[13px] font-semibold text-slate-800">
                    {new Date(prod.createdAt || Date.now()).toLocaleDateString('en-GB').replace(/\//g, '-')}
                  </td>
                  <td className="px-3 py-4 text-[13px] font-semibold text-slate-800">
                    {Math.floor(Math.random() * 50) + 10}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors"><Edit size={16} /></button>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Force minimum mock rows mapped to display fully out exactly like the 8-row screenshot */}
              {(!products || products.length === 0) && [...Array(8)].map((_, i) => (
                <tr key={`mock-${i}`} className="group transition-colors border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-4 w-10"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#4c9f70] focus:ring-[#4c9f70]" /></td>
                  <td className="px-3 py-4 text-[13px] font-medium text-slate-600">1</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-[38px] h-[38px] rounded border border-slate-200 bg-slate-50 animate-pulse flex-shrink-0"></div>
                      <span className="w-40 h-4 bg-slate-100 rounded animate-pulse"></span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[13px] font-semibold text-slate-800">01-01-2025</td>
                  <td className="px-3 py-4 text-[13px] font-semibold text-slate-800">{20 + i * 5}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors"><Edit size={16} /></button>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

    </div>
  );
};

export default Categories;
