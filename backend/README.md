# Product Data Explorer - Backend

Backend service for the Product Data Explorer application, built with NestJS, TypeScript, and Prisma.

## Features
- RESTful API for product data management
- Web scraping using Crawlee and Playwright
- Background job processing with BullMQ and Redis
- PostgreSQL database with Prisma ORM
- Modular architecture with separate services for navigation, categories, products, and scraping

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/products
   REDIS_URL=redis://localhost:6379
   ```

## Database Setup

1. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. (Optional) Seed the database:
   ```bash
   npx prisma db seed
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

The application will start on port 4000 by default.

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

### Debug Tests
```bash
npm run test:debug
```

## API Endpoints

The backend provides the following main API endpoints:

- `GET /api/navigation` - Get navigation data
- `GET /api/categories` - Get categories
- `GET /api/products` - Get products
- `POST /api/scraping/enqueue` - Enqueue a scraping job

## Scraping

The application includes a scraping service that uses Crawlee and Playwright to scrape product data from World of Books. Jobs are processed asynchronously using BullMQ.

## Project Structure

```
src/
├── app.controller.ts          # Main application controller
├── app.module.ts              # Root application module
├── app.service.ts             # Main application service
├── category/                  # Category management
├── navigation/                # Navigation management
├── product/                   # Product management
├── scraping/                  # Scraping functionality
├── prisma/                    # Database configuration
└── main.ts                    # Application entry point
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

## Scripts

- `npm run build`: Build the application
- `npm run format`: Format code with Prettier
- `npm run start`: Start the application
- `npm run start:dev`: Start in development mode with watch
- `npm run start:debug`: Start in debug mode
- `npm run start:prod`: Start in production mode
- `npm run lint`: Run ESLint
- `npm run test`: Run unit tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:cov`: Run tests with coverage
- `npm run test:debug`: Run tests in debug mode
- `npm run test:e2e`: Run end-to-end tests

## Deployment

For production deployment, ensure all environment variables are set and the database is properly configured. The application can be containerized using the provided Dockerfile.

## Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting a pull request

## License

This project is licensed under the MIT License.
