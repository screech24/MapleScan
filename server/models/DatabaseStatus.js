const supabase = require('../utils/supabase');
const logger = require('../utils/logger');

class DatabaseStatus {
  /**
   * Get the main database status
   * @returns {Promise<Object|null>} - The database status or null if not found
   */
  static async getMain() {
    try {
      const { data, error } = await supabase
        .from('database_status')
        .select('*')
        .eq('key', 'main')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting main database status:', error.message);
      return null;
    }
  }

  /**
   * Update the database status
   * @param {Object} statusData - The status data to update
   * @returns {Promise<Object|null>} - The updated status or null if failed
   */
  static async update(statusData) {
    try {
      // Add timestamp
      statusData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('database_status')
        .update(statusData)
        .eq('key', 'main')
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error updating database status:', error.message);
      return null;
    }
  }

  /**
   * Create initial database status if it doesn't exist
   * @returns {Promise<Object|null>} - The created status or null if failed
   */
  static async createInitial() {
    try {
      // Check if status already exists
      const existing = await this.getMain();
      if (existing) return existing;

      // Create initial status
      const initialStatus = {
        key: 'main',
        status: 'ok',
        last_update: new Date().toISOString(),
        product_count: 0,
        canadian_product_count: 0,
        message: 'Initial database setup',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('database_status')
        .insert(initialStatus)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating initial database status:', error.message);
      return null;
    }
  }
}

module.exports = DatabaseStatus; 