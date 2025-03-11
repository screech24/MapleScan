# Server Changelog

All notable changes to the MapleScan server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-03-11

### Fixed
- Fixed Supabase connection issues by improving the database connection query
- Resolved "failed to parse select parameter (count(*))" error by using a simpler query
- Fixed duplicate key error when setting up database schema
- Improved error handling and logging for database operations
- Enhanced database initialization process to handle existing schema gracefully

### Changed
- Updated database connection logic to be more robust
- Improved logging for better debugging and monitoring
- Enhanced error messages for clearer troubleshooting

## [1.0.0] - 2025-03-11

### Added
- Initial server implementation
- Supabase database integration
- RESTful API endpoints for product search and retrieval
- Database schema setup script
- Nightly database sync with Open Food Facts API
- Logging system for server operations
- CORS configuration for frontend integration 