# Stock Market Analysis - Backend

A Laravel-based REST API for comprehensive stock market analysis with automated NSE data fetching, technical analysis, and long-term investment insights.

## Features

- **RESTful API**: Clean, documented API endpoints
- **PostgreSQL Database**: Optimized queries and data management
- **Automated Data Fetching**: Daily NSE data fetching at 6 PM
- **Technical Analysis**: RSI, MACD, Moving Averages, Bollinger Bands
- **Investment Scoring**: AI-powered long-term investment recommendations
- **Authentication**: Laravel Sanctum for API token management

## Tech Stack

- **Laravel 10** with PHP 8.2
- **PostgreSQL 15** for database
- **Docker & Docker Compose** for containerization
- **Laravel Sanctum** for authentication

## Quick Start

### Prerequisites

- Docker and Docker Compose

### Using Docker

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and start the application:
   ```bash
   docker-compose up --build
   ```

3. The API will be available at:
   ```
   http://localhost:3034
   ```

### API Endpoints

- `GET /` - API information
- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint for Phase 2

## Environment Variables

Create a `.env` file based on `.env.example` with the following key variables:

```env
APP_NAME="Stock Market Analysis"
APP_ENV=local
APP_KEY=base64:your-app-key-here
APP_DEBUG=true
APP_URL=http://localhost:3034

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=stocks_db
DB_USERNAME=stocks_user
DB_PASSWORD=stocks_password
```

## Database

The application uses PostgreSQL with the following configuration:
- Database: `stocks_db`
- Username: `stocks_user`
- Password: `stocks_password`
- Host: `db` (Docker service name)
- Port: `5432`

## Docker Commands

- `docker-compose up` - Start the application
- `docker-compose up --build` - Rebuild and start
- `docker-compose down` - Stop the application
- `docker-compose logs -f` - View logs

## Project Structure

```
app/
├── Http/
│   └── Controllers/
│       └── Api/          # API Controllers
├── Models/               # Eloquent Models
└── Providers/           # Service Providers

config/                  # Configuration files
database/
├── migrations/          # Database migrations
└── seeders/            # Database seeders

routes/
├── api.php             # API routes
└── web.php             # Web routes

storage/                # File storage
```

## Next Steps

This backend is ready for:
- Phase 3: API-only communication with frontend
- Phase 4: Authentication setup
- Phase 5: Login and dashboard integration
- Phase 6: Registration functionality
- Phase 7: NSE Bhavcopy fetcher

## License

This project is licensed under the MIT License. 