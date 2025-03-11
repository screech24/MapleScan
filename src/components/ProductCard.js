import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { darkMode } = useAppContext();
  
  // Check if the product is made in Canada
  const isCanadian = product.countries && product.countries.toLowerCase().includes('canada');
  
  return (
    <div className={`card p-0 overflow-hidden hover:shadow-lg transition-all duration-200 ${darkMode ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-100'}`}>
      <div className="relative">
        {/* Product image - replaced placeholder URL with a more reliable service */}
        <img 
          src={product.image_url || 'https://picsum.photos/300/200'} 
          alt={product.product_name || 'Product'} 
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        
        {/* Canadian badge */}
        {isCanadian && (
          <div className="absolute top-2 right-2 bg-maple-red text-white px-2 py-1 rounded-full text-xs font-bold shadow-soft">
            Made in Canada
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Product name */}
        <h3 className={`text-lg font-semibold mb-1 line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {product.product_name || 'Unknown Product'}
        </h3>
        
        {/* Brand */}
        {product.brands && (
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {product.brands}
          </p>
        )}
        
        {/* Country of origin */}
        <div className="flex items-center mt-2">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Origin:</span>
          <span className={`text-sm ml-1 ${
            isCanadian 
              ? darkMode ? 'text-green-400 font-semibold' : 'text-green-600 font-semibold' 
              : darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {product.countries || 'Unknown'}
          </span>
        </div>
        
        {/* View details button */}
        <Link 
          to={`/product/${product.code}`}
          className="btn btn-primary w-full mt-3 text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard; 