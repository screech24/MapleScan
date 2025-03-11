const supabase = require('../utils/supabase');
const logger = require('../utils/logger');

class Product {
  /**
   * Get a product by barcode
   * @param {string} barcode - The product barcode
   * @returns {Promise<Object|null>} - The product or null if not found
   */
  static async getByBarcode(barcode) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`Error getting product by barcode ${barcode}:`, error.message);
      return null;
    }
  }

  /**
   * Search products by name or brand
   * @param {string} query - The search query
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array>} - Array of products
   */
  static async search(query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error searching products with query "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Search Canadian products
   * @param {string} query - The search query
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array>} - Array of Canadian products
   */
  static async searchCanadian(query, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_canadian', true)
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error(`Error searching Canadian products with query "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Create or update a product
   * @param {Object} productData - The product data
   * @returns {Promise<Object|null>} - The created/updated product or null if failed
   */
  static async createOrUpdate(productData) {
    try {
      // Add timestamps
      const now = new Date().toISOString();
      productData.updated_at = now;
      
      // If barcode exists, update the product
      if (productData.barcode) {
        const existing = await this.getByBarcode(productData.barcode);
        
        if (existing) {
          // Update existing product
          const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('barcode', productData.barcode)
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      }
      
      // Create new product
      productData.created_at = now;
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating/updating product:', error.message);
      return null;
    }
  }

  /**
   * Count all products
   * @returns {Promise<number>} - The count of products
   */
  static async count() {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error counting products:', error.message);
      return 0;
    }
  }

  /**
   * Count Canadian products
   * @returns {Promise<number>} - The count of Canadian products
   */
  static async countCanadian() {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_canadian', true);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      logger.error('Error counting Canadian products:', error.message);
      return 0;
    }
  }
}

module.exports = Product; 