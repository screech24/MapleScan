const axios = require('axios');
const logger = require('./logger');
const Product = require('../models/Product');
const { searchProductByBarcode } = require('./webSearchService');

// Open Food Facts API
const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v3';

// UPC Database API (SearchUPC)
const UPC_DATABASE_API = process.env.UPC_DATABASE_API || 'https://api.searchupc.com/v1';
const UPC_DATABASE_API_KEY = process.env.UPC_DATABASE_API_KEY || '';

// Go-UPC API (use sparingly due to potential costs)
const GO_UPC_API = process.env.GO_UPC_API || 'https://api.go-upc.com/v1';
const GO_UPC_API_KEY = process.env.GO_UPC_API_KEY || '';

/**
 * Lookup product by barcode across multiple databases
 * @param {string} barcode - The product barcode
 * @returns {Promise<Object>} - The product data
 */
async function lookupProductByBarcode(barcode) {
  try {
    // Step 1: Check our own database first
    const localProduct = await Product.getByBarcode(barcode);
    if (localProduct) {
      logger.info(`Found product ${barcode} in local database`);
      return { 
        product: localProduct, 
        source: localProduct.data_sources?.source || 'local_database',
        isCanadian: localProduct.is_canadian || false
      };
    }

    // Step 2: Try Open Food Facts API
    try {
      const openFoodResponse = await axios.get(`${OPEN_FOOD_FACTS_API}/product/${barcode}.json`);
      if (openFoodResponse.data && openFoodResponse.data.product) {
        logger.info(`Found product ${barcode} in Open Food Facts`);
        const product = openFoodResponse.data.product;
        
        // Determine if the product is Canadian
        const isCanadian = isCanadianProduct(product);
        
        // Save to our database for future lookups
        await saveProductToDatabase(product, 'open_food_facts', isCanadian);
        
        return { 
          product, 
          source: 'open_food_facts',
          isCanadian
        };
      }
    } catch (error) {
      logger.error(`Error looking up product ${barcode} in Open Food Facts:`, error.message);
    }

    // Step 3: Try UPC Database API if API key is available
    if (UPC_DATABASE_API_KEY) {
      try {
        const upcDatabaseResponse = await axios.get(`${UPC_DATABASE_API}/lookup`, {
          params: {
            upc: barcode,
            apikey: UPC_DATABASE_API_KEY
          }
        });
        
        if (upcDatabaseResponse.data && upcDatabaseResponse.data.success) {
          logger.info(`Found product ${barcode} in UPC Database`);
          const product = transformUpcDatabaseResponse(upcDatabaseResponse.data, barcode);
          
          // Determine if the product is Canadian
          const isCanadian = isCanadianProduct(product);
          
          // Save to our database for future lookups
          await saveProductToDatabase(product, 'upc_database', isCanadian);
          
          return { 
            product, 
            source: 'upc_database',
            isCanadian
          };
        }
      } catch (error) {
        logger.error(`Error looking up product ${barcode} in UPC Database:`, error.message);
      }
    }

    // Step 4: Try Go-UPC API if API key is available
    if (GO_UPC_API_KEY) {
      try {
        const goUpcResponse = await axios.get(`${GO_UPC_API}/code/${barcode}`, {
          headers: {
            'Authorization': `Bearer ${GO_UPC_API_KEY}`
          }
        });
        
        if (goUpcResponse.data && goUpcResponse.data.product) {
          logger.info(`Found product ${barcode} in Go-UPC`);
          const product = transformGoUpcResponse(goUpcResponse.data.product, barcode);
          
          // Determine if the product is Canadian
          const isCanadian = isCanadianProduct(product);
          
          // Save to our database for future lookups
          await saveProductToDatabase(product, 'go_upc', isCanadian);
          
          return { 
            product, 
            source: 'go_upc',
            isCanadian
          };
        }
      } catch (error) {
        logger.error(`Error looking up product ${barcode} in Go-UPC:`, error.message);
      }
    }

    // Step 5: Try web search as a last resort
    try {
      const webSearchResult = await searchProductByBarcode(barcode);
      
      if (webSearchResult && webSearchResult.product) {
        logger.info(`Found product ${barcode} via web search`);
        const product = webSearchResult.product;
        
        // Determine if the product is Canadian
        const isCanadian = webSearchResult.isCanadian || isCanadianProduct(product);
        
        // Save to our database for future lookups
        await saveProductToDatabase(product, 'web_search', isCanadian, webSearchResult.sources);
        
        return { 
          product, 
          source: 'web_search',
          isCanadian,
          sources: webSearchResult.sources
        };
      }
    } catch (error) {
      logger.error(`Error looking up product ${barcode} via web search:`, error.message);
    }

    // No product found in any database
    return { 
      product: null, 
      source: null,
      error: 'Product not found in any database'
    };
  } catch (error) {
    logger.error(`Error in product lookup service for barcode ${barcode}:`, error);
    return { 
      product: null, 
      source: null,
      error: error.message
    };
  }
}

/**
 * Transform UPC Database response to our format
 * @param {Object} response - The UPC Database response
 * @param {string} barcode - The product barcode
 * @returns {Object} - The transformed product
 */
function transformUpcDatabaseResponse(response, barcode) {
  const item = response.data;
  
  return {
    code: barcode,
    product_name: item.title || 'Unknown Product',
    brands: item.brand || '',
    image_url: item.images && item.images.length > 0 ? item.images[0] : '',
    categories: item.category || '',
    countries: item.country || '',
    manufacturing_places: item.manufacturer || '',
    origins: item.country || '',
    ingredients_text: ''
  };
}

/**
 * Transform Go-UPC response to our format
 * @param {Object} product - The Go-UPC product
 * @param {string} barcode - The product barcode
 * @returns {Object} - The transformed product
 */
function transformGoUpcResponse(product, barcode) {
  return {
    code: barcode,
    product_name: product.name || 'Unknown Product',
    brands: product.brand || '',
    image_url: product.imageUrl || '',
    categories: product.category || '',
    countries: product.region || '',
    manufacturing_places: product.manufacturer || '',
    origins: product.region || '',
    ingredients_text: ''
  };
}

/**
 * Check if a product is Canadian
 * @param {Object} product - The product to check
 * @returns {boolean} - Whether the product is Canadian
 */
function isCanadianProduct(product) {
  // Check for Canadian indicators in various fields
  const fieldsToCheck = [
    product.countries,
    product.manufacturing_places,
    product.origins,
    product.labels,
    product.stores
  ];
  
  for (const field of fieldsToCheck) {
    if (field && typeof field === 'string' && field.toLowerCase().includes('canada')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Save product to our database
 * @param {Object} product - The product to save
 * @param {string} source - The data source
 * @param {boolean} isCanadian - Whether the product is Canadian
 * @param {Array} sources - Optional sources for web search results
 * @returns {Promise<void>}
 */
async function saveProductToDatabase(product, source, isCanadian, sources = []) {
  try {
    // Convert to our database schema
    const productData = {
      barcode: product.code,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || '',
      image_url: product.image_url || '',
      category: product.categories || '',
      description: product.generic_name || '',
      ingredients: product.ingredients_text || '',
      is_canadian: isCanadian,
      canadian_factors: {
        countries: product.countries && product.countries.toLowerCase().includes('canada'),
        manufacturing: product.manufacturing_places && product.manufacturing_places.toLowerCase().includes('canada'),
        origins: product.origins && product.origins.toLowerCase().includes('canada')
      },
      data_sources: {
        source: source,
        last_updated: new Date().toISOString()
      }
    };
    
    // Add sources for web search results
    if (source === 'web_search' && sources && sources.length > 0) {
      productData.sources = sources;
    }
    
    // Save to database
    await Product.createOrUpdate(productData);
    logger.info(`Saved product ${product.code} to database from ${source}`);
  } catch (error) {
    logger.error(`Error saving product ${product.code} to database:`, error.message);
  }
}

module.exports = {
  lookupProductByBarcode
}; 