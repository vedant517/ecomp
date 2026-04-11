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
  Layers,
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
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: ShoppingCart, label: 'Order Management', path: '/orders' },
      { icon: Users, label: 'Customers', path: '/customers' },
      { icon: Ticket, label: 'Coupon Code', path: '/coupons' },
      { icon: Grid3X3, label: 'Categories', path: '/categories' },
      { icon: Layers, label: 'Subcategories', path: '/subcategories' },
      { icon: Receipt, label: 'Transaction', path: '/transactions' },
      { icon: Bookmark, label: 'Brand', path: '/brands' },
    ],
  },
  {
    title: 'Product',
    items: [
      { icon: PlusCircle, label: 'Add Products', path: '/add-product' },
      { icon: ImageIcon, label: 'Product Media', path: '/media' },
      { icon: List, label: 'Product List', path: '/products' },
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

export default function AdminLayout({ setIsAuthenticated }) {
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
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px' }}>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              if (setIsAuthenticated) setIsAuthenticated(false);
              else window.location.href = '/';
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', width: '100%', cursor: 'pointer',
              border: '1px solid #fecaca', borderRadius: '8px',
              fontSize: '13px', fontWeight: 700, color: '#ef4444',
              background: '#fef2f2', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
          >
            <LogOut size={16} />
            Secure Logout
          </button>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} style={{ color: '#64748b' }} />
            </button>
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: '#4c9f70', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer'
            }}>
              A
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>Admin</span>
            </div>
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