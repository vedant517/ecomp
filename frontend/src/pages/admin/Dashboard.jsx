import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Bell, Sun, MoreVertical, ChevronRight,
  Filter, Plus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { fetchProducts } from '../../features/products/productSlice';
import { fetchCategories } from '../../features/products/categorySlice';
import { useGetOrdersQuery, useGetOrderStatsQuery } from '../../features/orders/orderApi';

const areaData = [
  { name: 'Sun', value: 0 },
  { name: 'Mon', value: 0 },
  { name: 'Tue', value: 0 },
  { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 },
  { name: 'Fri', value: 0 },
  { name: 'Sat', value: 0 },
];

const barData = Array.from({ length: 30 }, () => ({ value: 0 }));

const Dashboard = () => {
  const dispatch = useDispatch();
  const { data: statsData, isLoading: statsLoading } = useGetOrderStatsQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery();

  const { items: products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Dynamic calculations from Redux stores
  const totalProducts = products?.length || 0;
  const stockProducts = products?.filter(p => p.stock > 0).length || 0;
  const outOfStockProducts = totalProducts - stockProducts;

  // Process order data for the chart
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }).reverse();

  const dynamicAreaData = last7Days.map(day => {
    const dayOrders = (ordersData?.data || []).filter(o => {
      if (!o?.createdAt) return false;
      const orderDate = new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      return orderDate === day;
    });
    const total = dayOrders.reduce((acc, o) => acc + (o.totalPrice || o.price || 0), 0);
    return { name: day, value: total / 1000 }; // Convert to 'k' for the chart scale
  });

  const dynamicBarData = Array.from({ length: 30 }, (_, i) => {
    // Just a placeholder for "users per minute" to make it look alive
    const val = ordersData?.data?.length > 0 ? Math.floor(Math.random() * 50) + 10 : 0;
    return { value: val };
  });

  // Extract real products for mapping
  const displayProducts = products || [];

  // Extract real categories mapped directly from Redux
  const displayCategories = categories || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 font-sans text-slate-800">

      {/* ── Header ── */}
      <div className="flex justify-between items-center mb-10 w-full px-2">
        <div>
          <h1 className="text-[26px] font-bold text-[#1f2937] tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">Welcome back to your store overview</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative p-2 hover:bg-white hover:shadow-sm rounded-full">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-[8px] h-[8px] bg-rose-500 border-2 border-[#f8fafc] rounded-full"></span>
            </button>
            <div className="w-[46px] h-[26px] bg-emerald-100 rounded-full flex items-center px-1 cursor-pointer hover:shadow-sm transition-all shadow-inner">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Sun size={12} className="text-[#4c9f70]" strokeWidth={3} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold text-slate-800 leading-none">Admin</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Verified</p>
            </div>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4c9f70] to-[#3a895c] flex items-center justify-center flex-shrink-0 cursor-pointer text-white font-bold text-lg shadow-md ring-2 ring-white transition-transform hover:scale-105">
              A
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 1: 3 Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative">
          <button className="absolute top-5 right-5 text-slate-400"><MoreVertical size={16} /></button>
          <h3 className="text-[13px] font-bold text-slate-800">Total Sales</h3>
          <p className="text-[11px] text-slate-400 mt-1">Overall Revenue</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-800">
              ${statsLoading ? '...' : (ordersData?.data?.reduce((acc, o) => acc + (o.price || 0), 0) || 0).toLocaleString()}
            </span>
            <div className="flex items-center text-[11px] font-bold text-emerald-500 mb-1">
              <span className="text-slate-800 mr-1">Revenue</span> +12.5%
            </div>
          </div>
          <div className="mt-6 flex justify-between items-end">
            <p className="text-[11px] text-slate-400">Total completed transactions</p>
            <button className="px-4 py-1.5 border border-blue-200 text-blue-500 text-[11px] font-semibold rounded-full hover:bg-blue-50 transition-colors">Details</button>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative">
          <button className="absolute top-5 right-5 text-slate-400"><MoreVertical size={16} /></button>
          <h3 className="text-[13px] font-bold text-slate-800">Total Orders</h3>
          <p className="text-[11px] text-slate-400 mt-1">Lifetime Activity</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-800">{statsLoading ? '...' : statsData?.total || 0}</span>
            <div className="flex items-center text-[11px] font-bold text-emerald-500 mb-1">
              <span className="text-slate-800 mr-1">order</span> +{statsData?.pending || 0} new
            </div>
          </div>
          <div className="mt-6 flex justify-between items-end">
            <p className="text-[11px] text-slate-400">Total processed orders</p>
            <button className="px-4 py-1.5 border border-blue-200 text-blue-500 text-[11px] font-semibold rounded-full hover:bg-blue-50 transition-colors">Details</button>
          </div>
        </div>

        {/* Pending & Canceled */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative flex flex-col justify-between">
          <div>
            <button className="absolute top-5 right-5 text-slate-400"><MoreVertical size={16} /></button>
            <h3 className="text-[13px] font-bold text-slate-800">Pending & Canceled</h3>
            <p className="text-[11px] text-slate-400 mt-1">Direct attention items</p>
            <div className="mt-5 flex items-center justify-between pr-8">
              <div>
                <p className="text-[11px] text-slate-600 font-semibold">Pending</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-800">{statsLoading ? '...' : statsData?.pending || 0}</span>
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">Need processing</span>
                </div>
              </div>
              <div className="h-10 w-[1px] bg-slate-200"></div>
              <div>
                <p className="text-[11px] text-slate-600 font-semibold">Canceled</p>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-2xl font-bold text-slate-800">{statsLoading ? '...' : statsData?.cancelled || 0}</span>
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">Lost revenue</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-1.5 border border-blue-200 text-blue-500 text-[11px] font-semibold rounded-full hover:bg-blue-50 transition-colors">Details</button>
          </div>
        </div>
      </div>

      {/* ── ROW 2: Report Chart & Users ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* Report for this week */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6 z-10 w-full relative">
            <h3 className="text-[14px] font-black text-slate-800">Report for this week</h3>
            <div className="flex items-center gap-4">
              <div className="flex rounded-full border border-green-100 bg-white p-0.5">
                <button className="px-4 py-1 text-[11px] font-bold text-[#4c9f70] rounded-full bg-emerald-50 shadow-sm">This week</button>
                <button className="px-4 py-1 text-[11px] font-bold text-slate-400 rounded-full hover:border hover:border-transparent">Last week</button>
              </div>
              <button className="text-slate-400"><MoreVertical size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-2 z-10 px-1">
            {[
              { val: '124', name: 'Customers', active: true },
              { val: totalProducts.toString(), name: 'Total Products' },
              { val: stockProducts.toString(), name: 'Stock Products' },
              { val: outOfStockProducts.toString(), name: 'Out of Stock' },
              { val: `$${(ordersData?.data?.reduce((acc, o) => acc + (o.totalPrice || o.price || 0), 0) || 0).toLocaleString()}`, name: 'Revenue' }
            ].map((stat, i) => (
              <div key={i} className={`pb-3 border-b-2 transition-all ${stat.active ? 'border-[#4c9f70] bg-emerald-50/30' : 'border-slate-100'}`}>
                <div className="px-2">
                  <div className="text-[22px] font-bold text-slate-800 tracking-tight">{stat.val}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{stat.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 mt-6 relative h-[250px] w-[105%] -ml-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicAreaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4c9f70" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4c9f70" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => `${v}k`} />
                <Tooltip
                  cursor={{ stroke: '#4c9f70', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#aee0b9] text-[#1f2937] text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md relative mt-[-20px] text-center pointer-events-none">
                          Thursday<br />{payload[0].value}k
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#aee0b9] rotate-45"></div>
                        </div>
                      )
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#4c9f70" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users & Sales by Country */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative">
            <button className="absolute top-5 right-5 text-slate-400"><MoreVertical size={16} /></button>
            <h3 className="text-[12px] font-bold text-blue-500 mb-1">Users in last 30 minutes</h3>
            <div className="text-3xl font-bold text-slate-800">{ordersData?.data?.length || 0}</div>
            <p className="text-[10px] text-slate-400 mt-3">Active orders activity</p>
            <div className="h-[60px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dynamicBarData}>
                  <Bar dataKey="value" fill="#4c9f70" radius={[2, 2, 0, 0]} barSize={6} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-[13px] font-bold text-slate-800">Sales by Country</h3>
              <span className="text-[11px] font-bold text-slate-800">Sales</span>
            </div>

            <div className="space-y-4 relative z-10 w-full h-full flex flex-col justify-center">
              {[]?.length > 0 ? [].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-sm">{item.flag}</div>
                    <div>
                      <div className="text-[12px] font-bold text-slate-800">{item.v}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{item.c}</div>
                    </div>
                  </div>
                  <div className="w-[80px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-indigo-500' : 'bg-indigo-500'}`} style={{ width: `${item.val}%` }}></div>
                  </div>
                  <div className={`text-[10px] font-bold ${item.p ? 'text-emerald-500' : 'text-red-500'}`}>{item.t}</div>
                </div>
              )) : (
                <div className="text-center text-slate-400 text-[11px] font-medium pt-8 pb-4">No global sales distribution data available.</div>
              )}
            </div>

            <button className="w-full mt-6 py-2 border border-blue-200 text-blue-500 font-semibold text-[11px] rounded-full hover:bg-blue-50 transition-colors relative z-10">
              View Insight
            </button>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Transaction & Top Products ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* Transaction */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[14px] font-bold text-slate-800">Transaction</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4c9f70] text-white text-[11px] font-medium rounded-lg">
              Filter <Filter size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-[11px] text-slate-400 border-b border-white">
                  <th className="pb-3 font-normal px-2">No</th>
                  <th className="pb-3 font-normal">Id Customer</th>
                  <th className="pb-3 font-normal">Order Date</th>
                  <th className="pb-3 font-normal">Status</th>
                  <th className="pb-3 font-normal text-right px-2">Amount</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold text-slate-800">
                {ordersLoading ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400 font-normal">Loading transactions...</td></tr>
                ) : ordersData?.data?.length > 0 ? ordersData.data.slice(0, 5).map((row, i) => (
                  <tr key={row._id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-normal text-slate-600 px-2">{i + 1}.</td>
                    <td className="py-4 font-semibold">{row.orderId}</td>
                    <td className="py-4 font-normal text-slate-500">{new Date(row.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-[11px] font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.status === 'Delivered' ? 'bg-emerald-500' : 
                          row.status === 'Cancelled' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}></span>
                        {row.status}
                      </div>
                    </td>
                    <td className="py-4 text-right px-2 font-semibold">${row.price?.toFixed(2)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400 font-normal">No recent transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-auto flex justify-end pt-4">
            <button className="px-5 py-1.5 border border-blue-200 text-blue-500 text-[11px] font-semibold rounded-full hover:bg-blue-50 transition-colors">Details</button>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[13px] font-bold text-slate-800">Top Products</h3>
            <span className="text-[10px] text-blue-500 cursor-pointer hover:underline font-semibold">All product</span>
          </div>
          <div className="relative mb-5 w-[140px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input type="text" placeholder="Search" className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-md bg-slate-50 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>

          <div className="space-y-4">
            {displayProducts.slice(0, 4).map((p, i) => (
              <div key={p._id || i} className="flex justify-between items-center gap-1 overflow-hidden">
                <div className="flex items-center gap-3 w-48">
                  <div className="w-9 h-9 rounded-md border border-slate-100 p-0.5 overflow-hidden flex-shrink-0 bg-slate-50">
                    <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-slate-800 truncate">{p.name}</div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5 font-medium">item: {p._id ? `#${p._id.substring(0, 8)}` : (p.sku || '#FX2-4567')}</div>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-slate-800 flex-shrink-0">${p.price}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── ROW 4: Best Selling & Add New Product ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Best selling product */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[14px] font-bold text-slate-800">Best selling product</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#4c9f70] text-white text-[11px] font-medium rounded-lg">
              Filter <Filter size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="text-[10px] text-[#4c9f70] bg-[#edf7ee]">
                  <th className="py-3 px-4 font-bold rounded-l-lg tracking-widest w-1/2">PRODUCT</th>
                  <th className="py-3 px-4 font-bold tracking-widest">TOTAL ORDER</th>
                  <th className="py-3 px-4 font-bold tracking-widest">STATUS</th>
                  <th className="py-3 px-4 font-bold rounded-r-lg tracking-widest text-right w-24">PRICE</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold text-slate-800">
                {displayProducts.slice(0, 4).map((p, i) => {
                  const InStock = p.stock > 0 || String(p.stock).toLowerCase() === 'true' || p.stock === true;
                  return (
                    <tr key={p._id || i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-slate-100 bg-slate-50 overflow-hidden flex-shrink-0 p-0.5">
                          <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <span className="text-[11px] max-w-[120px] truncate">{p.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-normal text-slate-600">{p.order || 0}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${InStock ? 'bg-[#4c9f70]' : 'bg-red-500'}`}></span>
                          <span className={InStock ? 'text-[#4c9f70]' : 'text-red-500'}>{InStock ? 'Stock' : 'Stock out'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">${p.price}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-auto flex justify-end pt-4">
            <button className="px-5 py-1.5 border border-blue-200 text-blue-500 text-[11px] font-semibold rounded-full hover:bg-blue-50 transition-colors">Details</button>
          </div>
        </div>

        {/* Add New Product (Categories & Product setup) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[13px] font-bold text-slate-800">Add New Product</h3>
              <button className="text-[11px] text-blue-500 flex items-center gap-1 font-semibold hover:underline bg-transparent">
                <div className="w-3.5 h-3.5 rounded border border-blue-500 flex items-center justify-center">
                  <Plus size={10} strokeWidth={3} />
                </div>
                Add New
              </button>
            </div>

            <p className="text-[11px] font-medium text-slate-500 mb-3">Categories</p>
            <div className="space-y-2">
              {displayCategories.slice(0, 3).map((c, i) => (
                <div key={c._id || i} className="flex justify-between items-center border border-slate-100 rounded-xl p-2 hover:border-slate-300 cursor-pointer transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center p-1.5">
                      <img src={c.image && (c.image.startsWith('http') || c.image.startsWith('data:')) ? c.image : 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'} alt={c.name} className="w-full h-full object-contain mix-blend-multiply opacity-70" />
                    </div>
                    <span className="text-[12px] font-semibold text-slate-800 truncate max-w-[100px]">{c.name}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 mr-1" />
                </div>
              ))}
              <div className="text-center mt-3 mb-1">
                <button className="text-[10px] text-blue-500 font-semibold hover:underline">See more</button>
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-500 mb-3 mt-4">Product</p>
            <div className="space-y-3">
              {displayProducts.slice(0, 3).map((p, i) => (
                <div key={p._id || i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                      <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=10b981&color=fff&bold=true`} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 truncate max-w-[90px]">{p.name}</div>
                      <div className="text-[10px] font-bold text-[#4c9f70]">${p.price}</div>
                    </div>
                  </div>
                  <button className="flex items-center justify-center gap-0.5 px-2.5 py-1 rounded bg-[#4c9f70] text-white hover:bg-emerald-600 transition-colors text-[10px] font-semibold">
                    <div className="w-3 h-3 rounded-full border border-white flex items-center justify-center mix-blend-screen opacity-90 mr-0.5">
                      <Plus size={8} strokeWidth={3} />
                    </div>
                    Add
                  </button>
                </div>
              ))}
              <div className="text-center pt-3 pb-1">
                <button className="text-[10px] text-blue-500 font-semibold hover:underline">See more</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
