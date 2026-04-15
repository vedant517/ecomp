import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const OfferPage = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    discountPercent: "",
    productId: "",
    category: "",
    tag: "HOT",
    endDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offerRes, productRes, categoryRes] = await Promise.all([
          fetch("http://localhost:5000/api/offers"),
          fetch("http://localhost:5000/api/products"),
          fetch("http://localhost:5000/api/categories"),
        ]);

        const offerData = await offerRes.json();
        const productData = await productRes.json();
        const categoryData = await categoryRes.json();

        setOffers(offerData.data || []);
        setProducts(productData.data || []);
        setCategories(categoryData.data || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData((prev) => ({ ...prev, category: value, productId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateOffer = async () => {
    if (!formData.name || !formData.discountPercent || !formData.productId || !formData.endDate) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setOffers([...offers, data.data]);
        setShowForm(false);
        toast.success("Offer created successfully!");
        setFormData({ name: "", discountPercent: "", productId: "", category: "", tag: "HOT", endDate: "" });
      } else {
        toast.error(data.message || "Failed to create offer");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const enrichedOffers = offers.map((offer) => {
    const product = products.find(
      (p) => p._id === offer.productId?._id || p._id === offer.productId
    );
    return {
      ...offer,
      productName: product?.name || "Unknown",
      price: product?.price || 0,
      category:
        product?.category?.name ||
        categories.find((c) => c._id === product?.category)?.name ||
        "Other",
      image:
        product?.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150",
    };
  });

  const categoryTabs = ["All", ...new Set(enrichedOffers.map((o) => o.category))];

  const filteredOffers =
    selectedCategory === "All"
      ? enrichedOffers
      : enrichedOffers.filter((o) => o.category === selectedCategory);

  const filteredProducts = formData.category
    ? products.filter(
        (p) => p.category === formData.category || p.category?._id === formData.category
      )
    : [];

  const getDiscountedPrice = (price, discount) =>
    Math.round(price - (price * discount) / 100);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-0.5px" }}>🏷️ Offers</h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "4px 0 0", fontWeight: 500 }}>Manage and create product offers</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: "linear-gradient(135deg, #4c9f70, #3a895c)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(76,159,112,0.35)", transition: "all 0.2s" }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Create Offer
        </button>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        {categoryTabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "7px 18px",
              borderRadius: 30,
              border: selectedCategory === cat ? "none" : "1.5px solid #e2e8f0",
              background: selectedCategory === cat ? "linear-gradient(135deg, #4c9f70, #3a895c)" : "#fff",
              color: selectedCategory === cat ? "#fff" : "#64748b",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: selectedCategory === cat ? "0 4px 12px rgba(76,159,112,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
              transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── OFFERS GRID ── */}
      {filteredOffers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No offers found</p>
          <p style={{ fontSize: 13 }}>Create your first offer to get started</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {filteredOffers.map((offer) => {
            const finalPrice = getDiscountedPrice(offer.price, offer.discountPercent);
            const savings = offer.price - finalPrice;

            return (
              <div
                key={offer._id}
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                  border: "1px solid #f1f5f9",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  position: "relative",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
              >
                {/* Discount Badge */}
                <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2, background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 20, boxShadow: "0 2px 8px rgba(239,68,68,0.4)", letterSpacing: "0.3px" }}>
                  -{offer.discountPercent}% OFF
                </div>

                {/* Tag Badge */}
                {offer.tag && (
                  <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2, background: offer.tag === "HOT" ? "linear-gradient(135deg,#f97316,#ea580c)" : "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20, letterSpacing: "0.5px" }}>
                    🔥 {offer.tag}
                  </div>
                )}

                {/* Image */}
                <div style={{ position: "relative", height: 190, overflow: "hidden", background: "linear-gradient(135deg, #f8fafc, #e2e8f0)" }}>
                  <img
                    src={offer.image}
                    alt={offer.productName}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                    onError={e => { e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"; }}
                  />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }}></div>
                </div>

                {/* Content */}
                <div style={{ padding: "16px 16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#4c9f70", background: "#f0fdf4", padding: "2px 8px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
                      {offer.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 4px", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden", animation: "slideUp 0.25s ease" }}>

            {/* Modal Header */}
            <div style={{ background: "linear-gradient(135deg, #4c9f70, #3a895c)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>Create New Offer</h2>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "4px 0 0", fontWeight: 500 }}>Fill in the details below</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px" }}>

              {/* Category */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: formData.category ? "#1e293b" : "#94a3b8", outline: "none", background: "#f8fafc", boxSizing: "border-box", appearance: "auto", cursor: "pointer" }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Product</label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  disabled={!formData.category}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: formData.productId ? "#1e293b" : "#94a3b8", outline: "none", background: formData.category ? "#f8fafc" : "#f1f5f9", boxSizing: "border-box", appearance: "auto", cursor: formData.category ? "pointer" : "not-allowed", opacity: formData.category ? 1 : 0.7 }}
                >
                  <option value="">{formData.category ? "Select Product" : "Select category first"}</option>
                  {filteredProducts.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>
                  ))}
                </select>
              </div>

              {/* Offer Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Offer Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Summer Sale, Flash Deal"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
                />
              </div>

              {/* Discount % and End Date side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Discount %</label>
                  <input
                    type="number"
                    name="discountPercent"
                    placeholder="e.g. 20"
                    min="1"
                    max="99"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, color: formData.endDate ? "#1e293b" : "#94a3b8", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: "11px", border: "1.5px solid #e2e8f0", borderRadius: 12, background: "#fff", color: "#64748b", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOffer}
                  style={{ flex: 2, padding: "11px", border: "none", borderRadius: 12, background: "linear-gradient(135deg, #4c9f70, #3a895c)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(76,159,112,0.35)" }}
                >
                  ✓ Create Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus, select:focus {
          border-color: #4c9f70 !important;
          box-shadow: 0 0 0 3px rgba(76,159,112,0.15);
        }
      `}</style>
    </div>
  );
};

export default OfferPage;