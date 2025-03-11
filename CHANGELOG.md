# Changelog

All notable changes to the MapleScan project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-03-11

### Added
- Integrated multiple new data sources for product information
- Added Google Custom Search API integration for enhanced product lookups
- Implemented multi-database product lookup service
- Added web search fallback for products not found in databases

### Fixed
- Resolved terminal errors and build issues
- Fixed application startup problems
- Improved application stability

### Changed
- Enhanced Product model with new fields for data source tracking
- Improved product information accuracy with multiple data sources
- Updated product lookup logic to prioritize Canadian product information

## [0.3.0] - 2025-03-11

### Added
- Migrated from MongoDB to Supabase for improved performance and scalability
- Added server-side database schema setup script

### Fixed
- Fixed Supabase connection issues in server
- Resolved database initialization errors
- Improved error handling for database operations

### Changed
- Updated server to version 1.1.0
- Enhanced database connection logic
- Improved server logging for better debugging

## [0.2.0] - 2024-03-11

### Added
- Server-side database with MongoDB
- RESTful API endpoints for product search and retrieval
- Nightly database sync with Open Food Facts API
- Dark mode support for all pages
- Barcode scanning functionality
- Product search feature
- History page to view scanned products
- Image recognition for product identification

### Changed
- Updated UI with Tailwind CSS
- Improved responsive design for mobile devices
- Enhanced error handling and user feedback

### Fixed
- Dark mode issues on History and Scan pages
- Various UI/UX improvements

## [0.1.0] - 2024-03-01

### Added
- Initial project setup
- Basic React application structure
- Project documentation 