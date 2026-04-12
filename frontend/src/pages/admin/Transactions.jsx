import React, { useState } from 'react';
import {
  Search, Bell, Filter, MoreHorizontal, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight, IndianRupee, RefreshCw, Eye, RotateCcw,
  CheckCircle2, XCircle, Clock, AlertCircle, CreditCard
} from 'lucide-react';
import {
  useGetTransactionsQuery,
  useGetTransactionStatsQuery,
  useRefundTransactionMutation,
} from '../../features/transactions/transactionApi';
import toast from 'react-hot-toast';

/* ── Status styles ── */
const statusConfig = {
  captured:   { bg: '#e8f5ee', color: '#1a6b3c', icon: CheckCircle2, label: 'Success' },
  created:    { bg: '#e3f2fd', color: '#1565c0', icon: Clock, label: 'Pending' },
  failed:     { bg: '#fce8e8', color: '#c0392b', icon: XCircle, label: 'Failed' },
  refunded:   { bg: '#fff3e0', color: '#e65100', icon: RotateCcw, label: 'Refunded' },
  authorized: { bg: '#e8f5ee', color: '#2e7d32', icon: CheckCircle2, label: 'Authorized' },
};

/* ── Stat Card ── */
function StatCard({ title, value, icon: Icon, color, sub, trend, trendUp }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm`} style={{ background: color + '18' }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{title}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

/* ── Detail Modal ── */
function TransactionDetailModal({ transaction, onClose, onRefund }) {
  if (!transaction) return null;
  const sc = statusConfig[transaction.status] || statusConfig.created;
  const StatusIcon = sc.icon;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-slate-900">Transaction Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5"
              style={{ background: sc.bg, color: sc.color }}>
              <StatusIcon size={12} /> {sc.label}
            </span>
          </div>

          {[
            ['Transaction ID', transaction.transactionId],
            ['Razorpay Order', transaction.razorpayOrderId],
            ['Payment ID', transaction.razorpayPaymentId || '—'],
            ['Amount', `₹${transaction.amount?.toLocaleString() || 0}`],
            ['Currency', transaction.currency || 'INR'],
            ['Receipt', transaction.receipt || '—'],
            ['Date', new Date(transaction.createdAt).toLocaleString('en-IN')],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
              <span className="text-xs font-black text-slate-800 font-mono">{value}</span>
            </div>
          ))}

          {transaction.order && (
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Order</span>
              <span className="text-xs font-black text-emerald-600">{transaction.order?.orderId || transaction.order}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
            Close
          </button>
          {transaction.status === 'captured' && (
            <button onClick={() => onRefund(transaction._id)}
              className="flex-1 px-4 py-3 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
              <RotateCcw size={14} /> Initiate Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN TRANSACTION PAGE
══════════════════════════════════════════════ */
export default function Transactions() {
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const itemsPerPage = 10;

  const filters = [
    { label: 'All', value: null },
    { label: 'Success', value: 'captured' },
    { label: 'Pending', value: 'created' },
    { label: 'Failed', value: 'failed' },
    { label: 'Refunded', value: 'refunded' },
  ];

  const { data: txnResponse, isLoading } = useGetTransactionsQuery({
    status: activeFilter,
    page: currentPage,
    limit: itemsPerPage,
  });

  const { data: stats, isLoading: statsLoading } = useGetTransactionStatsQuery();
  const [refundTxn] = useRefundTransactionMutation();

  const transactions = txnResponse?.data || [];
  const totalPages = txnResponse?.pages || 1;

  // Client-side search filter
  const filtered = transactions.filter(t =>
    (t.transactionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.razorpayOrderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.razorpayPaymentId || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefund = async (id) => {
    if (!window.confirm('Are you sure you want to initiate a refund for this transaction?')) return;
    try {
      await refundTxn({ id, reason: 'Admin initiated refund' }).unwrap();
      toast.success('Refund initiated successfully');
      setSelectedTxn(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Refund failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 font-sans text-slate-800 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <CreditCard size={20} className="text-white" />
            </div>
            Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-1 ml-[52px] font-bold uppercase tracking-widest">
            Razorpay Payment Gateway · Real-time Ledger
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[280px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search by ID or Payment..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-500 shadow-sm transition-colors">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Transactions"
          value={statsLoading ? '...' : stats?.total || 0}
          icon={CreditCard}
          color="#6366f1"
          trend="All time"
        />
        <StatCard
          title="Total Revenue"
          value={statsLoading ? '...' : `₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          color="#10b981"
          trend="+12.5%"
          trendUp
        />
        <StatCard
          title="Successful"
          value={statsLoading ? '...' : stats?.captured || 0}
          icon={CheckCircle2}
          color="#22c55e"
        />
        <StatCard
          title="Pending"
          value={statsLoading ? '...' : stats?.pending || 0}
          icon={Clock}
          color="#f59e0b"
        />
        <StatCard
          title="Failed / Refunded"
          value={statsLoading ? '...' : (stats?.failed || 0) + (stats?.refunded || 0)}
          icon={XCircle}
          color="#ef4444"
        />
      </div>

      {/* ── Transaction Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
            {filters.map((f) => (
              <button
                key={f.label}
                onClick={() => { setActiveFilter(f.value); setCurrentPage(1); }}
                className={`py-2 px-5 text-[11px] font-black rounded-lg transition-all ${
                  activeFilter === f.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
              <Filter size={14} />
              <span className="text-[11px] font-bold">Advanced</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors shadow-sm">
              <RefreshCw size={14} />
              <span className="text-[11px] font-bold">Refresh</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[350px]">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                Syncing Razorpay Ledger...
              </span>
            </div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-indigo-500 font-black text-[10px] uppercase tracking-widest">
                    <th className="py-4 px-5 w-12">#</th>
                    <th className="py-4 px-3">Transaction ID</th>
                    <th className="py-4 px-3">Razorpay Order</th>
                    <th className="py-4 px-3 text-center">Amount</th>
                    <th className="py-4 px-3 text-center">Method</th>
                    <th className="py-4 px-3 text-center">Date</th>
                    <th className="py-4 px-3 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-20">
                        <div className="max-w-[200px] mx-auto opacity-30">
                          <CreditCard size={48} className="mx-auto mb-4" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            No transactions found
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1">
                            Transactions will appear here once Razorpay payments are processed
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, i) => {
                      const sc = statusConfig[t.status] || statusConfig.created;
                      const StatusIcon = sc.icon;
                      return (
                        <tr key={t._id} className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                          onClick={() => setSelectedTxn(t)}>
                          <td className="py-4 px-5 text-slate-400 font-bold text-[11px]">
                            {(currentPage - 1) * itemsPerPage + i + 1}
                          </td>
                          <td className="py-4 px-3">
                            <span className="text-[11px] font-black text-indigo-600 font-mono tracking-tighter">
                              {t.transactionId}
                            </span>
                          </td>
                          <td className="py-4 px-3">
                            <span className="text-[11px] font-bold text-slate-600 font-mono">
                              {t.razorpayOrderId?.slice(0, 20)}...
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span className="text-[13px] font-black text-slate-900 tracking-tighter">
                              ₹{t.amount?.toLocaleString() || 0}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2.5 py-1 rounded-full">
                              {t.paymentMethod || 'Razorpay'}
                            </span>
                          </td>
                          <td className="py-4 px-3 text-center text-slate-500 font-bold text-[11px]">
                            {new Date(t.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black py-1 px-3 rounded-full uppercase tracking-wider"
                              style={{ background: sc.bg, color: sc.color }}>
                              <StatusIcon size={10} /> {sc.label}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setSelectedTxn(t); }}>
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {txnResponse?.total > 0 && (
                <div className="flex items-center justify-between p-5 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Page {currentPage} of {totalPages} · {txnResponse?.total || 0} records
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${
                          currentPage === i + 1
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-500'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedTxn && (
        <TransactionDetailModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onRefund={handleRefund}
        />
      )}
    </div>
  );
}
