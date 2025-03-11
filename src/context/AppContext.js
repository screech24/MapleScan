import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDarkMode, setDarkMode, toggleDarkMode as toggleDarkModeUtil } from '../utils/darkMode';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [darkMode, setDarkMode] = useState(() => getDarkMode());

  // Load recent scans from localStorage on initial load
  useEffect(() => {
    const savedScans = localStorage.getItem('recentScans');
    if (savedScans) {
      setRecentScans(JSON.parse(savedScans));
    }
  }, []);

  // Save recent scans to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('recentScans', JSON.stringify(recentScans));
  }, [recentScans]);
  
  // Apply dark mode class whenever darkMode state changes
  useEffect(() => {
    setDarkMode(darkMode);
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = toggleDarkModeUtil();
    setDarkMode(newMode);
  };

  // Add a product to recent scans
  const addToRecentScans = (product) => {
    // Check if product already exists in recent scans
    const exists = recentScans.some(scan => scan.code === product.code);
    
    if (!exists) {
      // Add to beginning of array and limit to 10 items
      const updatedScans = [product, ...recentScans].slice(0, 10);
      setRecentScans(updatedScans);
    }
  };

  // Clear search results
  const clearSearchResults = () => {
    setSearchResults([]);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AppContext.Provider
      value={{
        searchResults,
        setSearchResults,
        recentScans,
        loading,
        setLoading,
        error,
        setError,
        currentProduct,
        setCurrentProduct,
        alternatives,
        setAlternatives,
        addToRecentScans,
        clearSearchResults,
        clearError,
        darkMode,
        toggleDarkMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
}; 