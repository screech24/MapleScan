const axios = require('axios');
const logger = require('./logger');

// Google Custom Search API
const GOOGLE_SEARCH_API = 'https://www.googleapis.com/customsearch/v1';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || '';

/**
 * Search the web for product information by barcode
 * @param {string} barcode - The product barcode
 * @returns {Promise<Object>} - The product data
 */
async function searchProductByBarcode(barcode) {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    logger.warn('Google API key or search engine ID not configured');
    return null;
  }

  try {
    // Search for the barcode
    const searchResponse = await axios.get(GOOGLE_SEARCH_API, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: `${barcode} product information`,
        num: 10
      }
    });

    if (!searchResponse.data || !searchResponse.data.items || searchResponse.data.items.length === 0) {
      logger.warn(`No search results found for barcode ${barcode}`);
      return null;
    }

    // Extract product information from search results
    const productInfo = extractProductInfo(searchResponse.data.items, barcode);
    
    if (!productInfo) {
      return null;
    }

    // Check if the product is Canadian
    const canadianInfo = await checkIfCanadian(productInfo);

    return {
      product: productInfo,
      isCanadian: canadianInfo.isCanadian,
      sources: searchResponse.data.items.slice(0, 3).map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      }))
    };
  } catch (error) {
    logger.error(`Error searching for product ${barcode}:`, error.message);
    return null;
  }
}

/**
 * Extract product information from search results
 * @param {Array} searchResults - The search results
 * @param {string} barcode - The product barcode
 * @returns {Object|null} - The extracted product information
 */
function extractProductInfo(searchResults, barcode) {
  try {
    // Extract product name from search results
    let productName = '';
    let brand = '';
    let category = '';
    
    // Look for product name in titles and snippets
    for (const result of searchResults) {
      const title = result.title || '';
      const snippet = result.snippet || '';
      
      // Skip results that are likely not product pages
      if (title.includes('UPC') || title.includes('Barcode') || title.includes('Database')) {
        continue;
      }
      
      // Extract product name from title
      const titleParts = title.split('|').map(part => part.trim());
      if (titleParts.length > 1) {
        productName = titleParts[0];
        brand = titleParts[1].replace('Brand:', '').trim();
      } else if (title.includes('-')) {
        const dashParts = title.split('-').map(part => part.trim());
        productName = dashParts[0];
        brand = dashParts.length > 1 ? dashParts[1] : '';
      } else {
        productName = title;
      }
      
      // Extract category from snippet
      const categoryKeywords = ['category', 'department', 'section', 'type'];
      for (const keyword of categoryKeywords) {
        const regex = new RegExp(`${keyword}[:\\s]+(\\w+)`, 'i');
        const match = snippet.match(regex);
        if (match && match[1]) {
          category = match[1];
          break;
        }
      }
      
      // If we have a product name, break
      if (productName) {
        break;
      }
    }
    
    if (!productName) {
      logger.warn(`Could not extract product name for barcode ${barcode}`);
      return null;
    }
    
    // Create product object
    return {
      code: barcode,
      product_name: productName,
      brands: brand,
      categories: category,
      image_url: '',
      countries: '',
      manufacturing_places: '',
      origins: '',
      ingredients_text: ''
    };
  } catch (error) {
    logger.error(`Error extracting product info:`, error.message);
    return null;
  }
}

/**
 * Check if a product is Canadian
 * @param {Object} product - The product to check
 * @returns {Promise<Object>} - Information about whether the product is Canadian
 */
async function checkIfCanadian(product) {
  try {
    // Search for product name + "made in Canada"
    const searchResponse = await axios.get(GOOGLE_SEARCH_API, {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_SEARCH_ENGINE_ID,
        q: `${product.product_name} ${product.brands} made in Canada`,
        num: 5
      }
    });
    
    if (!searchResponse.data || !searchResponse.data.items || searchResponse.data.items.length === 0) {
      return { isCanadian: false, confidence: 0 };
    }
    
    // Check if any results mention "made in Canada"
    let canadianMentions = 0;
    let totalResults = searchResponse.data.items.length;
    
    for (const result of searchResponse.data.items) {
      const title = result.title || '';
      const snippet = result.snippet || '';
      const content = (title + ' ' + snippet).toLowerCase();
      
      if (content.includes('made in canada') || 
          content.includes('canadian made') || 
          content.includes('product of canada')) {
        canadianMentions++;
      }
    }
    
    // Calculate confidence
    const confidence = canadianMentions / totalResults;
    
    return {
      isCanadian: confidence > 0.3, // If more than 30% of results mention Canada
      confidence
    };
  } catch (error) {
    logger.error(`Error checking if product is Canadian:`, error.message);
    return { isCanadian: false, confidence: 0 };
  }
}

module.exports = {
  searchProductByBarcode
}; 