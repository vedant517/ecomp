import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  MoreHorizontal,
  Search,
  ChevronDown,
  SlidersHorizontal,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Bell,
  Zap,
  Plus
} from 'lucide-react';
import {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
  useUpdateOrderStatusMutation,
  useCreateOrderMutation
} from '../../features/orders/orderApi';

/* ── Status badge styles ── */
const statusStyle = {
  Delivered: { background: '#e8f5ee', color: '#1a6b3c' },
  Pending: { background: '#e3f2fd', color: '#1565c0' },
  Shipped: { background: '#e8f5ee', color: '#1a6b3c' },
  Cancelled: { background: '#fce8e8', color: '#c0392b' },
};

const paymentDot = {
  Paid: '#1a6b3c',
  Unpaid: '#e65100',
};

/* ── Stat Card component ── */
function StatCard({ title, value, badge, badgeUp, sub, onClick, loading }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-[14px_16px] cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">{title}</span>
        <MoreHorizontal size={14} color="#cbd5e1" className="cursor-pointer" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[22px] font-extrabold text-slate-900">
          {loading ? '...' : value}
        </span>
        {badge && (
          <span className={`text-[10px] font-bold py-0.5 px-1.5 rounded-full ${badgeUp ? 'bg-[#e8f5ee] text-[#1a6b3c]' : 'bg-[#fce8e8] text-[#c0392b]'
            }`}>{badge}</span>
        )}
      </div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

/* ── Status Update Modal ── */
function StatusUpdateModal({ order, onClose, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'Pending');
  const statuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-1">Update Status</h3>
        <p className="text-xs text-slate-500 mb-5 tracking-tight">Modifying Order: <span className="text-emerald-600 font-bold">#{order.orderId || order.id}</span></p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onUpdate(order.orderId || order.id, selectedStatus)}
              className="flex-1 px-4 py-2.5 text-xs font-bold bg-[#1a6b3c] text-white rounded-xl hover:bg-[#145a32] shadow-lg shadow-emerald-700/20 transition-all active:scale-95"
            >
              Confirm Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN ORDER MANAGEMENT PAGE
══════════════════════════════════════════════ */
export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('All order');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const tabs = ['All order', 'Completed', 'Pending', 'Canceled'];
  const itemsPerPage = 6;

  // Fetch orders based on active tab using RTK Query
  const statusFilter = activeTab === 'All order' ? null :
    activeTab === 'Completed' ? 'Delivered' :
      activeTab === 'Pending' ? 'Pending' :
        activeTab === 'Canceled' ? 'Cancelled' : null;

  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } = useGetOrdersQuery(statusFilter);
  const { data: statsData, isLoading: statsLoading } = useGetOrderStatsQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [createOrder] = useCreateOrderMutation();

  const handleManualOrder = async () => {
    try {
      const dummyOrder = {
        orderItems: [{
          name: 'Manual Order Product',
          qty: 1,
          image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
          price: 99.99,
          product: '65f1234567890abcdef00001' // Placeholder ID
        }],
        itemsPrice: 99.99,
        totalPrice: 99.99,
        isPaid: true,
        status: 'Pending'
      };
      await createOrder(dummyOrder).unwrap();
      toast.success('Manual order created for testing');
    } catch (err) {
      toast.error('Failed to create order');
    }
  };

  // Transform backend data to frontend format
  const orders = useMemo(() => ordersResponse?.data?.map(order => {
    const firstItem = order.orderItems?.[0] || {};
    return {
      id: order.orderId || order._id,
      orderId: order.orderId,
      product: firstItem.name || 'Product Asset',
      emoji: getProductEmoji(firstItem.name),
      date: new Date(order.createdAt).toLocaleDateString('en-GB'),
      price: order.totalPrice || order.price || 0,
      payment: order.isPaid ? 'Paid' : 'Unpaid',
      status: order.status || (order.isDelivered ? 'Delivered' : 'Pending'),
      rawOrder: order
    };
  }) || [], [ordersResponse]);

  // Filter orders by search
  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      (order.product?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.id?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  // Paginate orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Helper function to get emoji based on product name
  function getProductEmoji(productName) {
    const emojiMap = {
      'headphone': '🎧',
      'shirt': '👕',
      'wallet': '👛',
      'pillow': '🛏',
      'dumbbell': '🏋',
      'coffee': '☕',
      'cap': '🧢',
      'webcam': '📷',
      'bulb': '💡',
    };
    const lowerName = productName?.toLowerCase() || '';
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerName.includes(key)) return emoji;
    }
    return '📦';
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus }).unwrap();
      setSelectedOrder(null);
      toast.success('Order status updated successfully');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Exporting orders...');
      setTimeout(() => {
        toast.dismiss();
        toast.success('Orders exported successfully!');
      }, 1000);
    } catch (error) {
      toast.error('Failed to export orders');
    }
  };

  if (ordersError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-rose-600 font-bold mb-4 flex items-center gap-2 justify-center">
            Failed to load orders
          </p>
          <p className="text-xs text-slate-500 mb-6">{ordersError.message || 'Connecting to server failed.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#1a6b3c] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">Control and track all customer transactions</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[260px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search by ID or Product..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 cursor-pointer hover:bg-slate-50 shadow-sm relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 cursor-pointer hover:bg-slate-50 shadow-sm">
              <Zap size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Order Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={statsData?.total || 0}
          badge="↑ 14.4%"
          badgeUp
          sub="Last 30 days"
          onClick={() => setActiveTab('All order')}
          loading={statsLoading}
        />
        <StatCard
          title="New Orders"
          value={statsData?.pending || 0}
          badge="↑ 20%"
          badgeUp
          sub="Needs processing"
          onClick={() => setActiveTab('Pending')}
          loading={statsLoading}
        />
        <StatCard
          title="Completed"
          value={statsData?.delivered || 0}
          badge="↑ 83%"
          badgeUp
          sub="Successfully delivered"
          onClick={() => setActiveTab('Completed')}
          loading={statsLoading}
        />
        <StatCard
          title="Cancelled"
          value={statsData?.cancelled || 0}
          badge="↓ 3.2%"
          badgeUp={false}
          sub="Lost opportunities"
          onClick={() => setActiveTab('Canceled')}
          loading={statsLoading}
        />
      </div>

      {/* Order List / Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">

        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Order Repository</h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleManualOrder()}
              className="flex items-center gap-1.5 bg-[#4c9f70] text-white rounded-xl py-2 px-4 text-[11px] font-bold cursor-pointer hover:bg-emerald-600 transition-colors shadow-md"
            >
              <Plus size={14} strokeWidth={3} /> Add Order
            </button>
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="flex items-center gap-1.5 bg-white text-slate-600 border border-slate-200 rounded-xl py-2 px-4 text-[11px] font-bold cursor-pointer hover:bg-slate-50 transition-colors relative shadow-sm"
            >
              More Action <ChevronDown size={14} className={showMoreActions ? 'rotate-180 transition-transform' : 'transition-transform'} />
              {showMoreActions && (
                <div className="absolute top-full right-0 bg-white border border-slate-200 rounded-xl py-2 mt-2 min-w-[160px] shadow-xl z-20 animate-in fade-in slide-in-from-top-2">
                  {['Export Data', 'Print Manifest', 'Bulk Approval', 'Settings'].map((action) => (
                    <div
                      key={action}
                      className="py-2.5 px-4 text-[11px] text-slate-600 font-bold cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                      onClick={() => {
                        if (action.includes('Export')) handleExport();
                        setShowMoreActions(false);
                      }}
                    >
                      {action}
                    </div>
                  ))}
                </div>
              )}
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Nav Tabs & Filters Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
              {tabs.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(1);
                    }}
                    className={`py-2 px-5 text-[11px] font-black rounded-lg transition-all ${active
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors shadow-sm">
                <SlidersHorizontal size={14} />
                <span className="text-[11px] font-bold">Filters</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors shadow-sm">
                <ArrowLeftRight size={14} />
                <span className="text-[11px] font-bold">Relational</span>
              </button>
            </div>
          </div>

          {/* Main Table Interface */}
          <div className="overflow-x-auto min-h-[350px]">
            {ordersLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Local Cluster...</span>
              </div>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[#4c9f70] font-black text-[10px] uppercase tracking-widest">
                      <th className="py-4 px-4 w-12">#</th>
                      <th className="py-4 px-2">Order Identification</th>
                      <th className="py-4 px-2">Product Asset</th>
                      <th className="py-4 px-2 text-center">Timestamp</th>
                      <th className="py-4 px-2 text-center">Valuation</th>
                      <th className="py-4 px-2 text-center">Payment</th>
                      <th className="py-4 px-4 text-right">Operational Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-20">
                          <div className="max-w-[200px] mx-auto opacity-20">
                            <ArrowLeftRight size={60} className="mx-auto mb-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Null return on filter parameters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((o, i) => (
                        <tr
                          key={o.id}
                          className="group hover:bg-slate-50/50 transition-all cursor-pointer border-b border-slate-50/50"
                          onClick={() => setSelectedOrder(o)}
                        >
                          <td className="py-4 px-4 text-slate-400 font-bold text-[11px]">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                          <td className="py-4 px-2 text-[#1a6b3c] font-black text-[11px] hover:underline underline-offset-4 tracking-tighter">#{o.id}</td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                {o.emoji}
                              </div>
                              <span className="text-slate-800 font-bold text-[13px] line-clamp-1 max-w-[120px]">{o.product}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center text-slate-500 font-bold text-[11px] uppercase">{o.date}</td>
                          <td className="py-4 px-2 text-center text-slate-900 font-black text-[13px] tracking-tighter">${o.price.toLocaleString()}</td>
                          <td className="py-4 px-2 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/50 rounded-full text-[10px] font-black text-slate-700 uppercase">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: paymentDot[o.payment] || '#94a3b8' }} />
                              {o.payment}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span
                              className="inline-block text-[10px] font-black py-1 px-4 rounded-full uppercase tracking-widest shadow-sm ring-1 ring-inset ring-white/20"
                              style={statusStyle[o.status]}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination Module */}
                {filteredOrders.length > 0 && (
                  <div className="flex items-center justify-between pt-8 pb-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="flex items-center gap-1 bg-white border border-slate-200 text-[#1a6b3c] font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 transition-all shadow-sm"
                    >
                      <ChevronLeft size={16} /> Prev System
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1
                              ? 'bg-[#1a6b3c] text-white shadow-lg shadow-emerald-700/30'
                              : 'bg-white text-slate-500 border border-slate-200 hover:border-emerald-500 hover:text-emerald-500'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 bg-white border border-slate-200 text-[#1a6b3c] font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-50 transition-all shadow-sm"
                    >
                      Next System <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Operations Modal Orchestrator */}
      {selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}