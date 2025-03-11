# MapleScan Server

Backend server for the MapleScan app, providing a MongoDB-based API for product search and Canadian alternatives.

## Features

- MongoDB database for storing product information
- RESTful API for searching products and finding Canadian alternatives
- Nightly database sync with Open Food Facts
- Optimized search for Canadian products

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd maplescan/server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the example:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your MongoDB connection string

### Running the Server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

### Database Sync

To manually sync the database:
```
npm run sync
```

The database will also sync automatically every night at 2 AM.

## API Endpoints

### Products

- `GET /api/products/search?query=<search_term>` - Search all products
- `GET /api/products/search/canadian?query=<search_term>` - Search Canadian products
- `GET /api/products/:barcode` - Get product by barcode
- `GET /api/products/alternatives/:barcode` - Get Canadian alternatives for a product

### Status

- `GET /api/status` - Get database status

## Deployment

### MongoDB Atlas

1. Create a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string and update the `.env` file

### Deploying to Render

1. Create a free Render account at [https://render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the build command to `npm install`
5. Set the start command to `npm start`
6. Add your environment variables from `.env`
7. Deploy the service

## License

MIT 