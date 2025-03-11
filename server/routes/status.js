const express = require('express');
const router = express.Router();
const DatabaseStatus = require('../models/DatabaseStatus');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// Get database status
router.get('/', async (req, res) => {
  try {
    // Get the status document or create it if it doesn't exist
    let status = await DatabaseStatus.getMain();
    
    if (!status) {
      // Create initial status
      status = await DatabaseStatus.createInitial();
      
      if (!status) {
        throw new Error('Failed to create initial database status');
      }
      
      // Count products
      const productCount = await Product.count();
      const canadianProductCount = await Product.countCanadian();
      
      // Update counts
      status = await DatabaseStatus.update({
        product_count: productCount,
        canadian_product_count: canadianProductCount
      });
    }
    
    logger.info('Database status retrieved');
    
    return res.json({
      status: status.status,
      lastUpdate: status.last_update,
      productCount: status.product_count,
      canadianProductCount: status.canadian_product_count,
      message: status.message
    });
  } catch (error) {
    logger.error('Error getting database status:', error);
    return res.status(500).json({ 
      error: 'Error getting database status',
      message: error.message 
    });
  }
});

module.exports = router; 