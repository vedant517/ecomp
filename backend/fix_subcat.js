import mongoose from 'mongoose';

const run = async () => {
  try {
    await mongoose.connect('mongodb://dbuser:xGBZ3aCGMxPEmOdZ@ac-ose4yvc-shard-00-00.nesjeqr.mongodb.net:27017,ac-ose4yvc-shard-00-01.nesjeqr.mongodb.net:27017,ac-ose4yvc-shard-00-02.nesjeqr.mongodb.net:27017/?ssl=true&replicaSet=atlas-aii4ni-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected');
    const db = mongoose.connection.db;
    const catDoc = await db.collection('categories').findOne({ name: 'Electronics' });
    if(catDoc) {
      const res = await db.collection('products').updateMany(
        { category: catDoc._id, subcategory: { $exists: false } },
        { $set: { subcategory: new mongoose.Types.ObjectId('69dddbb1b17b6774ee11ac70') } }
      );
      console.log('Updated', res.modifiedCount, 'products');
    }
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
};

run();
