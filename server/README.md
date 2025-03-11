# MapleScan Server

Backend server for the MapleScan app, which helps users find Canadian-made products.

## Features

- Product search and lookup by barcode
- Database of Canadian products
- Integration with multiple data sources
- Web search for product information
- Supabase database integration for improved performance and scalability

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example` and fill in your API keys and Supabase credentials.

### Supabase Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Get your Supabase URL and API key from the project settings
3. Add them to your `.env` file:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

4. Run the Supabase setup script to create the necessary tables:

```bash
npm run setup-supabase
```

Alternatively, you can manually run the SQL setup script in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor > New Query
3. Copy and paste the contents of `scripts/supabase_setup.sql`
4. Run the query

### Running the Server

Start the server:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## API Endpoints

### Products

- `GET /api/products/search?query=<search_term>` - Search products
- `GET /api/products/search/canadian?query=<search_term>` - Search Canadian products
- `GET /api/products/:barcode` - Get product by barcode

### Status

- `GET /api/status` - Get database status

## Data Sources

The server uses multiple data sources to find product information:

1. Local Supabase database
2. Open Food Facts API
3. UPC Database API (if API key is provided)
4. Go-UPC API (if API key is provided)
5. Web search (using Google Custom Search API)

## Database Sync

The server includes a script to sync the database with Open Food Facts:

```bash
npm run sync
```

This is also scheduled to run automatically every night at 2 AM.

## Troubleshooting

### Common Issues

- **"Error connecting to Supabase"**: Check your Supabase URL and API key in the `.env` file.
- **"Tables do not exist"**: Run the setup script or manually create the tables using the SQL in `scripts/supabase_setup.sql`.
- **"Address already in use"**: Another process is using the port. Find and terminate it, or change the port in the `.env` file.

## Recent Changes

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes.

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
```

</rewritten_file>