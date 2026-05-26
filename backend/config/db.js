const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
  const useMock = process.env.USE_MOCK_DB === 'true' || !process.env.MONGO_URI;

  if (useMock) {
    console.log('⚠️  [DB] Using local JSON Database fallback storage.');
    global.dbMode = 'mock';
    setupMockDB();
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000 // Quick timeout to fall back fast
    });
    console.log(`🔌 [DB] MongoDB Connected: ${conn.connection.host}`);
    global.dbMode = 'mongodb';
  } catch (error) {
    console.error(`❌ [DB] MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  [DB] Falling back to local JSON Database storage.');
    global.dbMode = 'mock';
    setupMockDB();
  }
};

const setupMockDB = () => {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Define mock collections
  const collections = [
    'users', 'products', 'categories', 'orders', 
    'carts', 'wishlists', 'reviews', 'coupons', 
    'payments', 'notifications', 'sellers'
  ];

  collections.forEach(col => {
    const filePath = path.join(dataDir, `${col}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  });
  console.log('📁 [DB] Local JSON database files verified in backend/data/');
};

module.exports = connectDB;
