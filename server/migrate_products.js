
const mongoose = require('mongoose');
require('dotenv').config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const cats = await db.collection('categories').find({}).toArray();
    const standaloneSubs = await db.collection('subcategories').find({}).toArray();

    // Map names to primary (standalone) IDs
    const sMap = {};
    standaloneSubs.forEach(s => sMap[s.name.toLowerCase()] = s._id);
    
    // Hardcoded synonyms
    sMap['mobiles'] = sMap['mobile phones'];
    
    // Map IDs (embedded or standalone) to names
    const idToName = {};
    standaloneSubs.forEach(s => idToName[s._id.toString()] = s.name.toLowerCase());
    cats.forEach(c => {
      if(c.subcategories) {
        c.subcategories.forEach(sub => {
          idToName[sub._id.toString()] = sub.name.toLowerCase();
        });
      }
    });

    const products = await db.collection('products').find({}).toArray();
    let count = 0;
    let missingSub = 0;
    
    for(const p of products) {
      const currentSubId = p.subcategory?.toString();
      if(!currentSubId) {
        missingSub++;
        continue;
      }

      const subName = idToName[currentSubId];
      if(subName) {
        const primaryId = sMap[subName];
        if(primaryId && primaryId.toString() !== currentSubId) {
          console.log(`Updating product "${p.name}": ${currentSubId} (${subName}) -> ${primaryId} (Primary)`);
          await db.collection('products').updateOne(
            {_id: p._id}, 
            { $set: { subcategory: primaryId.toString() } }
          );
          count++;
        }
      }
    }

    console.log('Migration finished.');
    console.log('Updated', count, 'products.');
    console.log('Products missing subcategory:', missingSub);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
