import React from 'react';
import { MoreVertical, ArrowUpRight, Search, ChevronRight, Plus, Filter, PackageOpen, ShoppingCart, BarChart2, TrendingUp, Users } from 'lucide-react';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';

/* ── Inline style helpers ── */
const card = {
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 1px 4px rgba(0,0,0,.05)',
  padding: '18px',
};
const labelStyle = { fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' };
const bigNum = { fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 };

const EmptyState = ({ icon: Icon, message }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', gap: '10px' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} color="#94a3b8" />
    </div>
    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textAlign: 'center', margin: 0 }}>{message}</p>
  </div>
);

/* ── Stat Card (shows 0 / empty when no data) ── */
const StatCard = ({ title, value, sub, extra }) => (
  <div style={card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={labelStyle}>{title}</div>
        <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>Last 7 days</div>
      </div>
      <MoreVertical size={15} color="#cbd5e1" style={{ cursor: 'pointer' }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
      <span style={bigNum}>{value}</span>
    </div>
    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>{sub}</div>
    {extra}
    <div style={{ textAlign: 'right', marginTop: '10px' }}>
      <button style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', border: '1px solid #6366f1', borderRadius: '6px', padding: '3px 10px', background: 'none', cursor: 'pointer' }}>
        Details
      </button>
    </div>
  </div>
);

export default function Dashboard() {
  /* No real data yet — empty arrays */
  const transactions = [];
  const bestSelling  = [];
  const topProducts  = [];
  const quickAdd     = [];
  const chartData    = [];    // empty chart

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>

      {/* ═══════ ROW 1 — STAT CARDS ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <StatCard
          title="Total Sales"
          value="$0"
          sub="No sales data yet"
        />
        <StatCard
          title="Total Orders"
          value="0"
          sub="No orders placed yet"
        />
        <StatCard
          title="Pending & Canceled"
          value="—"
          sub="No pending or canceled orders"
          extra={
            <div style={{ display: 'flex', gap: '24px', marginTop: '6px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Pending</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>0</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Canceled</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>0</div>
              </div>
            </div>
          }
        />
      </div>

      {/* ═══════ ROW 2 — CHARTS ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Area Chart */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Report for this week</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button style={{ fontSize: '10px', fontWeight: 700, background: '#fff', color: '#10b981', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.06)' }}>This week</button>
              <button style={{ fontSize: '10px', fontWeight: 700, background: 'none', color: '#94a3b8', border: 'none', padding: '4px 10px', cursor: 'pointer' }}>Last week</button>
            </div>
          </div>

          {/* Mini stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginBottom: '14px' }}>
            {[
              { val: '0',  lab: 'Customers',      accent: '#10b981' },
              { val: '0',  lab: 'Total Products',  accent: '#e2e8f0' },
              { val: '0',  lab: 'Stock Products',  accent: '#e2e8f0' },
              { val: '0',  lab: 'Out of Stock',    accent: '#ef4444' },
              { val: '$0', lab: 'Revenue',         accent: '#e2e8f0' },
            ].map(s => (
              <div key={s.lab} style={{ borderBottom: `2px solid ${s.accent}`, paddingBottom: '6px' }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>{s.val}</div>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.lab}</div>
              </div>
            ))}
          </div>

          {/* Empty chart placeholder */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: '10px', border: '1.5px dashed #e2e8f0' }}>
            <div style={{ textAlign: 'center' }}>
              <BarChart2 size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, margin: 0 }}>No sales data for this week</p>
              <p style={{ fontSize: '10px', color: '#cbd5e1', margin: '4px 0 0' }}>Data will appear once orders are placed</p>
            </div>
          </div>
        </div>

        {/* Users in last 30 minutes + Country */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Users in last 30 minutes</span>
            <MoreVertical size={14} color="#cbd5e1" />
          </div>
          <div style={{ fontWeight: 800, fontSize: '28px', color: '#0f172a', marginBottom: '12px' }}>0</div>

          <div style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Users per minute</div>
          <div style={{ height: '48px', marginBottom: '16px', background: '#fafafa', borderRadius: '8px', border: '1.5px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 600 }}>No activity</span>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Sales by Country</span>
            <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '10px' }}>Sales</span>
          </div>

          <EmptyState icon={TrendingUp} message="No country data yet" />

          <button style={{ width: '100%', marginTop: '12px', padding: '8px', border: '1px solid #10b981', borderRadius: '8px', background: 'none', color: '#10b981', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
            View Insight
          </button>
        </div>
      </div>

      {/* ═══════ ROW 3 — TABLES + WIDGETS ═══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

        {/* Left column — Transaction + Best Selling */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Transaction Table */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Transaction</span>
              <button style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                <Filter size={12} /> Filter
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {['No', 'Id Customer', 'Order Date', 'Status', 'Amount'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: h === 'Amount' ? 'right' : 'left', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
            </table>
            {transactions.length === 0
              ? <EmptyState icon={ShoppingCart} message="No transactions yet" />
              : null
            }
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '5px 20px', background: 'none', cursor: 'pointer' }}>Details</button>
            </div>
          </div>

          {/* Best Selling */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Best selling product</span>
              <button style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '7px', padding: '5px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                <Filter size={12} /> Filter
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f0fdf4' }}>
                  {['Product', 'Total Order', 'Status', 'Price'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Price' ? 'right' : 'left', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
            </table>
            {bestSelling.length === 0
              ? <EmptyState icon={PackageOpen} message="No products added yet" />
              : null
            }
          </div>
        </div>

        {/* Right column — Top Products + Add New Product */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Top Products */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Top Products</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#6366f1', cursor: 'pointer' }}>All product</span>
            </div>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search"
                style={{ width: '100%', padding: '7px 10px 7px 30px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {topProducts.length === 0
              ? <EmptyState icon={PackageOpen} message="No products yet" />
              : null
            }
          </div>

          {/* Add New Product */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Add New Product</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Plus size={13} color="#10b981" />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981' }}>Add New</span>
              </div>
            </div>

            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Categories</div>
            {['🔌 Electronic', '👕 Fashion', '🏠 Home'].map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', border: '1px solid #f1f5f9', borderRadius: '10px', marginBottom: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                <span>{c}</span>
                <ChevronRight size={14} color="#cbd5e1" />
              </div>
            ))}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>See more</span>
            </div>

            <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Product</div>
            {quickAdd.length === 0
              ? <EmptyState icon={PackageOpen} message="No products to show" />
              : null
            }
          </div>
        </div>
      </div>
    </div>
  );
}
