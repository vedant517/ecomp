import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);


const checkAllDatabases = async () => {
  try {
    const uri = "mongodb+srv://dbuser:xGBZ3aCGMxPEmOdZ@cluster0.nesjeqr.mongodb.net/?appName=Cluster0";
    await mongoose.connect(uri);
    
    // Get the underlying admin db
    const startObj = mongoose.connection.client;
    const adminDb = startObj.db('admin');
    
    // List databases
    const result = await adminDb.admin().listDatabases();
    console.log("Databases found on your Atlas Cluster:");
    for (const db of result.databases) {
      console.log(`- ${db.name} (size: ${db.sizeOnDisk})`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkAllDatabases();
