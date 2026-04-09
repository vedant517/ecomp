import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Ticket,
  Grid3X3,
  Receipt,
  Bookmark,
  PlusCircle,
  Image as ImageIcon,
  List,
  Star,
  ShieldCheck,
  Lock,
  Search,
  Bell,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  Moon
} from 'lucide-react';

const navGroups = [
  {
    title: 'Main menu',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: ShoppingCart, label: 'Order Management', path: '/orders' },
      { icon: Users, label: 'Customers', path: '/customers' },
      { icon: Ticket, label: 'Coupon Code', path: '/coupons' },
      { icon: Grid3X3, label: 'Categories', path: '/categories' },
      { icon: Receipt, label: 'Transaction', path: '/transactions' },
      { icon: Bookmark, label: 'Brand', path: '/brands' },
    ],
  },
  {
    title: 'Product',
    items: [
      { icon: PlusCircle, label: 'Add Products', path: '/add-product' },
      { icon: ImageIcon, label: 'Product Media', path: '/media' },
      { icon: List, label: 'Product List', path: '/product-list' },
      { icon: Star, label: 'Product Reviews', path: '/reviews' },
    ],
  },
  {
    title: 'Admin',
    items: [
      { icon: ShieldCheck, label: 'Admin role', path: '/roles' },
      { icon: Lock, label: 'Control Authority', path: '/auth' },
    ],
  },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f8fafc' }}>

      {/* ─── SIDEBAR ─── */}
      <aside style={{
        width: '240px',
        minWidth: '240px',
        height: '100vh',
        background: '#fff',
        borderRight: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg,#10b981,#059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0
            }}>D</div>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.5px', color: '#0f172a' }}>
              DEALP<span style={{ color: '#10b981' }}>◉</span>RT
            </span>
          </div>
        </div>

        {/* Nav Groups */}
        <nav style={{ flex: 1, padding: '12px 12px', overflow: 'auto' }}>
          {navGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                color: '#94a3b8', textTransform: 'uppercase',
                padding: '0 8px', marginBottom: '6px'
              }}>{group.title}</div>

              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', borderRadius: '8px', marginBottom: '2px',
                      textDecoration: 'none', fontSize: '13px', fontWeight: 500,
                      transition: 'all 0.15s',
                      background: isActive ? '#10b981' : 'transparent',
                      color: isActive ? '#fff' : '#475569',
                    }}
                  >
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive && <ChevronRight size={14} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Profile Footer */}
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '8px' }}>
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80"
              alt="Admin"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', flexShrink: 0 }}
            />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dealport</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>mark@thedesigner.com</div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
              <LogOut size={15} />
            </button>
          </div>

          <Link
            to="#"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
              border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none',
              fontSize: '12px', fontWeight: 700, color: '#334155',
              background: '#fafafa'
            }}
          >
            <Grid3X3 size={13} style={{ color: '#10b981' }} />
            <span style={{ flex: 1 }}>Your Shop</span>
            <ExternalLink size={12} style={{ color: '#94a3b8' }} />
          </Link>
        </div>
      </aside>

      {/* ─── RIGHT COLUMN ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top Navbar */}
        <header style={{
          height: '60px', flexShrink: 0,
          background: '#fff', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: '16px'
        }}>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a', marginRight: '8px', whiteSpace: 'nowrap' }}>Dashboard</span>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search data, users, or reports"
              style={{
                width: '100%', padding: '8px 12px 8px 36px',
                background: '#f8fafc', border: '1px solid #f1f5f9',
                borderRadius: '20px', fontSize: '12px', color: '#334155',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px' }}>
              <Bell size={18} />
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '7px', height: '7px', background: '#ef4444',
                borderRadius: '50%', border: '1.5px solid #fff'
              }} />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px' }}>
              <Settings size={18} />
            </button>
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&q=80"
              alt="Profile"
              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '2px solid #e2e8f0' }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
