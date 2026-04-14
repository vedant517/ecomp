import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Edit, Trash2, X, CheckCircle2, Bookmark } from 'lucide-react';
import { fetchBrands, createBrand, updateBrand, deleteBrand } from '../../features/products/brandSlice';
import { fetchCategories } from '../../features/products/categorySlice';

const Brands = () => {
  const dispatch = useDispatch();
  const { brands, loading } = useSelector((state) => state.brands);
  const { categories } = useSelector((state) => state.categories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => { 
    dispatch(fetchBrands()); 
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const brandData = { name, description, logo, categories: selectedCategories };
    let result;
    if (isEditing) {
      result = await dispatch(updateBrand({ id: editId, brandData }));
    } else {
      result = await dispatch(createBrand(brandData));
    }
    if (createBrand.fulfilled.match(result) || updateBrand.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); closeModal(); }, 2000);
    }
  };

  const handleEdit = (brand) => {
    setIsEditing(true);
    setEditId(brand._id);
    setName(brand.name);
    setDescription(brand.description || '');
    setLogo(brand.logo || '');
    setSelectedCategories(brand.categories?.map(c => c._id || c) || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      await dispatch(deleteBrand(id));
    }
  };

  const toggleCategory = (catId) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const closeModal = () => {
    setIsEditing(false);
    setEditId(null);
    setName('');
    setDescription('');
    setLogo('');
    setSelectedCategories([]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '24px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: '#6366f1', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bookmark size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Brand Partners</h1>
            <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '4px' }}>
              Managing {brands.length} Verified Manufacturers
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search store partners..."
              style={{ paddingLeft: '42px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', fontSize: '14px', fontWeight: 500, outline: 'none', width: '260px' }} />
          </div>
          <button onClick={() => setIsModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0f172a', color: 'white', padding: '12px 20px', borderRadius: '14px', border: 'none', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>
            <Plus size={16} strokeWidth={3} /> New Partner
          </button>
        </div>
      </div>

      {/* ── Brand Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {(brands || []).map((brand) => (
          <div key={brand?._id} style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: '#f8fafc', borderBottomLeftRadius: '60px', zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
              <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', border: '1px solid #f1f5f9', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)' }}>
                <img
                  src={brand?.logo && (brand.logo.startsWith('http') || brand.logo.startsWith('data:')) ? brand.logo : `https://ui-avatars.com/api/?name=${encodeURIComponent(brand?.name || 'Partner')}&background=6366f1&color=fff&bold=true`}
                  alt={brand?.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>{brand?.name || 'Global Partner'}</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Verified Partner</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{brand?.description || 'Global manufacturer specializing in high-end consumer products.'}"
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                <button onClick={() => handleEdit(brand)} style={{ flex: 1, padding: '10px', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#059669'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}>
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(brand?._id)} style={{ flex: 1, padding: '10px', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#94a3b8'; }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <div onClick={() => setIsModalOpen(true)} style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', cursor: 'pointer', minHeight: '260px', transition: 'all 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#a7f3d0'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ width: '56px', height: '56px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Plus size={28} />
          </div>
          <span style={{ marginTop: '14px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Register Partner</span>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', padding: '48px', borderRadius: '32px', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', maxWidth: '440px', width: '100%', position: 'relative' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '24px', right: '24px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#94a3b8', border: 'none', borderRadius: '14px', cursor: 'pointer' }}>
              <X size={22} />
            </button>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
                {isEditing ? 'Update Partner' : 'New Partner'}
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500, marginTop: '8px' }}>
                {isEditing ? 'Modify verified manufacturer details' : 'Register a new brand in the Dealport ecosystem'}
              </p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { label: 'Legal Brand Name', value: name, onChange: setName, placeholder: 'e.g. Sony Corporation', required: true },
                { label: 'Logo Digital Asset (URL)', value: logo, onChange: setLogo, placeholder: 'https://assets.dealport.com/...' },
              ].map(({ label, value, onChange, placeholder, required }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: '4px' }}>{label}</label>
                  <input required={required} value={value} onChange={(e) => onChange(e.target.value)} type="text" placeholder={placeholder}
                    style={{ width: '100%', padding: '14px 20px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: '4px' }}>Brand Mission / Info</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Core brand values and segment focus..."
                   style={{ width: '100%', padding: '14px 20px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', paddingLeft: '4px' }}>Associate Categories</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                  {categories.map(cat => (
                    <button key={cat._id} type="button" onClick={() => toggleCategory(cat._id)}
                      style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', background: selectedCategories.includes(cat._id) ? '#6366f1' : 'white', color: selectedCategories.includes(cat._id) ? 'white' : '#64748b', transition: 'all 0.1s' }}>
                      {cat.name}
                    </button>
                  ))}
                  {categories.length === 0 && <span style={{ fontSize: '12px', color: '#94a3b8' }}>No categories created yet.</span>}
                </div>
              </div>
              <button type="submit" style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', borderRadius: '20px', padding: '18px', fontSize: '16px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', marginTop: '8px' }}>
                {loading ? 'Authenticating...' : (isEditing ? 'Synchronize' : 'Register Partner')}
              </button>
            </form>
            {success && (
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#059669', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                <CheckCircle2 size={16} /> Partner {isEditing ? 'Updated' : 'Registered'} Successfully
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;