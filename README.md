# MapleScan

A React app to help users find Canadian-made products, with features for searching, barcode scanning, and image recognition to check product origins.

**Current Version:** 0.3.1 - See [CHANGELOG.md](CHANGELOG.md) for version history

## Features

- Search for products and find Canadian-made alternatives
- Scan barcodes to check if products are made in Canada
- Take pictures of products for identification
- Dark mode support
- Server-side database with nightly updates
- Multi-database product lookup system
- Web search integration for enhanced product information
- Improved accuracy with multiple data sources

## Data Sources

MapleScan uses multiple data sources to provide comprehensive product information:

1. **Open Food Facts** - Primary open database for food products
2. **UPC Database** - Additional barcode lookup service
3. **Go-UPC API** - Enhanced product information service
4. **Google Custom Search** - Web search fallback for products not found in databases

## Project Structure

This project consists of two main parts:

1. **React Frontend**: The user interface built with React, Tailwind CSS, and various libraries for barcode scanning and image recognition.
2. **Node.js Backend**: A server that provides API endpoints and maintains a MongoDB database of products.

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (for the backend)

### Frontend Setup

1. Install dependencies:
   ```
   cd maplescan
   npm install
   ```

2. Create a `.env` file:
   ```
   cp .env.example .env
   ```

3. Start the development server:
   ```
   npm start
   ```

### Backend Setup

1. Install dependencies:
   ```
   cd maplescan/server
   npm install
   ```

2. Create a `.env` file:
   ```
   cp .env.example .env
   ```

3. Update the MongoDB connection string in the `.env` file.

4. Start the development server:
   ```
   npm run dev
   ```

5. Sync the database:
   ```
   npm run sync
   ```

## Deployment

### Frontend

The frontend can be deployed to GitHub Pages:

```
npm run deploy
```

This will build the application and deploy it to GitHub Pages at https://screech24.github.io/MapleScan

Alternatively, you can deploy to services like Netlify or Vercel:

```
npm run build
```

### Backend

The backend can be deployed to services like Render, Heroku, or DigitalOcean. See the backend README for more details.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for a detailed version history.

## Technologies Used

### Frontend
- React
- Tailwind CSS
- React Router
- Axios
- React Webcam
- Quagga (barcode scanning)
- Tesseract.js (OCR)

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Node-cron
- Winston (logging)

### APIs and Services
- Open Food Facts API
- UPC Database API
- Go-UPC API
- Google Custom Search API
- Supabase

## License

MIT
