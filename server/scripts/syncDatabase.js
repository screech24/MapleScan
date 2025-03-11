require('dotenv').config();
const axios = require('axios');
const Product = require('../models/Product');
const DatabaseStatus = require('../models/DatabaseStatus');
const logger = require('../utils/logger');

// Base URL for Open Food Facts API
const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0';

// Create axios instance
const api = axios.create({
  baseURL: OPEN_FOOD_FACTS_API,
});

// Update database status
const updateStatus = async (statusData) => {
  try {
    return await DatabaseStatus.update(statusData);
  } catch (error) {
    logger.error('Error updating database status:', error);
    return null;
  }
};

// Fetch Canadian products from Open Food Facts
const fetchCanadianProducts = async (page = 1, pageSize = 100) => {
  try {
    const response = await api.get(`/search?countries_tags=en:canada&page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching Canadian products (page ${page}):`, error.message);
    return null;
  }
};

// Fetch popular products from Open Food Facts
const fetchPopularProducts = async (page = 1, pageSize = 100) => {
  try {
    const response = await api.get(`/search?sort_by=popularity&page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching popular products (page ${page}):`, error.message);
    return null;
  }
};

// Store products in the database
const storeProducts = async (products) => {
  let savedCount = 0;
  
  for (const product of products) {
    try {
      // Convert Open Food Facts product to our schema
      const productData = {
        barcode: product.code,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        image_url: product.image_url || '',
        category: product.categories || '',
        description: product.generic_name || '',
        ingredients: product.ingredients_text || '',
        is_canadian: false, // Will be determined below
        canadian_factors: {
          countries: product.countries && product.countries.toLowerCase().includes('canada'),
          manufacturing: product.manufacturing_places && product.manufacturing_places.toLowerCase().includes('canada'),
          origins: product.origins && product.origins.toLowerCase().includes('canada')
        },
        data_sources: {
          source: 'open_food_facts',
          last_updated: new Date().toISOString()
        }
      };
      
      // Determine if product is Canadian
      productData.is_canadian = Object.values(productData.canadian_factors).some(value => value === true);
      
      // Save product to database
      const savedProduct = await Product.createOrUpdate(productData);
      
      if (savedProduct) {
        savedCount++;
      }
    } catch (error) {
      logger.error(`Error storing product ${product.code}:`, error.message);
    }
  }
  
  return savedCount;
};

// Main sync function
const syncDatabase = async () => {
  try {
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
    const productCount = await Product.count();
    const canadianProductCount = await Product.countCanadian();
    
    // Update status to 'ok'
    await updateStatus({
      status: 'ok',
      last_update: new Date().toISOString(),
      product_count: productCount,
      canadian_product_count: canadianProductCount,
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

// Run the sync if this script is executed directly
if (require.main === module) {
  syncDatabase()
    .then(() => {
      logger.info('Sync completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncDatabase }; 