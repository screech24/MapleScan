import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import DatabaseStatus from '../components/DatabaseStatus';

const HomePage = () => {
  const { recentScans, darkMode } = useAppContext();

  return (
    <div className="pb-16">
      {/* Hero section */}
      <div className={`${darkMode ? 'bg-maple-dark-red' : 'bg-maple-red'} text-white rounded-lg shadow-card p-6 mb-8 transition-colors duration-200`}>
        <h1 className="text-3xl font-bold mb-2">Find Canadian-Made Products</h1>
        <p className="text-lg mb-6">
          Support local businesses and discover alternatives to American products during trade tensions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/search"
            className={`${darkMode ? 'bg-black' : 'bg-white'} text-maple-red font-semibold py-2 px-6 rounded-lg shadow-md ${darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} transition duration-200 text-center`}
          >
            Search Products
          </Link>
          <Link
            to="/scan"
            className={`${darkMode ? 'bg-black' : 'bg-white'} text-maple-red font-semibold py-2 px-6 rounded-lg shadow-md ${darkMode ? 'hover:bg-gray-900' : 'hover:bg-gray-100'} transition duration-200 text-center`}
          >
            Scan Barcode
          </Link>
        </div>
      </div>

      {/* Features section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`card ${darkMode ? 'hover:bg-dark-surface/80' : 'hover:bg-gray-50'} transition-colors duration-200`}>
            <div className="text-maple-red mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Search</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Search for products by name or category to find Canadian-made alternatives.
            </p>
          </div>
          
          <div className={`card ${darkMode ? 'hover:bg-dark-surface/80' : 'hover:bg-gray-50'} transition-colors duration-200`}>
            <div className="text-maple-red mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Scan</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Scan product barcodes to instantly check if they're made in Canada.
            </p>
          </div>
          
          <div className={`card ${darkMode ? 'hover:bg-dark-surface/80' : 'hover:bg-gray-50'} transition-colors duration-200`}>
            <div className="text-maple-red mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Image Recognition</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Take a picture of a product to identify it and check its origin.
            </p>
          </div>
        </div>
      </div>

      {/* Recent scans section */}
      {recentScans.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Scans</h2>
            <Link to="/history" className="text-maple-red hover:text-maple-dark-red font-medium transition-colors duration-200">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentScans.slice(0, 3).map((product) => (
              <div key={product.code} className="card hover:shadow-lg transition-all duration-200">
                <h3 className="text-lg font-semibold mb-1 line-clamp-2">
                  {product.product_name || 'Unknown Product'}
                </h3>
                {product.brands && (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {product.brands}
                  </p>
                )}
                <Link 
                  to={`/product/${product.code}`}
                  className="mt-2 inline-block text-maple-red hover:text-maple-dark-red font-medium transition-colors duration-200"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Database Status Section */}
      <DatabaseStatus />
    </div>
  );
};

export default HomePage; 