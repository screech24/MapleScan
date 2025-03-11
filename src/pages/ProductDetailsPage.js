import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getProductByBarcode, getCanadianAlternatives, isCanadianProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { 
    currentProduct, 
    setCurrentProduct, 
    alternatives, 
    setAlternatives, 
    loading, 
    setLoading, 
    error, 
    setError,
    addToRecentScans,
    darkMode
  } = useAppContext();
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await getProductByBarcode(productId);
        
        if (result && result.product) {
          setCurrentProduct(result.product);
          addToRecentScans(result.product);
          
          // Fetch Canadian alternatives if the product is not Canadian
          if (!isCanadianProduct(result.product)) {
            try {
              const alternativesResult = await getCanadianAlternatives(result.product);
              
              if (alternativesResult && alternativesResult.products && alternativesResult.products.length > 0) {
                // Filter out the current product from alternatives
                const filteredAlternatives = alternativesResult.products.filter(
                  product => product.code !== productId
                );
                
                setAlternatives(filteredAlternatives.slice(0, 6)); // Limit to 6 alternatives
              } else {
                setAlternatives([]);
              }
            } catch (err) {
              console.error('Error fetching alternatives:', err);
              setAlternatives([]);
            }
          } else {
            setAlternatives([]);
          }
        } else {
          setError('Product not found. Please try a different search.');
          toast.error('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to fetch product details. Please try again.');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId, setCurrentProduct, setLoading, setError, addToRecentScans, setAlternatives]);

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareProduct = (platform) => {
    if (!currentProduct) return;
    
    const productName = currentProduct.product_name || 'Product';
    const shareText = `Check out this ${isCanadianProduct(currentProduct) ? 'Canadian-made' : ''} product: ${productName}`;
    const shareUrl = window.location.href;
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(`Canadian Product: ${productName}`)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank');
    setShowShareOptions(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-maple-red border-t-transparent"></div>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'} p-4 rounded-lg mb-6`}>
        {error}
        <div className="mt-4">
          <Link to="/search" className="text-maple-red font-medium">
            Go to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="text-center py-12">
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product not found</p>
        <div className="mt-4">
          <Link to="/search" className="text-maple-red font-medium">
            Go to Search
          </Link>
        </div>
      </div>
    );
  }

  const isCanadian = isCanadianProduct(currentProduct);

  return (
    <div className="pb-16">
      <div className="mb-6">
        <Link to="/search" className="text-maple-red flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Search
        </Link>
      </div>
      
      <div className={`${darkMode ? 'bg-dark-surface' : 'bg-white'} rounded-lg shadow-md overflow-hidden mb-8`}>
        <div className="relative">
          {/* Product image */}
          <img 
            src={currentProduct.image_url || 'https://via.placeholder.com/600x400?text=No+Image'} 
            alt={currentProduct.product_name || 'Product'} 
            className={`w-full h-64 object-contain ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
          />
          
          {/* Canadian badge */}
          {isCanadian && (
            <div className="absolute top-4 right-4 bg-maple-red text-white px-3 py-1 rounded-full text-sm font-bold">
              Made in Canada
            </div>
          )}
        </div>
        
        <div className="p-6">
          {/* Product name */}
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentProduct.product_name || 'Unknown Product'}
          </h1>
          
          {/* Brand */}
          {currentProduct.brands && (
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              {currentProduct.brands}
            </p>
          )}
          
          {/* Country of origin */}
          <div className="mb-4">
            <h2 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Origin</h2>
            <p className={`${isCanadian 
              ? darkMode ? 'text-green-400 font-medium' : 'text-green-600 font-medium' 
              : darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentProduct.countries || 'Unknown'}
            </p>
          </div>
          
          {/* Categories */}
          {currentProduct.categories && (
            <div className="mb-4">
              <h2 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Categories</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {currentProduct.categories}
              </p>
            </div>
          )}
          
          {/* Ingredients */}
          {currentProduct.ingredients_text && (
            <div className="mb-4">
              <h2 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Ingredients</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {currentProduct.ingredients_text}
              </p>
            </div>
          )}
          
          {/* Purchase links */}
          {currentProduct.purchase_places && (
            <div className="mb-6">
              <h2 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Where to Buy</h2>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {currentProduct.purchase_places}
              </p>
            </div>
          )}
          
          {/* Share button */}
          <div className="relative">
            <button
              onClick={handleShare}
              className="bg-maple-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
            >
              Share Product
            </button>
            
            {/* Share options */}
            {showShareOptions && (
              <div className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-dark-surface' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-10`}>
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    onClick={() => shareProduct('facebook')}
                    className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    role="menuitem"
                  >
                    Share on Facebook
                  </button>
                  <button
                    onClick={() => shareProduct('twitter')}
                    className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    role="menuitem"
                  >
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => shareProduct('email')}
                    className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`}
                    role="menuitem"
                  >
                    Share via Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Canadian alternatives */}
      {!isCanadian && alternatives.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Canadian Alternatives</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alternatives.map((product) => (
              <ProductCard key={product.code} product={product} />
            ))}
          </div>
        </div>
      )}
      
      {/* Feedback form */}
      <div className={`${darkMode ? 'bg-dark-surface' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Product Feedback</h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Is the information about this product incorrect? Let us know!
        </p>
        <form className="space-y-4">
          <div>
            <label htmlFor="feedback" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Your Feedback
            </label>
            <textarea
              id="feedback"
              rows="3"
              className={`w-full px-3 py-2 border ${darkMode ? 'bg-dark-surface border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-700'} rounded-md focus:outline-none focus:ring-2 focus:ring-maple-red`}
              placeholder="Please describe the issue with this product information..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-maple-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetailsPage; 