require('dotenv').config();
const supabase = require('../utils/supabase');
const logger = require('../utils/logger');

/**
 * Set up Supabase database schema
 */
const setupSupabase = async () => {
  try {
    logger.info('Setting up Supabase database schema...');

    // Check if tables exist by querying them
    logger.info('Checking if tables exist...');

    // First check if the database_status table already has a 'main' record
    const { data: existingStatus, error: checkError } = await supabase
      .from('database_status')
      .select('*')
      .eq('key', 'main')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist - we need to create it in the Supabase dashboard
      logger.error('Tables do not exist. Please create them manually in the Supabase dashboard.');
      logger.info(`
        Please go to the Supabase dashboard at https://app.supabase.com/
        Navigate to your project > SQL Editor > New Query
        
        Run the following SQL:
        
        -- Create products table
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          barcode TEXT UNIQUE,
          name TEXT NOT NULL,
          brand TEXT,
          image_url TEXT,
          category TEXT,
          description TEXT,
          ingredients TEXT,
          is_canadian BOOLEAN DEFAULT FALSE,
          canadian_factors JSONB,
          data_sources JSONB,
          user_contributed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
        CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
        CREATE INDEX IF NOT EXISTS idx_products_is_canadian ON products(is_canadian);
        
        -- Create database_status table
        CREATE TABLE IF NOT EXISTS database_status (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          key TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'ok',
          last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          product_count INTEGER DEFAULT 0,
          canadian_product_count INTEGER DEFAULT 0,
          message TEXT,
          error TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert default status
        INSERT INTO database_status (key, status, product_count, canadian_product_count)
        VALUES ('main', 'ok', 0, 0)
        ON CONFLICT (key) DO NOTHING;
      `);
      return;
    } else if (checkError) {
      logger.error('Error checking database status:', checkError.message);
      return;
    }

    // If we already have a 'main' record, no need to insert a new one
    if (existingStatus && existingStatus.length > 0) {
      logger.info('Database status record already exists, skipping creation');
    } else {
      // Create initial database status
      try {
        // Try to insert the initial status record
        const { error } = await supabase
          .from('database_status')
          .insert({
            key: 'main',
            status: 'ok',
            last_update: new Date().toISOString(),
            product_count: 0,
            canadian_product_count: 0,
            message: 'Initial database setup',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();

        if (error) {
          logger.error('Error creating initial database status:', error.message);
        } else {
          logger.info('Initial database status created successfully');
        }
      } catch (error) {
        logger.error('Error creating database status:', error.message);
      }
    }

    logger.info('Supabase setup completed');
  } catch (error) {
    logger.error('Error setting up Supabase:', error.message);
    process.exit(1);
  }
};

// Run the setup if this script is executed directly
if (require.main === module) {
  setupSupabase()
    .then(() => {
      logger.info('Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupSupabase }; 