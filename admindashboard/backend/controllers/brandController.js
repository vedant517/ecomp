const Brand = require('../models/Brand');

exports.getBrands = async (req, res) => {
  try {
    let query = {};
    if (req.query.category) {
      query.categories = req.query.category;
    }
    const brands = await Brand.find(query);
    res.status(200).json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { name, description, logo, categories } = req.body;
    const slug = name.toLowerCase().split(' ').join('-');
    
    const brand = await Brand.create({ 
      name, 
      description, 
      logo,
      categories: categories || [],
      slug 
    });
    
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    let brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().split(' ').join('-');
    }

    brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    await brand.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
