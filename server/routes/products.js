const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const logger = require('../utils/logger');

// Search products
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required' 
      });
    }
    
    // Use text search with fallback to regex
    const products = await Product.find({
      $or: [
        { $text: { $search: query } },
        { product_name: { $regex: query, $options: 'i' } },
        { brands: { $regex: query, $options: 'i' } },
        { categories: { $regex: query, $options: 'i' } }
      ]
    }).limit(50);
    
    logger.info(`Search query "${query}" returned ${products.length} results`);
    
    return res.json({ products });
  } catch (error) {
    logger.error('Error searching products:', error);
    return res.status(500).json({ 
      error: 'Error searching products',
      message: error.message 
    });
  }
});

// Search Canadian products
router.get('/search/canadian', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query parameter is required' 
      });
    }
    
    // Use text search with fallback to regex, filtered for Canadian products
    const products = await Product.find({
      isCanadian: true,
      $or: [
        { $text: { $search: query } },
        { product_name: { $regex: query, $options: 'i' } },
        { brands: { $regex: query, $options: 'i' } },
        { categories: { $regex: query, $options: 'i' } }
      ]
    }).limit(50);
    
    logger.info(`Canadian search query "${query}" returned ${products.length} results`);
    
    return res.json({ products });
  } catch (error) {
    logger.error('Error searching Canadian products:', error);
    return res.status(500).json({ 
      error: 'Error searching Canadian products',
      message: error.message 
    });
  }
});

// Get product by barcode
router.get('/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const product = await Product.findOne({ code: barcode });
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found' 
      });
    }
    
    logger.info(`Retrieved product with barcode ${barcode}`);
    
    return res.json({ product });
  } catch (error) {
    logger.error(`Error getting product with barcode ${req.params.barcode}:`, error);
    return res.status(500).json({ 
      error: 'Error getting product',
      message: error.message 
    });
  }
});

// Get Canadian alternatives for a product
router.get('/alternatives/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    
    // Find the original product
    const originalProduct = await Product.findOne({ code: barcode });
    
    if (!originalProduct) {
      return res.status(404).json({ 
        error: 'Original product not found' 
      });
    }
    
    // Extract categories and brand
    const categories = originalProduct.categories ? 
      originalProduct.categories.split(',').map(c => c.trim()) : [];
    
    const brand = originalProduct.brands ? 
      originalProduct.brands.split(',').map(b => b.trim())[0] : null;
    
    // Build query for alternatives
    const query = {
      isCanadian: true,
      code: { $ne: barcode } // Exclude the original product
    };
    
    // Add category filter if available
    if (categories.length > 0) {
      const categoryRegexes = categories.map(category => 
        new RegExp(category, 'i')
      );
      
      query.$or = [
        { categories: { $in: categoryRegexes } }
      ];
      
      // Add brand as an optional filter
      if (brand) {
        query.$or.push({ brands: { $regex: brand, $options: 'i' } });
      }
    } else if (brand) {
      // If no categories, just use brand
      query.brands = { $regex: brand, $options: 'i' };
    }
    
    // Find alternatives
    const alternatives = await Product.find(query).limit(6);
    
    logger.info(`Found ${alternatives.length} Canadian alternatives for product ${barcode}`);
    
    return res.json({ products: alternatives });
  } catch (error) {
    logger.error(`Error getting alternatives for product ${req.params.barcode}:`, error);
    return res.status(500).json({ 
      error: 'Error getting alternatives',
      message: error.message 
    });
  }
});

module.exports = router; 