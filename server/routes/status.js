const express = require('express');
const router = express.Router();
const DatabaseStatus = require('../models/DatabaseStatus');
const Product = require('../models/Product');
const logger = require('../utils/logger');

// Get database status
router.get('/', async (req, res) => {
  try {
    // Get the status document or create it if it doesn't exist
    let status = await DatabaseStatus.findOne({ key: 'main' });
    
    if (!status) {
      // Create initial status
      status = new DatabaseStatus({ key: 'main' });
      
      // Count products
      const productCount = await Product.countDocuments();
      const canadianProductCount = await Product.countDocuments({ isCanadian: true });
      
      status.productCount = productCount;
      status.canadianProductCount = canadianProductCount;
      
      await status.save();
    }
    
    logger.info('Database status retrieved');
    
    return res.json({
      status: status.status,
      lastUpdate: status.lastUpdate,
      productCount: status.productCount,
      canadianProductCount: status.canadianProductCount,
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