/**
 * Dark mode utility functions
 */

// Key used for localStorage
const DARK_MODE_KEY = 'mapleScan_darkMode';

/**
 * Get the current dark mode state from localStorage
 * @returns {boolean} True if dark mode is enabled
 */
export const getDarkMode = () => {
  try {
    const value = localStorage.getItem(DARK_MODE_KEY);
    // If value exists, parse it, otherwise check system preference
    if (value !== null) {
      return JSON.parse(value);
    } else {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch (e) {
    console.error('Error getting dark mode preference:', e);
    return false;
  }
};

/**
 * Set the dark mode state in localStorage
 * @param {boolean} isDark - Whether dark mode should be enabled
 */
export const setDarkMode = (isDark) => {
  try {
    localStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDark));
    applyDarkMode(isDark);
  } catch (e) {
    console.error('Error setting dark mode preference:', e);
  }
};

/**
 * Toggle the current dark mode state
 * @returns {boolean} The new dark mode state
 */
export const toggleDarkMode = () => {
  const currentMode = getDarkMode();
  const newMode = !currentMode;
  setDarkMode(newMode);
  return newMode;
};

/**
 * Apply dark mode class to document
 * @param {boolean} isDark - Whether dark mode should be enabled
 */
export const applyDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

/**
 * Initialize dark mode on page load
 * Call this function as early as possible
 */
export const initDarkMode = () => {
  const isDark = getDarkMode();
  applyDarkMode(isDark);
  return isDark;
}; 