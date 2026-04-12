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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { categories, subcategories } = useSelector((state) => state.categories);
  const { brands } = useSelector((state) => state.brands);
  const { loading } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    stockQuantity: '',
    stockStatus: 'In Stock'
  });

  const [variants, setVariants] = useState([]);

  const [taxIncluded, setTaxIncluded] = useState(true);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saleResult, setSaleResult] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    
    if (isEditMode) {
      const loadProduct = async () => {
        const result = await dispatch(fetchProductById(id));
        if (fetchProductById.fulfilled.match(result)) {
          const p = result.payload;
          setFormData({
            name: p.name || '',
            description: p.description || '',
            price: p.price || '',
            discountPrice: p.discountPrice || '',
            category: p.category?._id || p.category || '',
            subcategory: p.subcategory?._id || p.subcategory || '',
            brand: p.brand?._id || p.brand || '',
            stockQuantity: p.stock || '',
            stockStatus: p.stock > 0 ? 'In Stock' : 'Out of Stock'
          });
          setVariants(p.variants || []);
          setIsFeatured(p.isFeatured || false);
          if (p.image) {
            setPreviews([p.image]);
          }
        }
      };
      loadProduct();
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (formData.category) {
      dispatch(fetchSubcategories(formData.category));
      dispatch(fetchBrands(formData.category));
    } else {
      dispatch(fetchBrands()); 
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
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: '', stock: '' }]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = new FormData();

    Object.keys(formData).forEach((key) => {
      submissionData.append(key, formData[key]);
    });

    submissionData.append('taxIncluded', taxIncluded);
    submissionData.append('isFeatured', isFeatured);
    submissionData.append('stock', isUnlimited ? 999999 : formData.stockQuantity);
    submissionData.append('variants', JSON.stringify(variants));

    // Backend expects 'image' (singular) for the primary upload
    if (images.length > 0) {
      submissionData.append('image', images[0]);
    }

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

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 w-full">
        <div className="text-center md:text-left">
          <h1 className="text-[20px] font-bold text-[#1f2937]">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEditMode ? 'Modify existing product details' : 'Create and publish a new item in your store'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full sm:w-[280px]">
            <input
              type="text"
              placeholder="Search product metadata..."
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4c9f70]/20 focus:border-[#4c9f70] outline-none transition-all shadow-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4c9f70]" size={16} />
          </div>
          <button
            type="submit"
            form="main-form"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#4c9f70] text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-[#4c9f70]/20 text-sm whitespace-nowrap"
          >
            {loading ? 'Processing...' : (isEditMode ? 'Update Product' : 'Publish Product')}
          </button>
        </div>
      </div>

      <form
        id="main-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"
      >
        <div className="space-y-6">
          <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-[14px] font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Type size={18} className="text-[#4c9f70]" /> Basic Details
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., iPhone 15 Pro Max"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Description</label>
                <div className="relative">
                  <textarea
                    required
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the product features..."
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white outline-none resize-none transition-all"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button type="button" className="p-1.5 bg-white rounded-md border border-slate-200 text-slate-400 hover:text-[#4c9f70] transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button type="button" className="p-1.5 bg-white rounded-md border border-slate-200 text-slate-400 hover:text-[#4c9f70] transition-colors">
                      <Move size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                <Layers size={18} className="text-[#4c9f70]" /> Product Variants
              </h2>
              <button
                type="button"
                onClick={addVariant}
                className="text-[12px] font-bold text-[#4c9f70] hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add Variant
              </button>
            </div>
            
            {variants.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                 <p className="text-xs font-medium text-slate-400">No variants added. (e.g., 8GB RAM, 128GB ROM)</p>
              </div>
            ) : (
              <div className="space-y-4">
                {variants.map((variant, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_100px_40px] gap-4 items-end bg-slate-50 p-4 rounded-xl relative group">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Size / Name</label>
                      <input
                        required
                        value={variant.name}
                        onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#4c9f70]/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Variant Price</label>
                      <input
                        required
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#4c9f70]/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock</label>
                      <input
                        required
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#4c9f70]/20"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="mb-1 p-2 text-rose-400 hover:text-rose-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-[14px] font-bold text-slate-800 mb-6 uppercase tracking-wide">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    required
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-8 py-3 pr-6 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4c9f70]/20 focus:bg-white transition-all sm:pr-28 font-bold"
                    placeholder="0.00"
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 text-xs font-bold text-slate-500 border-l border-slate-200 pl-3 sm:flex">
                    USD <ChevronDown size={14} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Price</label>
                <div className="overflow-hidden rounded-xl border border-[#dcfce7] bg-[#edf7ee]/70">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)]">
                    <div className="flex items-center justify-center bg-[#edf7ee] px-4 py-3 text-[#4c9f70] font-bold">$</div>
                    <input
                      type="number"
                      name="discountPrice"
                      value={formData.discountPrice}
                      onChange={handleInputChange}
                      className="min-w-0 bg-transparent px-3 py-3 text-[#4c9f70] font-bold outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="border-t border-[#dcfce7] bg-[#edf7ee] px-4 py-3 text-[11px] font-bold text-[#4c9f70] sm:text-xs text-center uppercase tracking-widest">
                    Sale: ${saleResult.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tax Included</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                   {['Yes', 'No'].map((opt) => (
                     <button
                       key={opt}
                       type="button"
                       onClick={() => setTaxIncluded(opt === 'Yes')}
                       className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                         (opt === 'Yes' ? taxIncluded : !taxIncluded) 
                         ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                         : 'bg-white text-slate-400 border-slate-200 hover:border-[#4c9f70]/30'
                       }`}
                     >
                       Tax {opt}
                     </button>
                   ))}
                 </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h2 className="text-[14px] font-bold text-slate-800">Inventory & Stock</h2>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-slate-700">Unlimited</span>
                <button
                  type="button"
                  onClick={() => setIsUnlimited(!isUnlimited)}
                  className={`w-11 h-[22px] rounded-full transition-all relative ${isUnlimited ? 'bg-[#4c9f70]' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-all ${isUnlimited ? 'left-[24px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  disabled={isUnlimited}
                  value={isUnlimited ? '' : formData.stockQuantity}
                  onChange={handleInputChange}
                  placeholder={isUnlimited ? 'Unlimited' : '0'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all disabled:opacity-50 disabled:bg-slate-100 font-bold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Status</label>
                <div className="relative">
                  <select
                    name="stockStatus"
                    value={formData.stockStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all font-bold"
                  >
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                    <option>Pre-Order</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 mt-6 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 hover:border-[#4c9f70]/40 transition-colors">
              <div className={`w-5 h-5 rounded flex flex-shrink-0 items-center justify-center border-2 ${isFeatured ? 'bg-[#4c9f70] border-[#4c9f70]' : 'bg-white border-slate-300'}`}>
                {isFeatured && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              <input type="checkbox" className="hidden" checked={isFeatured} onChange={() => setIsFeatured(!isFeatured)} />
              <span className="text-[13px] font-medium text-slate-600 leading-snug">Highlight this product in a featured top section on your storefront.</span>
            </label>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-[14px] font-bold text-slate-800 mb-6">Product Media</h2>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-[#dcfce7] rounded-2xl bg-[#edf7ee]/60 p-6 flex flex-col items-center justify-center relative min-h-[220px] transition-all hover:border-[#4c9f70]/40 cursor-pointer overflow-hidden group shadow-inner"
                onClick={() => fileInputRef.current.click()}
              >
                {previews.length > 0 ? (
                  <img src={previews[0]} className="max-h-40 w-full object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform" alt="main" />
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3">
                      <ImageIcon className="text-[#4c9f70]" size={24} />
                    </div>
                    <p className="text-[13px] font-bold text-slate-700">Drop your image here</p>
                    <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Supports JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {previews.slice(1).map((src, idx) => (
                  <div key={idx} className="aspect-square min-w-0 bg-slate-50 rounded-xl border border-slate-200 relative group overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" alt="thumb" />
                    <button type="button" onClick={() => removeImage(idx + 1)} className="absolute inset-0 bg-rose-500/80 items-center justify-center flex opacity-0 group-hover:opacity-100 transition-all">
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#4c9f70] hover:border-[#4c9f70]/30 transition-all shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleImageChange} />
            </div>
          </section>

          <section className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-[14px] font-bold text-slate-800">Organization</h2>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all font-bold"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subcategory</label>
                <div className="relative">
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all font-bold"
                  >
                    <option value="">Select Subcategory</option>
                    {subcategories?.map((sc) => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                <div className="relative">
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all font-bold"
                  >
                    <option value="">Select Brand</option>
                    {brands?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/products')} type="button" className="px-4 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 text-[13px] flex items-center justify-center gap-2 transition-all active:scale-95">
                Dismiss
              </button>
              <button type="submit" form="main-form" className="px-4 py-3 bg-[#4c9f70] text-white font-bold rounded-xl hover:bg-emerald-700 text-[13px] shadow-md shadow-[#4c9f70]/20 transition-all active:scale-95">
                {isEditMode ? 'Update' : 'Publish'}
              </button>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
