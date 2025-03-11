import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { searchProducts, searchCanadianProducts, isCanadianProduct } from '../services/api';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const { searchResults, setSearchResults, loading, setLoading, error, setError, darkMode } = useAppContext();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all' or 'canadian'
  const [originalResults, setOriginalResults] = useState([]);
  const [canadianAlternatives, setCanadianAlternatives] = useState([]);
  const [showingAlternatives, setShowingAlternatives] = useState(false);

  // Sort search results by relevance to the query
  const sortByRelevance = (results, searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    
    return [...results].sort((a, b) => {
      const aName = (a.product_name || '').toLowerCase();
      const bName = (b.product_name || '').toLowerCase();
      const aBrand = (a.brands || '').toLowerCase();
      const bBrand = (b.brands || '').toLowerCase();
      
      // Check if product name contains the query
      const aNameContainsQuery = aName.includes(lowerQuery);
      const bNameContainsQuery = bName.includes(lowerQuery);
      
      // Check if brand contains the query
      const aBrandContainsQuery = aBrand.includes(lowerQuery);
      const bBrandContainsQuery = bBrand.includes(lowerQuery);
      
      // Prioritize products where name starts with the query
      if (aName.startsWith(lowerQuery) && !bName.startsWith(lowerQuery)) return -1;
      if (!aName.startsWith(lowerQuery) && bName.startsWith(lowerQuery)) return 1;
      
      // Then prioritize products where name contains the query
      if (aNameContainsQuery && !bNameContainsQuery) return -1;
      if (!aNameContainsQuery && bNameContainsQuery) return 1;
      
      // Then prioritize products where brand contains the query
      if (aBrandContainsQuery && !bBrandContainsQuery) return -1;
      if (!aBrandContainsQuery && bBrandContainsQuery) return 1;
      
      return 0;
    });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    
    setLoading(true);
    setError(null);
    setShowingAlternatives(false);
    setCanadianAlternatives([]);
    
    try {
      // Always search for all products first to get the most relevant results
      const results = await searchProducts(query);
      
      if (results && results.products && results.products.length > 0) {
        // Sort results by relevance
        const sortedResults = sortByRelevance(results.products, query);
        
        // If user selected 'canadian', filter to only show Canadian products
        if (searchType === 'canadian') {
          const canadianResults = sortedResults.filter(product => isCanadianProduct(product));
          
          if (canadianResults.length > 0) {
            setSearchResults(canadianResults);
            setOriginalResults(canadianResults);
            toast.success(`Found ${canadianResults.length} Canadian products`);
          } else {
            setSearchResults([]);
            setOriginalResults([]);
            toast.error('No Canadian products found. Try a different search term.');
          }
        } else {
          // For 'all' search type, show all results sorted by relevance
          setSearchResults(sortedResults);
          setOriginalResults(sortedResults);
          
          // Check if the most relevant product is Canadian
          const mostRelevantProduct = sortedResults[0];
          const isMostRelevantCanadian = isCanadianProduct(mostRelevantProduct);
          
          // If the most relevant product is not Canadian, search for Canadian alternatives
          if (!isMostRelevantCanadian) {
            try {
              const canadianResults = await searchCanadianProducts(query);
              
              if (canadianResults && canadianResults.products && canadianResults.products.length > 0) {
                setCanadianAlternatives(canadianResults.products);
              }
            } catch (err) {
              console.error('Error fetching Canadian alternatives:', err);
            }
          }
          
          toast.success(`Found ${sortedResults.length} products`);
        }
      } else {
        setSearchResults([]);
        setOriginalResults([]);
        toast.error('No products found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search products. Please try again.');
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlternatives = () => {
    if (showingAlternatives) {
      setSearchResults(originalResults);
      setShowingAlternatives(false);
    } else if (canadianAlternatives.length > 0) {
      setSearchResults(canadianAlternatives);
      setShowingAlternatives(true);
    }
  };

  return (
    <div className="pb-16">
      <h1 className="text-2xl font-bold mb-6">Search Products</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="input"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="input !w-auto"
            >
              <option value="all">All Products</option>
              <option value="canadian">Canadian Only</option>
            </select>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Error message */}
      {error && (
        <div className={`${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'} p-4 rounded-lg mb-6 transition-colors duration-200`}>
          {error}
        </div>
      )}
      
      {/* Search results */}
      {searchResults.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {showingAlternatives ? 'Canadian Alternatives' : 'Search Results'}
            </h2>
            
            {/* Toggle button for Canadian alternatives */}
            {canadianAlternatives.length > 0 && searchType !== 'canadian' && (
              <button
                onClick={toggleAlternatives}
                className="text-maple-red hover:text-maple-dark-red font-medium transition-colors duration-200"
              >
                {showingAlternatives ? 'Show Original Results' : 'Show Canadian Alternatives'}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((product) => (
              <ProductCard key={product.code} product={product} />
            ))}
          </div>
        </div>
      ) : !loading && !error && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>
            Search for products to see results here
          </p>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-maple-red border-t-transparent"></div>
          <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Searching products...</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 