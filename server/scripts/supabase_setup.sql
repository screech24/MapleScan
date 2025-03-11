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