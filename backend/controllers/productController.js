import Product from '../models/Product.js';

export const getProducts = async (req, res) => {
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
      .populate('brand', 'name logo')
      .populate('subcategory', 'name')
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

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPrice, category, subcategory, brand, stock, variants } = req.body;

    if (!name || !description || !price || !category || !stock) {
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
      user: req.user ? req.user.id : undefined,
    };

    // Handle images from upload.fields
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        productData.image = req.files.image[0].path;
        if (!productData.images) productData.images = [];
        productData.images.push({
          url: req.files.image[0].path,
          public_id: req.files.image[0].filename || Date.now().toString()
        });
      }
      if (req.files.images && req.files.images.length > 0) {
        const additionalImages = req.files.images.map(file => ({
          url: file.path,
          public_id: file.filename || Date.now().toString()
        }));
        if (!productData.images) productData.images = [];
        productData.images = [...productData.images, ...additionalImages];
        if (!productData.image) productData.image = productData.images[0].url;
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
      .populate('subcategory', 'name');
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
    
    // Parse variants
    if (updateData.variants && typeof updateData.variants === 'string') {
      updateData.variants = JSON.parse(updateData.variants);
    }

    // Handle images from upload.fields
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) {
        updateData.image = req.files.image[0].path;
        if (!updateData.images) updateData.images = [];
        updateData.images.push({
          url: req.files.image[0].path,
          public_id: req.files.image[0].filename || Date.now().toString()
        });
      }
      if (req.files.images && req.files.images.length > 0) {
        const additionalImages = req.files.images.map(file => ({
          url: file.path,
          public_id: file.filename || Date.now().toString()
        }));
        if (!updateData.images) updateData.images = [];
        updateData.images = [...updateData.images, ...additionalImages];
        if (!updateData.image) updateData.image = updateData.images[0].url;
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
