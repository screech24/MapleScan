import axios from 'axios';

// Base URL for Open Food Facts API
const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v0';

// Base URL for our backend API (to be deployed)
const BACKEND_API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

// Create axios instance for Open Food Facts API
const openFoodApi = axios.create({
  baseURL: OPEN_FOOD_FACTS_API,
  // Removed all headers to prevent CORS preflight requests
});

// Create axios instance for our backend API
const backendApi = axios.create({
  baseURL: BACKEND_API,
});

// Search products by query - expanded to include more than just food products
export const searchProducts = async (query) => {
  try {
    // Use our backend API for searching products
    const response = await backendApi.get(`/products/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    
    // Fall back to Open Food Facts API if our backend fails
    try {
      const fallbackResponse = await openFoodApi.get(`/search?search_terms=${encodeURIComponent(query)}&json=true&page_size=50`);
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback search failed:', fallbackError);
      throw error; // Throw the original error
    }
  }
};

// Get product by barcode
export const getProductByBarcode = async (barcode) => {
  try {
    // Try our backend API first
    const response = await backendApi.get(`/products/${barcode}`);
    return response.data;
  } catch (error) {
    console.error('Error getting product by barcode from backend:', error);
    
    // Fall back to Open Food Facts API
    try {
      const fallbackResponse = await openFoodApi.get(`/product/${barcode}.json`);
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback barcode lookup failed:', fallbackError);
      throw error; // Throw the original error
    }
  }
};

// Search for Canadian products
export const searchCanadianProducts = async (query) => {
  try {
    // Use our backend API for searching Canadian products
    const response = await backendApi.get(`/products/search/canadian?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching Canadian products:', error);
    
    // Fall back to Open Food Facts API
    try {
      const fallbackResponse = await openFoodApi.get(`/search?search_terms=${encodeURIComponent(query)}&countries=Canada&json=true&page_size=50`);
      
      // Additional filtering to ensure products are actually Canadian
      if (fallbackResponse.data && fallbackResponse.data.products) {
        fallbackResponse.data.products = fallbackResponse.data.products.filter(p => 
          p.countries && p.countries.toLowerCase().includes('canada')
        );
      }
      
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback Canadian search failed:', fallbackError);
      throw error; // Throw the original error
    }
  }
};

// Get product alternatives (products in the same category but made in Canada)
export const getCanadianAlternatives = async (product) => {
  if (!product) return { products: [] };
  
  try {
    // Use our backend API for finding alternatives
    const response = await backendApi.get(`/products/alternatives/${product.code}`);
    return response.data;
  } catch (error) {
    console.error('Error getting Canadian alternatives from backend:', error);
    
    // Fall back to Open Food Facts API with our improved logic
    try {
      // Extract more information from the product to find better alternatives
      const category = product.categories ? product.categories.split(',')[0].trim() : '';
      const brand = product.brands ? product.brands.split(',')[0].trim() : '';
      const productName = product.product_name || '';
      
      // Build a more specific query to find similar products
      let query = '';
      
      // If we have a category, use it as the primary search term
      if (category) {
        query = `categories=${encodeURIComponent(category)}`;
      } 
      // If no category but we have a brand, search by brand
      else if (brand) {
        query = `brands=${encodeURIComponent(brand)}`;
      }
      // If no category or brand, use the product name
      else if (productName) {
        query = `search_terms=${encodeURIComponent(productName)}`;
      } else {
        return { products: [] }; // Not enough information to find alternatives
      }
      
      // Always filter for Canadian products
      const fallbackResponse = await openFoodApi.get(`/search?${query}&countries=Canada&json=true&page_size=30`);
      
      // Additional filtering to ensure products are actually Canadian
      if (fallbackResponse.data && fallbackResponse.data.products) {
        fallbackResponse.data.products = fallbackResponse.data.products.filter(p => 
          p.countries && p.countries.toLowerCase().includes('canada')
        );
      }
      
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback alternatives search failed:', fallbackError);
      throw error; // Throw the original error
    }
  }
};

// More robust check if a product is made in Canada
export const isCanadianProduct = (product) => {
  if (!product) return false;
  
  // Check countries field
  if (product.countries && product.countries.toLowerCase().includes('canada')) {
    return true;
  }
  
  // Check manufacturing places field if available
  if (product.manufacturing_places && product.manufacturing_places.toLowerCase().includes('canada')) {
    return true;
  }
  
  // Check origins field if available
  if (product.origins && product.origins.toLowerCase().includes('canada')) {
    return true;
  }
  
  return false;
};

// Get database status from backend
export const getDatabaseStatus = async () => {
  try {
    const response = await backendApi.get('/status');
    return response.data;
  } catch (error) {
    console.error('Error getting database status:', error);
    return { 
      status: 'error',
      lastUpdate: null,
      productCount: 0,
      message: 'Could not connect to backend'
    };
  }
};

const apiService = {
  searchProducts,
  getProductByBarcode,
  searchCanadianProducts,
  getCanadianAlternatives,
  isCanadianProduct,
  getDatabaseStatus,
};

export default apiService; 