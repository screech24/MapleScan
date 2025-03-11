require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const { syncDatabase } = require('./scripts/syncDatabase');
const logger = require('./utils/logger');

// Import routes
const productRoutes = require('./routes/products');
const statusRoutes = require('./routes/status');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maplescan';

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  });

// Routes
app.use('/api/products', productRoutes);
app.use('/api/status', statusRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Schedule nightly database sync at 2 AM
cron.schedule('0 2 * * *', async () => {
  logger.info('Starting scheduled database sync');
  try {
    await syncDatabase();
    logger.info('Scheduled database sync completed successfully');
  } catch (error) {
    logger.error('Scheduled database sync failed:', error.message);
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 