import React, { useState, useEffect } from 'react';
import { getDatabaseStatus } from '../services/api';
import { useAppContext } from '../context/AppContext';

const DatabaseStatus = () => {
  const { darkMode } = useAppContext();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch database status on component mount
  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Fetch database status from backend
  const fetchDatabaseStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const statusData = await getDatabaseStatus();
      setStatus(statusData);
    } catch (err) {
      console.error('Error fetching database status:', err);
      setError('Failed to connect to the database server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mt-8 p-4 ${darkMode ? 'bg-dark-surface' : 'bg-white'} rounded-lg shadow-md`}>
      <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Database Status
      </h2>
      
      <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Our database is updated nightly with the latest product information.
      </p>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-maple-red border-t-transparent"></div>
          <p className={`ml-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Checking database status...
          </p>
        </div>
      )}
      
      {error && !loading && (
        <div className={`mb-4 p-3 ${darkMode ? 'bg-red-900/20 text-red-300' : 'bg-red-100 text-red-700'} rounded-md`}>
          <p>{error}</p>
        </div>
      )}
      
      {status && !loading && !error && (
        <div className="mb-4">
          <div className={`p-3 ${status.status === 'ok' 
            ? darkMode ? 'bg-green-900/20 text-green-300' : 'bg-green-100 text-green-700' 
            : darkMode ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'} rounded-md mb-4`}>
            <p>
              {status.status === 'ok' 
                ? 'Database is up to date and running smoothly.' 
                : 'Database may need maintenance.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-md`}>
              <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Last Updated
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {formatDate(status.lastUpdate)}
              </p>
            </div>
            
            <div className={`p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-md`}>
              <h3 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Product Count
              </h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {status.productCount?.toLocaleString() || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`px-4 py-2 rounded-md ${darkMode ? 'bg-dark-surface text-gray-300 border border-gray-700' : 'bg-white text-gray-700 border border-gray-300'} hover:bg-gray-100 transition duration-200`}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>
      
      {showDetails && (
        <div className={`mt-4 p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-md`}>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            About Our Database
          </h3>
          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            We maintain a server-side database of products that:
          </p>
          <ul className={`list-disc pl-5 mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <li>Updates nightly from Open Food Facts</li>
            <li>Prioritizes Canadian-made products</li>
            <li>Includes a wide range of product categories</li>
            <li>Optimizes search performance</li>
            <li>Provides better Canadian alternatives</li>
          </ul>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            This approach allows us to provide fast, reliable product information without storing large amounts of data on your device.
          </p>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus; 