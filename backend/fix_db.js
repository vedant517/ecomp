import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './admin/models/Category.js';
import Subcategory from './admin/models/Subcategory.js';
import Brand from './admin/models/Brand.js';
import Product from './admin/models/Product.js';

dotenv.config();

const fixDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const products = await Product.find().lean();
    let updated = 0;

    for (const p of products) {
      let updates = {};

      // Fix Category
      if (typeof p.category === 'string') {
        if (mongoose.Types.ObjectId.isValid(p.category)) {
          updates.category = new mongoose.Types.ObjectId(p.category);
        } else {
          const cat = await Category.findOne({ name: new RegExp('^' + p.category + '$', 'i') });
          if (cat) updates.category = cat._id;
        }
      }

      // Fix Subcategory
      if (typeof p.subcategory === 'string') {
        if (mongoose.Types.ObjectId.isValid(p.subcategory)) {
          updates.subcategory = new mongoose.Types.ObjectId(p.subcategory);
        } else {
          const sub = await Subcategory.findOne({ name: new RegExp('^' + p.subcategory + '$', 'i') });
          if (sub) updates.subcategory = sub._id;
          else {
              console.log('Could not find subcategory for:', p.subcategory);
              // if not found, let's just unset it so it doesn't break the app
              updates.$unset = updates.$unset || {};
              updates.$unset.subcategory = "";
          }
        }
      }

      // Fix Brand
      if (typeof p.brand === 'string') {
        if (mongoose.Types.ObjectId.isValid(p.brand)) {
          updates.brand = new mongoose.Types.ObjectId(p.brand);
        } else {
          const brand = await Brand.findOne({ name: new RegExp('^' + p.brand + '$', 'i') });
          if (brand) updates.brand = brand._id;
          else {
              console.log('Could not find brand for:', p.brand);
              updates.$unset = updates.$unset || {};
              updates.$unset.brand = "";
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        const setUpdates = { ...updates };
        delete setUpdates.$unset;
        
        const updateQuery = {};
        if (Object.keys(setUpdates).length > 0) updateQuery.$set = setUpdates;
        if (updates.$unset && Object.keys(updates.$unset).length > 0) updateQuery.$unset = updates.$unset;

        await mongoose.connection.db.collection('products').updateOne(
          { _id: p._id },
          updateQuery
        );
        updated++;
      }
    }

    console.log(`Updated ${updated} products`);
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
};

fixDb();
