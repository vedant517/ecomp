import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Plus, MoreVertical,
  ChevronRight, Filter, Edit, Trash2, ArrowLeft, ArrowRight
} from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../features/products/categorySlice';
import { fetchProducts } from '../../features/products/productSlice';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

const Categories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading, error } = useSelector((state) => state.categories);
  const { items: products } = useSelector((state) => state.products);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');

  const [activeTab, setActiveTab] = useState('All Product');

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (imageFile) {
        formData.append('image', imageFile);
    } else if (image) {
        formData.append('image', image);
    }

    let result;
    if (isEditing) {
      result = await dispatch(updateCategory({ id: editId, categoryData: formData }));
    } else {
      result = await dispatch(createCategory(formData));
    }
    if (createCategory.fulfilled.match(result) || updateCategory.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); closeModal(); }, 2000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setEditId(category._id);
    setName(category.name);
    setDescription(category.description || '');
    setImage(category.image || '');
    setPreview(category.image || '');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All related items may be affected.')) {
      await dispatch(deleteCategory(id));
    }
  };

  const closeModal = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setDescription('');
    setImage('');
    setImageFile(null);
    setPreview('');
    setIsModalOpen(false);
  };

  const tabs = [
    { name: 'All Product', count: products.length },
    { name: 'Categories', count: categories.length },
  ];

  return (
    <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>

      {/* ── Discover Section ── */}
      <div>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: 0 }}>Discover</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', background: '#4c9f70', color: 'white',
                border: 'none', borderRadius: '10px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={10} strokeWidth={3} />
              </div>
              Create Category
            </button>
            <button
              onClick={() => navigate('/add-product')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', background: 'white', color: '#374151',
                border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Add Product <Plus size={14} color="#94a3b8" />
            </button>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            paddingRight: '48px',
          }}>
            {(categories.length > 0 ? categories : []).slice(0, 8).map((cat, idx) => (
              <div
                key={cat._id || idx}
                onClick={() => handleEdit(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'white', padding: '14px', borderRadius: '12px',
                  border: '1px solid #f1f5f9', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: '44px', height: '44px', flexShrink: 0,
                  borderRadius: '8px', border: '1px solid #f1f5f9',
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', padding: '4px',
                }}>
                  <img
                    src={cat.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=10b981&color=fff&bold=true`}
                    alt={cat.name}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=10b981&color=fff&bold=true` }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Manage Assets</span>
                </div>
              </div>
            ))}
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
          {/* Tabs */}
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

          {/* Search + Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search catalog..."
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
                  { label: 'Category Identity', align: 'left' },
                  { label: 'Description', align: 'center' },
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
              {(categories || []).map((cat, index) => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>{index + 1}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #f1f5f9', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', flexShrink: 0 }}>
                        <img
                          src={cat.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=10b981&color=fff&bold=true`}
                          alt={cat.name}
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.name)}&background=10b981&color=fff&bold=true` }}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase' }}>{cat.name}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontStyle: 'italic' }}>{cat.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.description || 'Global taxonomy segment for product organization.'}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#374151' }}>
                    {new Date(cat.updatedAt || Date.now()).toLocaleDateString('en-GB').replace(/\//g, '-')}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button onClick={() => handleEdit(cat)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#059669'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && categories.length === 0 && (
            <div style={{ padding: '60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Hydrating Categories...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            <ArrowLeft size={14} /> Previous
          </button>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: '#a4dcbb', color: '#1c6439', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer' }}>1</button>
            {[2, 3, 4, 5].map((num) => (
              <button key={num} style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>{num}</button>
            ))}
            <span style={{ color: '#94a3b8', fontWeight: 700 }}>...</span>
            <button style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>24</button>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', padding: '48px', borderRadius: '32px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxWidth: '440px', width: '100%', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '24px', right: '24px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                {isEditing ? 'Modify Category' : 'New Main Category'}
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '8px' }}>
                {isEditing ? 'Updating Taxonomy Node' : 'Initialize a new global product classification'}
              </p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: '4px' }}>Display Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="e.g. Computing"
                  style={{ width: '100%', padding: '14px 20px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: '4px' }}>Category Identity Image</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f8fafc', border: '1px dotted #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {preview ? (
                          <img 
                            src={preview && (preview.startsWith('http') || preview.startsWith('data:')) ? preview : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&bold=true`} 
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&bold=true` }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : <Plus size={20} color="#cbd5e1" />}
                    </div>
                    <label style={{ flex: 1, padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#475569', cursor: 'pointer', textAlign: 'center' }}>
                        Choose Vector / Image
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </label>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: '4px' }}>Global Segment Focus</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Define the scope of this global category segment..."
                  style={{ width: '100%', padding: '14px 20px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', padding: '18px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Processing...' : (isEditing ? 'Save Changes' : 'Initialize Category')}
              </button>
            </form>
            {(success || error) && (
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: success ? '#059669' : '#e11d48', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center' }}>
                {success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} 
                {success ? 'Data Persisted Successfully' : (error || 'Failed to sync data')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;