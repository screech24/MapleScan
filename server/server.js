require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { syncDatabase } = require('./scripts/syncDatabase');
const logger = require('./utils/logger');
const supabase = require('./utils/supabase');
const { setupSupabase } = require('./scripts/setupSupabase');

// Import routes
const productRoutes = require('./routes/products');
const statusRoutes = require('./routes/status');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from the React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Supabase
const initializeSupabase = async () => {
  try {
    // Test Supabase connection with a simpler query
    const { data, error } = await supabase.from('database_status').select('key').limit(1);
    
    if (error) {
      logger.error('Error connecting to Supabase:', error.message);
      
      // Try to set up the database schema
      logger.info('Attempting to set up Supabase database schema...');
      await setupSupabase();
    } else {
      logger.info('Connected to Supabase successfully');
      
      // If we have data but it's empty, we might need to set up the database
      if (!data || data.length === 0) {
        logger.info('Database exists but appears to be empty. Setting up schema...');
        await setupSupabase();
      } else {
        logger.info('Database schema already exists');
      }
    }
  } catch (error) {
    logger.error('Error initializing Supabase:', error.message);
    process.exit(1);
  }
};

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
(async () => {
  try {
    await initializeSupabase();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
})(); 