require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const DatabaseStatus = require('../models/DatabaseStatus');
const logger = require('../utils/logger');

// Base URL for Open Food Facts API
const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0';

// Create axios instance
const api = axios.create({
  baseURL: OPEN_FOOD_FACTS_API,
});

// Connect to MongoDB if not already connected
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maplescan';
    
    try {
      await mongoose.connect(MONGODB_URI);
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error('Error connecting to MongoDB:', error.message);
      throw error;
    }
  }
};

// Update database status
const updateStatus = async (statusData) => {
  try {
    let status = await DatabaseStatus.findOne({ key: 'main' });
    
    if (!status) {
      status = new DatabaseStatus({ key: 'main' });
    }
    
    // Update fields
    Object.keys(statusData).forEach(key => {
      status[key] = statusData[key];
    });
    
    await status.save();
    logger.info('Database status updated:', statusData);
  } catch (error) {
    logger.error('Error updating database status:', error);
  }
};

// Fetch Canadian products in batches
const fetchCanadianProducts = async (page = 1, pageSize = 100) => {
  try {
    logger.info(`Fetching Canadian products (page ${page})`);
    const response = await api.get(`/search?countries=Canada&json=true&page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching Canadian products (page ${page}):`, error.message);
    return null;
  }
};

// Fetch popular products in batches
const fetchPopularProducts = async (page = 1, pageSize = 100) => {
  try {
    logger.info(`Fetching popular products (page ${page})`);
    const response = await api.get(`/search?sort_by=popularity&json=true&page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching popular products (page ${page}):`, error.message);
    return null;
  }
};

// Store products in the database
const storeProducts = async (products) => {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return 0;
  }
  
  let savedCount = 0;
  
  for (const product of products) {
    if (!product || !product.code) continue;
    
    try {
      // Check if product already exists
      const existingProduct = await Product.findOne({ code: product.code });
      
      if (existingProduct) {
        // Update existing product
        Object.keys(product).forEach(key => {
          existingProduct[key] = product[key];
        });
        
        existingProduct.lastUpdated = new Date();
        await existingProduct.save();
      } else {
        // Create new product
        const newProduct = new Product(product);
        await newProduct.save();
      }
      
      savedCount++;
    } catch (error) {
      logger.error(`Error saving product ${product.code}:`, error.message);
    }
  }
  
  return savedCount;
};

// Main sync function
const syncDatabase = async () => {
  try {
    await connectDB();
    
    // Update status to 'updating'
    await updateStatus({
      status: 'updating',
      message: 'Database sync in progress'
    });
    
    // Fetch Canadian products (first 10 pages)
    let allProducts = [];
    const maxCanadianPages = 10;
    
    for (let page = 1; page <= maxCanadianPages; page++) {
      const result = await fetchCanadianProducts(page);
      
      if (result && result.products && result.products.length > 0) {
        allProducts = [...allProducts, ...result.products];
        logger.info(`Fetched ${result.products.length} Canadian products from page ${page}`);
      } else {
        break; // No more products or error
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Fetch popular products (first 10 pages)
    const maxPopularPages = 10;
    
    for (let page = 1; page <= maxPopularPages; page++) {
      const result = await fetchPopularProducts(page);
      
      if (result && result.products && result.products.length > 0) {
        // Filter out duplicates
        const newProducts = result.products.filter(
          product => !allProducts.some(p => p.code === product.code)
        );
        
        allProducts = [...allProducts, ...newProducts];
        logger.info(`Fetched ${newProducts.length} unique popular products from page ${page}`);
      } else {
        break; // No more products or error
      }
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Store products in the database
    logger.info(`Storing ${allProducts.length} products in the database`);
    const savedCount = await storeProducts(allProducts);
    
    // Count products
    const productCount = await Product.countDocuments();
    const canadianProductCount = await Product.countDocuments({ isCanadian: true });
    
    // Update status to 'ok'
    await updateStatus({
      status: 'ok',
      lastUpdate: new Date(),
      productCount,
      canadianProductCount,
      message: `Successfully synced ${savedCount} products`
    });
    
    logger.info(`Database sync completed. Saved ${savedCount} products.`);
    return true;
  } catch (error) {
    logger.error('Error syncing database:', error);
    
    // Update status to 'error'
    await updateStatus({
      status: 'error',
      message: 'Database sync failed',
      error: error.message
    });
    
    return false;
  }
};

// If script is run directly, execute sync
if (require.main === module) {
  syncDatabase()
    .then(() => {
      logger.info('Sync script completed');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Sync script failed:', error);
      process.exit(1);
    });
}

module.exports = { syncDatabase }; 