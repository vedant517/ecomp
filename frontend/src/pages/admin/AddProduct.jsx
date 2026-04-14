import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, Image as ImageIcon, Check,
  Edit2, Type, Move, X, Layers, ChevronDown
} from 'lucide-react';
import { fetchCategories, fetchSubcategories } from '../../features/products/categorySlice';
import { fetchBrands } from '../../features/products/brandSlice';
import { addProduct, updateProduct, fetchProductById } from '../../features/products/productSlice';
import { useNavigate, useParams } from 'react-router-dom';

const AddProduct = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { id }     = useParams();
  const isEditMode = !!id;

  const { categories, subcategories } = useSelector((state) => state.categories);
  const { brands }                    = useSelector((state) => state.brands);
  const { loading, error }                   = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', discountPrice: '',
    category: '', subcategory: '', brand: '',
    stockQuantity: '', stockStatus: 'In Stock',
  });

  const [variants, setVariants]               = useState([]);
  // ── NEW: one File (or null) per variant ──
  const [variantImages, setVariantImages]     = useState([]);
  const [variantPreviews, setVariantPreviews] = useState([]);

  const [taxIncluded, setTaxIncluded] = useState(true);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isFeatured, setIsFeatured]   = useState(true);
  const [images, setImages]           = useState([]);
  const [previews, setPreviews]       = useState([]);
  const [saleResult, setSaleResult]   = useState(0);

  const fileInputRef = useRef(null);
  // ── NEW: one hidden file-input ref per variant ──
  const variantImageRefs = useRef([]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands()); // Fetch all brands initially
    if (isEditMode) {
      const loadProduct = async () => {
        const result = await dispatch(fetchProductById(id));
        if (fetchProductById.fulfilled.match(result)) {
          const p = result.payload;
          setFormData({
            name: p.name || '', description: p.description || '',
            price: p.price || '', discountPrice: p.discountPrice || '',
            category: p.category?._id || p.category || '',
            subcategory: p.subcategory?._id || p.subcategory || '',
            brand: p.brand?._id || p.brand || '',
            stockQuantity: p.stock || '',
            stockStatus: p.stock > 0 ? 'In Stock' : 'Out of Stock',
          });
          const loadedVariants = p.variants || [];
          setVariants(loadedVariants);
          // pre-fill previews from existing variant image URLs (strings)
          setVariantImages(loadedVariants.map(() => null));
          setVariantPreviews(loadedVariants.map((v) => v.image || null));
          setIsFeatured(p.isFeatured || false);
          if (p.image) setPreviews([p.image]);
        }
      };
      loadProduct();
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (formData.category) {
      dispatch(fetchSubcategories(formData.category));
      // Optionally fetch category-specific brands here if you want filtering,
      // but to ensure brands "show up", we use the ones already in the state
      // or fetch all if state is empty.
    }
  }, [formData.category, dispatch]);

  useEffect(() => {
    const p = parseFloat(formData.price) || 0;
    const d = parseFloat(formData.discountPrice) || 0;
    setSaleResult(p - d);
  }, [formData.price, formData.discountPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const nv = [...variants];
    nv[index][field] = value;
    setVariants(nv);
  };

  // ── NEW: handle variant image pick ──
  const handleVariantImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newImages   = [...variantImages];
    const newPreviews = [...variantPreviews];
    newImages[index]   = file;
    newPreviews[index] = URL.createObjectURL(file);
    setVariantImages(newImages);
    setVariantPreviews(newPreviews);
  };

  // ── NEW: remove variant image ──
  const removeVariantImage = (index) => {
    const newImages   = [...variantImages];
    const newPreviews = [...variantPreviews];
    newImages[index]   = null;
    newPreviews[index] = null;
    setVariantImages(newImages);
    setVariantPreviews(newPreviews);
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: '', stock: '' }]);
    setVariantImages([...variantImages, null]);
    setVariantPreviews([...variantPreviews, null]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
    setVariantImages(variantImages.filter((_, i) => i !== index));
    setVariantPreviews(variantPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => submissionData.append(key, formData[key]));
    submissionData.append('taxIncluded', taxIncluded);
    submissionData.append('isFeatured', isFeatured);
    submissionData.append('stock', isUnlimited ? 999999 : formData.stockQuantity);
    submissionData.append('variants', JSON.stringify(variants));
    if (images.length > 0) submissionData.append('image', images[0]);
    // ── NEW: append each variant image keyed by index ──
    variantImages.forEach((file, idx) => {
      if (file) submissionData.append(`variantImage_${idx}`, file);
    });

    let result;
    if (isEditMode) {
      result = await dispatch(updateProduct({ id, productData: submissionData }));
    } else {
      result = await dispatch(addProduct(submissionData));
    }
    if (addProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      navigate('/products');
    }
  };

  /* ── shared input style ── */
  const inputStyle = {
    width: '100%', padding: '12px 16px', background: '#f8fafc',
    border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px',
    outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box', color: '#1e293b',
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', display: 'block',
  };

  const sectionStyle = {
    background: 'white', padding: '24px', borderRadius: '16px',
    border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  };

  return (
    <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: '0', background: '#f8fafc' }}>

      {/* ── Top bar ── */}
      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#f8fafc' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1f2937', margin: 0 }}>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            {isEditMode ? 'Modify existing product details' : 'Create and publish a new item in your store'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Search product metadata..."
              style={{ ...inputStyle, paddingLeft: '36px', paddingRight: '16px', width: '220px' }} />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
          <button type="submit" form="main-form"
            style={{ padding: '10px 20px', background: '#4c9f70', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {loading ? 'Processing...' : (isEditMode ? 'Update Product' : 'Publish Product')}
          </button>
        </div>
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div style={{ margin: '0 24px 20px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#b91c1c', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <X size={16} /> {error}
        </div>
      )}

      {/* ── Form ── */}
      <form id="main-form" onSubmit={handleSubmit} style={{ padding: '0 24px 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '20px', alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Basic Details */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Type size={16} color="#4c9f70" /> Basic Details
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Product Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., iPhone 15 Pro Max" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Product Description</label>
                <div style={{ position: 'relative' }}>
                  <textarea required name="description" rows={5} value={formData.description} onChange={handleInputChange} placeholder="Provide a detailed description of the product features..."
                    style={{ ...inputStyle, resize: 'none', paddingBottom: '40px' }} />
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                    {[Edit2, Move].map((Icon, i) => (
                      <button key={i} type="button" style={{ padding: '6px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}>
                        <Icon size={13} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Layers size={16} color="#4c9f70" /> Product Variants
              </h2>
              <button type="button" onClick={addVariant} style={{ fontSize: '12px', fontWeight: 700, color: '#4c9f70', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Add Variant
              </button>
            </div>
            {variants.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', border: '2px dashed #f1f5f9', borderRadius: '12px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>No variants added. (e.g., 8GB RAM, 128GB ROM)</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {variants.map((variant, idx) => (
                  <div key={idx} style={{
                    display: 'grid',
                    // ── NEW column added for image ──
                    gridTemplateColumns: '1fr 1fr 100px 64px 36px',
                    gap: '12px', alignItems: 'end',
                    background: '#f8fafc', padding: '16px', borderRadius: '12px'
                  }}>
                    {/* existing text fields */}
                    {[
                      { label: 'Size / Name', field: 'name', type: 'text' },
                      { label: 'Variant Price', field: 'price', type: 'number' },
                      { label: 'Stock', field: 'stock', type: 'number' },
                    ].map(({ label, field, type }) => (
                      <div key={field}>
                        <label style={{ ...labelStyle, fontSize: '10px' }}>{label}</label>
                        <input required type={type} value={variant[field]} onChange={(e) => handleVariantChange(idx, field, e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}

                    {/* ── NEW: variant image cell ── */}
                    <div>
                      <label style={{ ...labelStyle, fontSize: '10px' }}>Image</label>
                      {/* hidden file input, one per variant */}
                      <input
                        ref={(el) => (variantImageRefs.current[idx] = el)}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleVariantImageChange(idx, e)}
                      />
                      {variantPreviews[idx] ? (
                        /* show thumbnail + remove button */
                        <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                          <img
                            src={variantPreviews[idx]}
                            alt="variant"
                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                            onClick={() => variantImageRefs.current[idx]?.click()}
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(idx)}
                            style={{
                              position: 'absolute', top: '-6px', right: '-6px',
                              width: '18px', height: '18px', borderRadius: '50%',
                              background: '#ef4444', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: 0,
                            }}
                          >
                            <X size={10} color="white" strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        /* upload placeholder */
                        <button
                          type="button"
                          onClick={() => variantImageRefs.current[idx]?.click()}
                          style={{
                            width: '56px', height: '56px', borderRadius: '8px',
                            border: '2px dashed #cbd5e1', background: 'white',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: '2px', cursor: 'pointer',
                            color: '#94a3b8', transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4c9f70'; e.currentTarget.style.color = '#4c9f70'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                          <ImageIcon size={14} />
                          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Add</span>
                        </button>
                      )}
                    </div>

                    {/* remove variant row */}
                    <button type="button" onClick={() => removeVariant(idx)} style={{ padding: '8px', color: '#fca5a5', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1px' }}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pricing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Base Price</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 700 }}>$</span>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: '28px' }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Discount Price</label>
                <div style={{ borderRadius: '12px', border: '1px solid #dcfce7', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
                    <span style={{ padding: '12px 14px', background: '#f0fdf4', color: '#4c9f70', fontWeight: 700 }}>$</span>
                    <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} placeholder="0.00"
                      style={{ background: '#f0fdf4', padding: '12px', fontSize: '14px', fontWeight: 700, color: '#4c9f70', border: 'none', outline: 'none' }} />
                  </div>
                  <div style={{ background: '#f0fdf4', borderTop: '1px solid #dcfce7', padding: '8px 14px', fontSize: '11px', fontWeight: 700, color: '#4c9f70', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Sale: ${saleResult.toFixed(2)}
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tax Included</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['Yes', 'No'].map((opt) => (
                    <button key={opt} type="button" onClick={() => setTaxIncluded(opt === 'Yes')}
                      style={{ padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', border: (opt === 'Yes' ? taxIncluded : !taxIncluded) ? 'none' : '1px solid #e2e8f0', background: (opt === 'Yes' ? taxIncluded : !taxIncluded) ? '#0f172a' : 'white', color: (opt === 'Yes' ? taxIncluded : !taxIncluded) ? 'white' : '#94a3b8' }}>
                      Tax {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Inventory & Stock</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Unlimited</span>
                <button type="button" onClick={() => setIsUnlimited(!isUnlimited)}
                  style={{ width: '44px', height: '22px', borderRadius: '999px', position: 'relative', border: 'none', cursor: 'pointer', background: isUnlimited ? '#4c9f70' : '#e2e8f0', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'left 0.2s', left: isUnlimited ? '24px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Stock Quantity</label>
                <input type="number" name="stockQuantity" disabled={isUnlimited} value={isUnlimited ? '' : formData.stockQuantity} onChange={handleInputChange} placeholder={isUnlimited ? 'Unlimited' : '0'}
                  style={{ ...inputStyle, opacity: isUnlimited ? 0.5 : 1 }} />
              </div>
              <div>
                <label style={labelStyle}>Stock Status</label>
                <div style={{ position: 'relative' }}>
                  <select name="stockStatus" value={formData.stockStatus} onChange={handleInputChange} style={{ ...inputStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}>
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                    <option>Pre-Order</option>
                  </select>
                  <ChevronDown size={15} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', cursor: 'pointer', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: isFeatured ? 'none' : '2px solid #cbd5e1', background: isFeatured ? '#4c9f70' : 'white', transition: 'all 0.15s' }}>
                {isFeatured && <Check size={13} color="white" strokeWidth={3} />}
              </div>
              <input type="checkbox" style={{ display: 'none' }} checked={isFeatured} onChange={() => setIsFeatured(!isFeatured)} />
              <span style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>Highlight this product in a featured top section on your storefront.</span>
            </label>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>

          {/* Media */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Product Media</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div onClick={() => fileInputRef.current.click()}
                style={{ border: '2px dashed #dcfce7', borderRadius: '16px', background: '#f0fdf4', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '180px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4c9f70'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#dcfce7'}
              >
                {previews.length > 0 ? (
                  <img src={previews[0]} style={{ maxHeight: '140px', width: '100%', objectFit: 'contain', borderRadius: '10px' }} alt="main" />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '52px', height: '52px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <ImageIcon size={22} color="#4c9f70" />
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#374151', margin: 0 }}>Drop your image here</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Supports JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {previews.slice(1).map((src, idx) => (
                  <div key={idx} style={{ aspectRatio: '1', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                    <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                    <button type="button" onClick={() => removeImage(idx + 1)}
                      style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                      <X size={14} color="white" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current.click()}
                  style={{ aspectRatio: '1', border: '2px dashed #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'white', color: '#94a3b8', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4c9f70'; e.currentTarget.style.color = '#4c9f70'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; }}>
                  <Plus size={16} />
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleImageChange} />
            </div>
          </div>

          {/* Organization */}
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '20px' }}>Organization</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Product Category', name: 'category', options: categories, placeholder: 'Select Category' },
                { label: 'Subcategory',       name: 'subcategory', options: subcategories, placeholder: 'Select Subcategory' },
                { label: 'Brand',             name: 'brand', options: brands, placeholder: 'Select Brand' },
              ].map(({ label, name, options, placeholder }) => (
                <div key={name}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <select name={name} value={formData[name]} onChange={handleInputChange}
                      style={{ ...inputStyle, appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}>
                      <option value="">{placeholder}</option>
                      {options?.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
                    </select>
                    <ChevronDown size={15} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <button type="button" onClick={() => navigate('/products')}
                style={{ padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                Dismiss
              </button>
              <button type="submit" form="main-form"
                style={{ padding: '12px', background: '#4c9f70', color: 'white', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                {isEditMode ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;