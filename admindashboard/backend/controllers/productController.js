const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { category, subcategory, search, sort, page = 1, limit = 20 } = req.query;

    let query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    let sortOpt = { createdAt: -1 };
    if (sort === 'price_asc') sortOpt = { price: 1 };
    if (sort === 'price_desc') sortOpt = { price: -1 };
    if (sort === 'rating') sortOpt = { ratings: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('brand', 'name')
      .sort(sortOpt)
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      subcategory, 
      brand, 
      stock, 
      variants 
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, price, and category',
      });
    }

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      subcategory: subcategory || undefined,
      brand: brand || undefined,
      stock: Number(stock) || 0,
      variants: variants ? (typeof variants === 'string' ? JSON.parse(variants) : variants) : [],
      user: req.user ? req.user.id : undefined,
    };

    // Handle multiple images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename || Date.now().toString()
      }));
    }

    const product = await Product.create(productData);

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .populate('brand', 'name');
      
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = { ...req.body };
    
    // Parse variants if sent as string
    if (updateData.variants && typeof updateData.variants === 'string') {
      updateData.variants = JSON.parse(updateData.variants);
    }

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename || Date.now().toString()
      }));
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
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
