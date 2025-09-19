# Product Data Explorer

Full-stack assignment: scraping World of Books → explore products.

## Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: NestJS, TypeScript
- Database: PostgreSQL
- Queue: Redis with BullMQ
- Scraping: Crawlee + Playwright

## Prerequisites
- Docker and Docker Compose installed
- Node.js (for local development without Docker)

## Running Locally with Docker
1. Clone the repository
2. Navigate to the project root directory
3. Run the following command to start all services:
   ```bash
   docker-compose up --build
   ```
4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Database: localhost:5432
   - Redis: localhost:6379

## Running Locally without Docker (Development)
### Backend
1. Navigate to the `backend` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create `.env` file):
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/products
   REDIS_URL=redis://localhost:6379
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed the database (optional):
   ```bash
   npx prisma db seed
   ```
6. Start the backend in development mode:
   ```bash
   npm run start:dev
   ```

### Frontend
1. Navigate to the `frontend` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create `.env.local` file):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```
4. Start the frontend in development mode:
   ```bash
   npm run dev
   ```

## Testing
### Backend
- Run unit tests: `npm run test`
- Run e2e tests: `npm run test:e2e`
- Run tests with coverage: `npm run test:cov`

### Frontend
- Run linting: `npm run lint`

## API Documentation
The backend provides RESTful APIs for:
- Navigation data
- Categories
- Products with details and reviews
- Scraping job management

## Database Schema
The application uses Prisma ORM with the following main models:
- Navigation
- Category
- Product
- ProductDetail
- Review
- ScrapeJob
- ViewHistory

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License
This project is licensed under the MIT License.
