# Stock Market Analysis - Frontend

A modern React TypeScript application for comprehensive stock market analysis with automated NSE data fetching, technical analysis, and long-term investment insights.

## Features

- **Modern Dashboard**: Real-time market overview with key statistics
- **Interactive Charts**: TradingView-style charts with volume and delivery data
- **Stock Analysis**: Detailed individual stock analysis with technical indicators
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Light Theme**: Professional light theme with excellent readability

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for HTTP requests
- **Zustand** for state management
- **TanStack Query** for server state management

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker (Recommended)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Build and start the application:
   ```bash
   docker-compose up --build
   ```

3. Open your browser and visit:
   ```
   http://localhost:3033
   ```

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and visit:
   ```
   http://localhost:3033
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── store/              # State management
├── services/           # API services
└── assets/             # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Docker Commands

- `docker-compose up` - Start the application
- `docker-compose up --build` - Rebuild and start
- `docker-compose down` - Stop the application
- `docker-compose logs -f` - View logs

## Environment Variables

The application can be configured using environment variables:

- `VITE_API_URL` - Backend API URL (default: http://localhost:3035)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 