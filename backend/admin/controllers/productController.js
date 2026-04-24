import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
  try {
    const { category, subcategory, search, sort, page = 1, limit = 20 } = req.query;

    let query = {};
    const mongoose = (await import('mongoose')).default;

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const Category = mongoose.model('Category');
        const cat = await Category.findOne({ name: category });
        if (cat) query.category = cat._id;
        else query.category = new mongoose.Types.ObjectId(); // No match, force empty result
      }
    }

    if (subcategory) {
      if (mongoose.Types.ObjectId.isValid(subcategory)) {
        query.subcategory = subcategory;
      } else {
        const Subcategory = mongoose.model('Subcategory');
        const sub = await Subcategory.findOne({ name: subcategory });
        if (sub) query.subcategory = sub._id;
        else query.subcategory = new mongoose.Types.ObjectId(); // No match, force empty result
      }
    }

    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    let sortOpt = { createdAt: -1 };
    if (sort === 'price_asc') sortOpt = { price: 1 };
    if (sort === 'price_desc') sortOpt = { price: -1 };
    if (sort === 'rating') sortOpt = { ratings: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('brand', 'name logo')
      .populate('subcategory', 'name')
      .sort(sortOpt)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }

};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, subcategory, brand, stock, variants } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, category and stock',
      });
    }

    const productData = {
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      category,
      subcategory,
      brand,
      stock: Number(stock),
      variants: variants ? (typeof variants === 'string' ? JSON.parse(variants) : variants) : [],
      isFeatured: req.body.isFeatured === 'true',
      taxIncluded: req.body.taxIncluded === 'true',
      user: req.user ? req.user.id : undefined,
    };

    // Clean up empty strings for optional references to avoid Mongoose CastError
    if (productData.brand === '') delete productData.brand;
    if (productData.subcategory === '') delete productData.subcategory;

    // Handle images from upload.any()
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'image') {
          productData.image = file.path;
          if (!productData.images) productData.images = [];
          productData.images.push({
            url: file.path,
            public_id: file.filename || Date.now().toString()
          });
        } else if (file.fieldname === 'images') {
          if (!productData.images) productData.images = [];
          productData.images.push({
            url: file.path,
            public_id: file.filename || Date.now().toString()
          });
        } else if (file.fieldname.startsWith('variantImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1]);
          if (productData.variants && productData.variants[idx]) {
            productData.variants[idx].image = file.path;
          }
        }
      });

      // Ensure primary image is set
      if (!productData.image && productData.images && productData.images.length > 0) {
        productData.image = productData.images[0].url;
      }
    }

    const product = await Product.create(productData);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('brand', 'name logo')
      .populate('subcategory', 'name')
      .lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = { ...req.body };
    
    // Convert types
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.discountPrice) updateData.discountPrice = Number(updateData.discountPrice);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    if (updateData.isFeatured) updateData.isFeatured = updateData.isFeatured === 'true';
    if (updateData.taxIncluded) updateData.taxIncluded = updateData.taxIncluded === 'true';
    
    // Parse variants
    if (updateData.variants && typeof updateData.variants === 'string') {
      updateData.variants = JSON.parse(updateData.variants);
    }

    // Clean up empty strings for optional references to avoid Mongoose CastError
    if (updateData.brand === '') updateData.brand = null;
    if (updateData.subcategory === '') updateData.subcategory = null;

    // Handle images from upload.any()
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (file.fieldname === 'image') {
          updateData.image = file.path;
          if (!updateData.images) updateData.images = [];
          updateData.images.push({
            url: file.path,
            public_id: file.filename || Date.now().toString()
          });
        } else if (file.fieldname === 'images') {
          if (!updateData.images) updateData.images = [];
          updateData.images.push({
            url: file.path,
            public_id: file.filename || Date.now().toString()
          });
        } else if (file.fieldname.startsWith('variantImage_')) {
          const idx = parseInt(file.fieldname.split('_')[1]);
          if (updateData.variants && updateData.variants[idx]) {
            updateData.variants[idx].image = file.path;
          }
        }
      });

      // Update primary image if new one uploaded
      if (!updateData.image && updateData.images && updateData.images.length > 0) {
        // Only set if not already present or if we want to force update
        // (usually if a new main image was uploaded via 'image' field, it's already set)
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name')
      .populate('brand', 'name logo')
      .populate('subcategory', 'name');

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    await product.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed' });
    }

    const review = {
      name: req.user.name || 'Anonymous',
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numOfReviews = product.reviews.length;

    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
