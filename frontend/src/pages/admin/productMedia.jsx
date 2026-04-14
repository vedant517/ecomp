import React, { useState } from 'react';
import {
  Search, Filter, Tag, ChevronRight,
  ArrowLeft, ArrowRight, Flame, Star,
  BadgePercent, Eye, Edit, Trash2, Plus
} from 'lucide-react';

// ── Static offer product data ──────────────────────────────────────────────
const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Beauty'];

const OFFER_PRODUCTS = [
  {
    _id: 'p1',
    name: 'Wireless Noise-Cancelling Headphones',
    category: 'Electronics',
    originalPrice: 4999,
    discountPercent: 35,
    rating: 4.7,
    reviews: 1284,
    stock: 42,
    image: 'https://ui-avatars.com/api/?name=WH&background=10b981&color=fff&bold=true',
    tag: 'HOT',
    slug: 'wireless-nc-headphones',
    updatedAt: '2026-04-10T10:00:00Z',
  },
  {
    _id: 'p2',
    name: 'Slim Fit Cotton Chinos',
    category: 'Fashion',
    originalPrice: 1299,
    discountPercent: 50,
    rating: 4.3,
    reviews: 892,
    stock: 130,
    image: 'https://ui-avatars.com/api/?name=SC&background=6366f1&color=fff&bold=true',
    tag: 'SALE',
    slug: 'slim-fit-cotton-chinos',
    updatedAt: '2026-04-09T08:30:00Z',
  },
  {
    _id: 'p3',
    name: 'Non-Stick Cookware Set (5-piece)',
    category: 'Home & Kitchen',
    originalPrice: 3499,
    discountPercent: 40,
    rating: 4.5,
    reviews: 567,
    stock: 25,
    image: 'https://ui-avatars.com/api/?name=CW&background=f59e0b&color=fff&bold=true',
    tag: 'NEW',
    slug: 'non-stick-cookware-set',
    updatedAt: '2026-04-11T14:00:00Z',
  },
  {
    _id: 'p4',
    name: 'Resistance Band Training Kit',
    category: 'Sports',
    originalPrice: 899,
    discountPercent: 30,
    rating: 4.6,
    reviews: 430,
    stock: 200,
    image: 'https://ui-avatars.com/api/?name=RB&background=ef4444&color=fff&bold=true',
    tag: 'HOT',
    slug: 'resistance-band-kit',
    updatedAt: '2026-04-08T11:00:00Z',
  },
  {
    _id: 'p5',
    name: 'Vitamin C Brightening Serum',
    category: 'Beauty',
    originalPrice: 799,
    discountPercent: 25,
    rating: 4.8,
    reviews: 2100,
    stock: 88,
    image: 'https://ui-avatars.com/api/?name=VS&background=ec4899&color=fff&bold=true',
    tag: 'TOP',
    slug: 'vit-c-brightening-serum',
    updatedAt: '2026-04-12T09:00:00Z',
  },
  {
    _id: 'p6',
    name: 'Smart LED TV 43"',
    category: 'Electronics',
    originalPrice: 29999,
    discountPercent: 20,
    rating: 4.4,
    reviews: 765,
    stock: 15,
    image: 'https://ui-avatars.com/api/?name=TV&background=0ea5e9&color=fff&bold=true',
    tag: 'DEAL',
    slug: 'smart-led-tv-43',
    updatedAt: '2026-04-07T16:00:00Z',
  },
  
  
];

const TAG_COLORS = {
  HOT:  { bg: '#fff1f2', color: '#e11d48' },
  SALE: { bg: '#fffbeb', color: '#d97706' },
  NEW:  { bg: '#f0fdf4', color: '#16a34a' },
  TOP:  { bg: '#fdf4ff', color: '#9333ea' },
  DEAL: { bg: '#eff6ff', color: '#2563eb' },
};

const discountedPrice = (original, pct) => Math.round(original * (1 - pct / 100));
const fmt = (n) => n.toLocaleString('en-IN');

const ProductMedia = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('All Products');
  const [search, setSearch] = useState('');

  const tabs = [
    { name: 'All Products', count: OFFER_PRODUCTS.length },
    { name: 'Flash Deals', count: OFFER_PRODUCTS.filter(p => p.discountPercent >= 40).length },
    { name: 'Top Rated', count: OFFER_PRODUCTS.filter(p => p.rating >= 4.5).length },
    { name: 'Low Stock' },
  ];

  const filtered = OFFER_PRODUCTS.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'Flash Deals') return matchCat && matchSearch && p.discountPercent >= 40;
    if (activeTab === 'Top Rated')  return matchCat && matchSearch && p.rating >= 4.5;
    if (activeTab === 'Low Stock')  return matchCat && matchSearch && p.stock <= 30;
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>

      {/* ── Offers Spotlight ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#fff1f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} color="#e11d48" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: 0 }}>Offer Spotlight</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: '#4c9f70', color: 'white',
              border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={10} strokeWidth={3} />
              </div>
              Add Offer
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', background: 'white', color: '#374151',
              border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}>
              Manage <BadgePercent size={14} color="#94a3b8" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 700,
                borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s',
                border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
                background: activeCategory === cat ? '#4c9f70' : 'white',
                color: activeCategory === cat ? 'white' : '#64748b',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '12px',
            paddingRight: '48px',
          }}>
            {OFFER_PRODUCTS.filter(p => activeCategory === 'All' || p.category === activeCategory).slice(0, 8).map((prod, idx) => {
              const tagStyle = TAG_COLORS[prod.tag] || TAG_COLORS.DEAL;
              return (
                <div
                  key={prod._id}
                  style={{
                    background: 'white', borderRadius: '14px',
                    border: '1px solid #f1f5f9', cursor: 'pointer',
                    transition: 'all 0.15s', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Image area */}
                  <div style={{ position: 'relative', padding: '16px', display: 'flex', justifyContent: 'center', background: '#f8fafc' }}>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    {/* Tag badge */}
                    <span style={{
                      position: 'absolute', top: '10px', left: '10px',
                      padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 900,
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      background: tagStyle.bg, color: tagStyle.color,
                    }}>{prod.tag}</span>
                    {/* Discount badge */}
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 900,
                      background: '#f0fdf4', color: '#16a34a', letterSpacing: '0.05em',
                    }}>-{prod.discountPercent}%</span>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {prod.name}
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {prod.category}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                        ₹{fmt(discountedPrice(prod.originalPrice, prod.discountPercent))}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>
                        ₹{fmt(prod.originalPrice)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={11} color="#f59e0b" fill="#f59e0b" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#374151' }}>{prod.rating}</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>({prod.reviews.toLocaleString()})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            width: '34px', height: '34px', background: 'white', borderRadius: '50%',
            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b',
          }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Table Section ── */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  padding: '6px 14px', fontSize: '13px', fontWeight: 700,
                  borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: activeTab === tab.name ? '#f0fdf4' : 'transparent',
                  color: activeTab === tab.name ? '#2c7a4b' : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                {tab.name} {tab.count !== undefined && <span style={{ opacity: 0.6 }}>({tab.count})</span>}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '8px 36px 8px 14px', background: '#f8fafc',
                  border: '1px solid #f1f5f9', borderRadius: '8px',
                  fontSize: '13px', outline: 'none', width: '220px',
                }}
              />
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            <button style={{
              width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b',
            }}>
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', padding: '0 24px 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {[
                  { label: <input type="checkbox" style={{ width: '16px', height: '16px' }} />, align: 'center', w: '40px' },
                  { label: 'Product Identity', align: 'left' },
                  { label: 'Category', align: 'center' },
                  { label: 'Offer Price', align: 'center' },
                  { label: 'Discount', align: 'center' },
                  { label: 'Rating', align: 'center' },
                  { label: 'Stock', align: 'center' },
                  { label: 'Last Modified', align: 'center' },
                  { label: 'Manage', align: 'right' },
                ].map((h, i) => (
                  <th key={i} style={{
                    padding: '14px 12px', fontSize: '11px', fontWeight: 800,
                    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em',
                    textAlign: h.align, width: h.w,
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((prod, index) => {
                const tagStyle = TAG_COLORS[prod.tag] || TAG_COLORS.DEAL;
                return (
                  <tr
                    key={prod._id}
                    style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>{index + 1}</td>

                    {/* Product identity */}
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', flexShrink: 0 }}>
                          <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '7px' }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>{prod.name}</span>
                            <span style={{
                              padding: '2px 7px', borderRadius: '5px', fontSize: '9px', fontWeight: 900,
                              letterSpacing: '0.1em', textTransform: 'uppercase',
                              background: tagStyle.bg, color: tagStyle.color,
                            }}>{prod.tag}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontStyle: 'italic', marginTop: '2px' }}>{prod.slug}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#f0fdf4', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#2c7a4b' }}>
                        <Tag size={10} />
                        {prod.category}
                      </span>
                    </td>

                    {/* Offer Price */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>₹{fmt(discountedPrice(prod.originalPrice, prod.discountPercent))}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', textDecoration: 'line-through', marginTop: '2px' }}>₹{fmt(prod.originalPrice)}</div>
                    </td>

                    {/* Discount */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', background: '#f0fdf4', color: '#16a34a', borderRadius: '6px', fontSize: '12px', fontWeight: 900 }}>
                        -{prod.discountPercent}%
                      </span>
                    </td>

                    {/* Rating */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#374151' }}>{prod.rating}</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{prod.reviews.toLocaleString()} reviews</div>
                    </td>

                    {/* Stock */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        background: prod.stock <= 20 ? '#fff1f2' : prod.stock <= 50 ? '#fffbeb' : '#f0fdf4',
                        color: prod.stock <= 20 ? '#e11d48' : prod.stock <= 50 ? '#d97706' : '#16a34a',
                      }}>
                        {prod.stock} units
                      </span>
                    </td>

                    {/* Last Modified */}
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                      {new Date(prod.updatedAt).toLocaleDateString('en-GB').replace(/\//g, '-')}
                    </td>

                    {/* Manage */}
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}>
                          <Eye size={14} />
                        </button>
                        <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#059669'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}>
                          <Edit size={14} />
                        </button>
                        <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <BadgePercent size={32} color="#d1fae5" />
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>No offer products found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <ArrowLeft size={14} /> Previous
          </button>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: '#a4dcbb', color: '#1c6439', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer' }}>1</button>
            {[2, 3, 4].map((num) => (
              <button key={num} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>{num}</button>
            ))}
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductMedia;