const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// ==============================
// ✅ GET ALL CATEGORIES
// ==============================
router.get("/", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const categories = await Category.find({ }).lean();
    
    // Fetch all subcategories from the standalone collection
    const allSubcats = await mongoose.connection.db
      .collection("subcategories")
      .find({})
      .toArray();

    // Map subcategories by category ID
    const subcatMap = {};
    allSubcats.forEach(sub => {
      const catId = sub.category?.toString();
      if (catId) {
        if (!subcatMap[catId]) subcatMap[catId] = new Map();
        subcatMap[catId].set(sub._id.toString(), sub);
      }
    });

    // Merge them into each category's subcategories array
    const enrichedCategories = categories.map(cat => {
      const catId = cat._id.toString();
      const existingSubs = cat.subcategories || [];
      const subMap = new Map(); // Key: lowercase name
      
      // Standalone subcategories (Primary source)
      const standaloneSubs = subcatMap[catId] || new Map();
      standaloneSubs.forEach(sub => {
        subMap.set(sub.name.toLowerCase(), sub);
      });

      // Embedded subcategories (Fallback)
      existingSubs.forEach(sub => {
        const nameKey = sub.name.toLowerCase();
        if (!subMap.has(nameKey)) {
          subMap.set(nameKey, sub);
        }
      });
      
      return {
        ...cat,
        subcategories: Array.from(subMap.values())
      };
    });

    res.json({
      success: true,
      data: enrichedCategories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: [],
    });
  }
});

// ==============================
// ✅ GET CATEGORY BY SLUG
// ==============================
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const mongoose = require("mongoose");
    const subcategories = await mongoose.connection.db
      .collection("subcategories")
      .find({ category: category._id })
      .toArray();

    const subMap = new Map();
    subcategories.forEach(s => subMap.set(s.name.toLowerCase(), s));
    if (category.subcategories) {
      category.subcategories.forEach(s => {
        const nameKey = s.name.toLowerCase();
        if (!subMap.has(nameKey)) subMap.set(nameKey, s);
      });
    }
    category.subcategories = Array.from(subMap.values());

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("GET CATEGORY BY SLUG ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==============================
// ✅ GET CATEGORY BY ID
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const mongoose = require("mongoose");
    const subcategories = await mongoose.connection.db
      .collection("subcategories")
      .find({ category: new mongoose.Types.ObjectId(id) })
      .toArray();

    const subMap = new Map();
    subcategories.forEach(s => subMap.set(s.name.toLowerCase(), s));
    if (category.subcategories) {
      category.subcategories.forEach(s => {
        const nameKey = s.name.toLowerCase();
        if (!subMap.has(nameKey)) subMap.set(nameKey, s);
      });
    }
    category.subcategories = Array.from(subMap.values());

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==============================
// ✅ GET SUBCATEGORIES
// ==============================
router.get("/:id/subcategories", async (req, res) => {
  try {
    const { id } = req.params;
    const mongoose = require("mongoose");
    const subcategories = await mongoose.connection.db
      .collection("subcategories")
      .find({ category: new mongoose.Types.ObjectId(id) })
      .toArray();

    // If there are embedded subcategories as fallback, we can also fetch them and merge,
    // but the subcategories collection is the primary source of truth.
    const category = await Category.findById(id).lean();
    let result = subcategories;
    if (category && category.subcategories && category.subcategories.length > 0) {
      // Merge unique by Name
      const subMap = new Map();
      subcategories.forEach((s) => subMap.set(s.name.toLowerCase(), s));
      category.subcategories.forEach((s) => {
        const nameKey = s.name.toLowerCase();
        if (!subMap.has(nameKey)) {
          subMap.set(nameKey, s);
        }
      });
      result = Array.from(subMap.values());
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET SUBCATEGORIES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: [],
    });
  }
});

module.exports = router;
