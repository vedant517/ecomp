import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, Image as ImageIcon, Check,
  Edit2, Type, Move, X, Layers, ChevronDown
} from 'lucide-react';
import { fetchCategories, fetchSubcategories } from '../../features/products/categorySlice';
import { fetchBrands } from '../../features/products/brandSlice';
import { addProduct } from '../../features/products/productSlice';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  }, [dispatch]);

  useEffect(() => {
    if (formData.category) {
      dispatch(fetchSubcategories(formData.category));
      dispatch(fetchBrands(formData.category));
    } else {
      dispatch(fetchBrands()); // Reset to all if no category selected
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = new FormData();

    Object.keys(formData).forEach((key) => {
      submissionData.append(key, formData[key]);
    });

    submissionData.append('taxIncluded', taxIncluded);
    submissionData.append('isFeatured', isFeatured);
    submissionData.append('stock', isUnlimited ? 999999 : formData.stockQuantity);

    images.forEach((img) => submissionData.append('images', img));

    const result = await dispatch(addProduct(submissionData));
    if (addProduct.fulfilled.match(result)) {
      navigate('/products');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 w-full">
        <div className="text-center md:text-left">
          <h1 className="text-[20px] font-bold text-[#1f2937]">Add New Product</h1>
          <p className="text-slate-500 text-sm mt-1">Create and publish a new item in your store</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full sm:w-[280px]">
            <input
              type="text"
              placeholder="Search product for add"
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#4c9f70]/20 focus:border-[#4c9f70] outline-none transition-all shadow-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#4c9f70]" size={16} />
          </div>
          <button
            type="submit"
            form="main-form"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#4c9f70] text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-[#4c9f70]/20 text-sm whitespace-nowrap"
          >
            {loading ? 'Publishing...' : 'Publish Product'}
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
            <h2 className="text-[14px] font-bold text-slate-800 mb-6">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                  <input
                    required
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-8 py-3 pr-6 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4c9f70]/20 focus:bg-white transition-all sm:pr-28"
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
                      className="min-w-0 bg-[#edf7ee]/50 px-3 py-3 text-[#4c9f70] font-bold outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="border-t border-[#dcfce7] bg-[#edf7ee] px-4 py-3 text-[11px] font-bold text-[#4c9f70] sm:text-xs">
                    Sale: ${saleResult.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tax Included</label>
                <div className="flex gap-4 mt-2 mb-1">
                  {['Yes', 'No'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${(opt === 'Yes' ? taxIncluded : !taxIncluded) ? 'border-[#4c9f70]' : 'border-slate-300'}`}>
                        {(opt === 'Yes' ? taxIncluded : !taxIncluded) && <div className="w-2.5 h-2.5 bg-[#4c9f70] rounded-full" />}
                      </div>
                      <input type="radio" className="hidden" onChange={() => setTaxIncluded(opt === 'Yes')} />
                      <span className={`text-[13px] font-bold ${(opt === 'Yes' ? taxIncluded : !taxIncluded) ? 'text-slate-800' : 'text-slate-400'}`}>{opt}</span>
                    </label>
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
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all disabled:opacity-50 disabled:bg-slate-100"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Status</label>
                <div className="relative">
                  <select
                    name="stockStatus"
                    value={formData.stockStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all"
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
                className="border-2 border-dashed border-[#dcfce7] rounded-2xl bg-[#edf7ee]/60 p-6 flex flex-col items-center justify-center relative min-h-[220px] transition-all hover:border-[#4c9f70]/40 cursor-pointer overflow-hidden"
                onClick={() => fileInputRef.current.click()}
              >
                {previews.length > 0 ? (
                  <img src={previews[0]} className="max-h-40 w-full object-contain rounded-lg shadow-sm" alt="main" />
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

              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {previews.slice(1).map((src, idx) => (
                  <div key={idx} className="aspect-square min-w-0 bg-slate-50 rounded-xl border border-slate-200 relative group">
                    <img src={src} className="w-full h-full object-cover rounded-xl" alt="thumb" />
                    <button type="button" onClick={() => removeImage(idx + 1)} className="absolute -top-1.5 -right-1.5 bg-white shadow-md rounded-full p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-slate-100">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-[#4c9f70] hover:border-[#4c9f70]/30 transition-all gap-1"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all"
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
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none focus:bg-white focus:ring-2 focus:ring-[#4c9f70]/20 transition-all"
                  >
                    <option value="">Select Brand</option>
                    {brands?.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 text-[13px] flex items-center justify-center gap-2 transition-colors">
                <Layers size={16} /> Draft
              </button>
              <button type="submit" form="main-form" className="flex-1 px-4 py-2.5 bg-[#4c9f70] text-white font-bold rounded-xl hover:bg-emerald-700 text-[13px] shadow-md shadow-[#4c9f70]/20 transition-all focus:ring-4 focus:ring-emerald-500/30 outline-none">
                Publish
              </button>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
