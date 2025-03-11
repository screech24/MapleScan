import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const HistoryPage = () => {
  const { recentScans, darkMode } = useAppContext();

  return (
    <div className="pb-16">
      <h1 className="text-2xl font-bold mb-6">Scan History</h1>
      
      {recentScans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentScans.map((product) => (
            <ProductCard key={product.code} product={product} />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${darkMode ? 'bg-dark-surface' : 'bg-white'} rounded-lg shadow-md`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            You haven't scanned any products yet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/scan"
              className="bg-maple-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-200 text-center"
            >
              Scan a Product
            </Link>
            <Link
              to="/search"
              className={`${darkMode ? 'bg-dark-surface text-maple-red border border-maple-red' : 'bg-white text-maple-red border border-maple-red'} px-6 py-3 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} transition duration-200 text-center`}
            >
              Search Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage; 