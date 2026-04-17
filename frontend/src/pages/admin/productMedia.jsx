import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const OfferPage = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    discountPercent: "",
    productId: "",
    variantId: "",
    category: "",
    subcategory: "",
    tag: "HOT",
    endDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offerRes, productRes, categoryRes, subcategoryRes] = await Promise.all([
          fetch("http://localhost:5000/api/offers"),
          fetch("http://localhost:5000/api/products"),
          fetch("http://localhost:5000/api/categories"),
          fetch("http://localhost:5000/api/subcategories"),

        ]);
        const [offerData, productData, categoryData, subcategoryData] = await Promise.all([
          offerRes.json(),
          productRes.json(),
          categoryRes.json(),
          subcategoryRes.json(),
        ]);
        setOffers(offerData.data || []);
        setProducts(productData.data || []);
        setCategories(categoryData.data || []);
        setSubcategories(subcategoryData.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── FORM HANDLERS ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData((p) => ({ ...p, category: value, subcategory: "", productId: "", variantId: "" }));
    } else if (name === "subcategory") {
      setFormData((p) => ({ ...p, subcategory: value, productId: "", variantId: "" }));
    } else if (name === "productId") {
      setFormData((p) => ({ ...p, productId: value, variantId: "" }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleCreateOffer = async () => {
    if (!formData.name || !formData.discountPercent || !formData.productId || !formData.endDate) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const payload = { ...formData };
      if (!payload.variantId) delete payload.variantId;
      const res = await fetch("http://localhost:5000/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setOffers((prev) => [...prev, data.data]);
        setShowForm(false);
        toast.success("Offer created!");
        setFormData({ name: "", discountPercent: "", productId: "", variantId: "", category: "", subcategory: "", tag: "HOT", endDate: "" });
      } else {
        toast.error(data.message || "Failed to create offer");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // ── HELPER: build a readable variant label from any variant shape ──
  const buildVariantLabel = (v) => {
    if (!v) return null;

    const base = v.name || v.label || "";
    const extra = v.value && v.value !== base ? ` — ${v.value}` : "";
    const result = (base + extra).trim();
    return result || null;
  };

  // ── ENRICH OFFERS ──────────────────────────────────────────
  const enrichedOffers = offers.map((offer) => {
    // Resolve product — could be a populated object or a plain ID string
    const product =
      offer.productId && typeof offer.productId === "object"
        ? offer.productId
        : products.find((p) => p._id === offer.productId);

    // Always also look up from the full local products list (has complete variants array)
    const fullProduct = products.find(
      (p) => p._id === (product?._id || offer.productId)
    );

    // Normalize variantId to a plain string
    const variantIdStr =
      offer.variantId && typeof offer.variantId === "object"
        ? String(offer.variantId._id)
        : offer.variantId
          ? String(offer.variantId)
          : null;

    // Variants from fullProduct (most reliable) with fallback
    const variants = fullProduct?.variants || product?.variants || [];

    // Find the variant
    const variant = variantIdStr
      ? variants.find((v) => String(v._id) === variantIdStr)
      : null;

    // If variantId exists but variant wasn't found in local list,
    // try to use the populated variantId object directly from the offer
    const variantFallback =
      !variant && offer.variantId && typeof offer.variantId === "object"
        ? offer.variantId
        : null;

    const resolvedVariant = variant || variantFallback;

    const categoryName =
      product?.category?.name ||
      fullProduct?.category?.name ||
      categories.find(
        (c) => c._id === (product?.category?._id || product?.category)
      )?.name ||
      "Other";

    const subcategoryName =
      product?.subcategory?.name ||
      fullProduct?.subcategory?.name ||
      subcategories.find(
        (s) => s._id === (product?.subcategory?._id || product?.subcategory)
      )?.name ||
      null;

    // ✅ Use the helper so label is never empty when variant exists
    const variantLabel = buildVariantLabel(resolvedVariant);

    // Price: prefer variant price, then product price
    const price =
      resolvedVariant?.price ??
      product?.price ??
      fullProduct?.price ??
      0;

    return {
      ...offer,
      productName: product?.name || fullProduct?.name || "Unknown",
      price,
      categoryName,
      subcategoryName,
      variantLabel,
      // ✅ Show variant image if available, else product image
      image:
        resolvedVariant?.image ||
        product?.image ||
        fullProduct?.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    };
  });

  // ── FILTER TABS ────────────────────────────────────────────
  const categoryTabs = ["All", ...new Set(enrichedOffers.map((o) => o.categoryName))];

  const subcategoryTabs =
    selectedCategory === "All"
      ? []
      : [
        "All",
        ...new Set(
          enrichedOffers
            .filter((o) => o.categoryName === selectedCategory && o.subcategoryName)
            .map((o) => o.subcategoryName)
        ),
      ];

  const filteredOffers = enrichedOffers.filter((o) => {
    const matchCat = selectedCategory === "All" || o.categoryName === selectedCategory;
    const matchSub = selectedSubcategory === "All" || o.subcategoryName === selectedSubcategory;
    return matchCat && matchSub;
  });

  // ── FORM DROPDOWNS ─────────────────────────────────────────
  const filteredSubcategories = formData.category
    ? subcategories.filter((s) => {
      const subCatId = s.category?._id || s.category;
      return String(subCatId) === String(formData.category);
    })
    : [];

  const filteredProducts = products.filter((p) => {
    const productCatId = String(p.category?._id || p.category || "");
    const productSubId = String(p.subcategory?._id || p.subcategory || "");
    const matchCat = !formData.category || productCatId === String(formData.category);
    const matchSub = !formData.subcategory || productSubId === String(formData.subcategory);
    return matchCat && matchSub;
  });

  const selectedProduct = products.find((p) => p._id === formData.productId);
  const productVariants = selectedProduct?.variants || [];

  const getVariantPrice = () => {
    if (formData.variantId) {
      const v = productVariants.find((v) => String(v._id) === String(formData.variantId));
      return v?.price ?? selectedProduct?.price ?? 0;
    }
    return selectedProduct?.price ?? 0;
  };

  const getDiscountedPrice = (price, pct) =>
    Math.round(price - (price * Number(pct)) / 100);

  // ── SHARED STYLES ──────────────────────────────────────────
  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: "#475569",
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  };
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: 10,
    fontSize: 13,
    color: "#1e293b",
    outline: "none",
    background: "#f8fafc",
    boxSizing: "border-box",
    cursor: "pointer",
  };
  const disabledInputStyle = {
    ...inputStyle,
    background: "#f1f5f9",
    opacity: 0.6,
    cursor: "not-allowed",
  };

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "4px solid #e2e8f0", borderTop: "4px solid #4c9f70", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }}></div>
          <p style={{ color: "#64748b", fontWeight: 600 }}>Loading offers...</p>
        </div>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)", padding: "28px 24px", fontFamily: "'Inter', sans-serif", color: "#1e293b" }}>
      <Toaster position="top-right" />

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-0.5px" }}>🏷️ Offers</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>Manage and create product offers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: "linear-gradient(135deg,#4c9f70,#3a895c)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(76,159,112,0.35)" }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Create Offer
        </button>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: subcategoryTabs.length > 1 ? 10 : 24, flexWrap: "wrap" }}>
        {categoryTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedSubcategory("All"); }}
            style={{
              padding: "7px 18px", borderRadius: 30,
              border: selectedCategory === cat ? "none" : "1.5px solid #e2e8f0",
              background: selectedCategory === cat ? "linear-gradient(135deg,#4c9f70,#3a895c)" : "#fff",
              color: selectedCategory === cat ? "#fff" : "#64748b",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
              boxShadow: selectedCategory === cat ? "0 4px 12px rgba(76,159,112,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
              transition: "all 0.2s",
            }}
          >{cat}</button>
        ))}
      </div>

      {/* ── SUBCATEGORY TABS ── */}
      {subcategoryTabs.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", paddingLeft: 4 }}>
          {subcategoryTabs.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              style={{
                padding: "5px 14px", borderRadius: 30,
                border: selectedSubcategory === sub ? "none" : "1.5px solid #e2e8f0",
                background: selectedSubcategory === sub ? "linear-gradient(135deg,#3b82f6,#2563eb)" : "#fff",
                color: selectedSubcategory === sub ? "#fff" : "#64748b",
                fontWeight: 600, fontSize: 12, cursor: "pointer",
                boxShadow: selectedSubcategory === sub ? "0 4px 12px rgba(59,130,246,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 0.2s",
              }}
            >{sub}</button>
          ))}
        </div>
      )}

      {/* ── OFFERS GRID ── */}
      {filteredOffers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No offers found</p>
          <p style={{ fontSize: 13 }}>Create your first offer to get started</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
          {filteredOffers.map((offer) => {
            const finalPrice = getDiscountedPrice(offer.price, offer.discountPercent);
            const savings = offer.price - finalPrice;
            return (
              <div
                key={offer._id}
                style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", cursor: "pointer", position: "relative", transition: "transform 0.2s,box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
              >
                {/* Discount Badge */}
                <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, boxShadow: "0 2px 8px rgba(239,68,68,0.4)" }}>
                  -{offer.discountPercent}% OFF
                </div>
                {offer.tag && (
                  <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2, background: offer.tag === "HOT" ? "linear-gradient(135deg,#f97316,#ea580c)" : offer.tag === "NEW" ? "linear-gradient(135deg,#3b82f6,#2563eb)" : offer.tag === "SALE" ? "linear-gradient(135deg,#4c9f70,#3a895c)" : "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20 }}>
                    {offer.tag === "HOT" ? "🔥" : offer.tag === "NEW" ? "✨" : offer.tag === "SALE" ? "🏷️" : "⚡"} {offer.tag}
                  </div>
                )}

                {/* Image */}
                <div style={{ position: "relative", height: 190, overflow: "hidden", background: "linear-gradient(135deg,#f8fafc,#e2e8f0)" }}>
                  <img
                    src={offer.image}
                    alt={offer.productName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"; }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top,rgba(0,0,0,0.3),transparent)" }}></div>
                </div>

                {/* Content */}
                <div style={{ padding: "16px 16px 18px" }}>
                  {/* Breadcrumb badges */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#4c9f70", background: "#f0fdf4", padding: "2px 8px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
                      {offer.categoryName}
                    </span>
                    {offer.subcategoryName && (
                      <>
                        <span style={{ color: "#cbd5e1", fontSize: 10 }}>›</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: 20, border: "1px solid #bfdbfe" }}>
                          {offer.subcategoryName}
                        </span>
                      </>
                    )}
                    {/* ✅ variantLabel now always shows when a variant is linked */}
                    {offer.variantLabel && (
                      <div
                        style={{
                          marginTop: 6,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: "#f5f3ff",
                          border: "1px solid #ddd6fe",
                          width: "fit-content"
                        }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#7c3aed" }}>
                          Applied Variant:
                        </span>

                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#5b21b6",
                            maxWidth: 140,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {offer.variantLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {offer.productName}
                  </h3>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 12px", fontWeight: 500 }}>{offer.name}</p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: "#4c9f70" }}>₹{finalPrice.toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: "#cbd5e1", textDecoration: "line-through", fontWeight: 500 }}>₹{offer.price.toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#f97316", fontWeight: 700, margin: "3px 0 0" }}>You save ₹{savings.toLocaleString()}</p>
                    </div>
                    {offer.endDate && (
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Ends</p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", margin: "2px 0 0" }}>
                          {new Date(offer.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden", animation: "slideUp 0.25s ease", maxHeight: "90vh", overflowY: "auto" }}>

            {/* Modal Header */}
            <div style={{ background: "linear-gradient(135deg,#4c9f70,#3a895c)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
              <div>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>Create New Offer</h2>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "4px 0 0" }}>Fill in the details below</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
            </div>

            <div style={{ padding: 24 }}>

              {/* Step breadcrumb */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
                {["Category", "Subcategory", "Product", "Variant", "Details"].map((step, i) => (
                  <React.Fragment key={step}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#4c9f70", background: "#f0fdf4", padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>{step}</div>
                    {i < 4 && <span style={{ color: "#cbd5e1", fontSize: 10 }}>›</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* 1. Category */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Subcategory */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Subcategory{" "}
                  <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  disabled={!formData.category || filteredSubcategories.length === 0}
                  style={!formData.category || filteredSubcategories.length === 0 ? disabledInputStyle : inputStyle}
                >
                  <option value="">
                    {!formData.category
                      ? "Select a category first"
                      : filteredSubcategories.length === 0
                        ? "No subcategories available"
                        : "All Subcategories"}
                  </option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Product */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>
                  Product <span style={{ color: "#ef4444" }}>*</span>
                  <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>
                    ({filteredProducts.length} available)
                  </span>
                </label>
                <select name="productId" value={formData.productId} onChange={handleChange} style={inputStyle}>
                  <option value="">Select Product</option>
                  {filteredProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — ₹{p.price}
                    </option>
                  ))}
                </select>
                {formData.category && filteredProducts.length === 0 && (
                  <p style={{ fontSize: 11, color: "#f97316", margin: "4px 0 0", fontWeight: 600 }}>
                    ⚠ No products found for selected filters
                  </p>
                )}
              </div>

              {/* 4. Variant */}
              {productVariants.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>
                    Variant{" "}
                    <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional — applies to all if skipped)</span>
                  </label>
                  <select name="variantId" value={formData.variantId} onChange={handleChange} style={inputStyle}>
                    <option value="">All Variants</option>
                    {productVariants.map((v) => (
                      <option key={v._id} value={v._id}>
                        {buildVariantLabel(v) || "Variant"}
                        {v.price ? ` (₹${v.price})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 5. Offer Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Offer Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Summer Sale, Flash Deal"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* 6. Tag */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Tag</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["HOT", "NEW", "SALE", "LIMITED"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, tag: t }))}
                      style={{
                        flex: 1, padding: "8px 4px",
                        border: formData.tag === t ? "none" : "1.5px solid #e2e8f0",
                        borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                        background: formData.tag === t
                          ? t === "HOT" ? "linear-gradient(135deg,#f97316,#ea580c)"
                            : t === "NEW" ? "linear-gradient(135deg,#3b82f6,#2563eb)"
                              : t === "SALE" ? "linear-gradient(135deg,#4c9f70,#3a895c)"
                                : "linear-gradient(135deg,#7c3aed,#6d28d9)"
                          : "#f8fafc",
                        color: formData.tag === t ? "#fff" : "#64748b",
                        transition: "all 0.15s",
                      }}
                    >
                      {t === "HOT" ? "🔥" : t === "NEW" ? "✨" : t === "SALE" ? "🏷️" : "⚡"} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 7. Discount % & End Date */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Discount % <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    name="discountPercent"
                    placeholder="e.g. 20"
                    min="1"
                    max="99"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={{ ...inputStyle, color: formData.endDate ? "#1e293b" : "#94a3b8" }}
                  />
                </div>
              </div>

              {/* Live Preview */}
              {formData.productId && formData.discountPercent && (
                <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: "#4c9f70", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>Live Preview</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "4px 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selectedProduct?.name}
                    </p>
                    {/* ✅ Show actual variant label instead of generic "Variant selected" */}
                    {formData.variantId && (
                      <p style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600, margin: 0 }}>
                        {buildVariantLabel(productVariants.find(v => String(v._id) === String(formData.variantId))) || "Variant selected"}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#4c9f70", margin: 0 }}>
                      ₹{getDiscountedPrice(getVariantPrice(), formData.discountPercent).toLocaleString()}
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8", textDecoration: "line-through", margin: "2px 0 0" }}>
                      ₹{getVariantPrice().toLocaleString()}
                    </p>
                    <p style={{ fontSize: 11, color: "#f97316", fontWeight: 700, margin: "2px 0 0" }}>
                      Save ₹{(getVariantPrice() - getDiscountedPrice(getVariantPrice(), formData.discountPercent)).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: 11, border: "1.5px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOffer}
                  style={{ flex: 2, padding: 11, border: "none", borderRadius: 12, background: "linear-gradient(135deg,#4c9f70,#3a895c)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(76,159,112,0.35)" }}
                >
                  ✓ Create Offer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        input:focus, select:focus { border-color:#4c9f70 !important; box-shadow:0 0 0 3px rgba(76,159,112,0.15); }
      `}</style>
    </div>
  );
};

export default OfferPage;