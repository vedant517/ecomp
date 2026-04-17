import mongoose from 'mongoose';
const uri = 'mongodb://dbuser:xGBZ3aCGMxPEmOdZ@ac-ose4yvc-shard-00-00.nesjeqr.mongodb.net:27017,ac-ose4yvc-shard-00-01.nesjeqr.mongodb.net:27017,ac-ose4yvc-shard-00-02.nesjeqr.mongodb.net:27017/ecommerce?ssl=true&replicaSet=atlas-aii4ni-shard-0&authSource=admin&retryWrites=true&w=majority';
mongoose.connect(uri).then(()=> {
  console.log('Connected via standard string');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
})
