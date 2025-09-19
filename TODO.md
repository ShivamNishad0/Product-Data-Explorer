# Milestone 4 — Backend REST API (MVP endpoints)

## Tasks
- [x] Install required dependencies (class-validator, class-transformer, @nestjs/swagger, express-rate-limit, cache-manager, redis)
- [x] Create DTOs for all endpoints
  - [x] Navigation DTOs
  - [x] Category DTOs
  - [x] Product DTOs
  - [x] Scrape DTOs
- [x] Create controllers for navigation, category, product
  - [x] NavigationController with GET /api/navigations
  - [x] CategoryController with GET /api/categories/:id
  - [x] ProductController with GET /api/products and GET /api/products/:id
- [x] Update scraping controller and service
  - [x] Update POST /api/scrape endpoint
  - [x] Add GET /api/scrape-jobs/:id endpoint
- [x] Implement caching middleware (DB + Redis) for scraping
- [x] Add rate-limiting for scrape endpoints
- [x] Add error handling and structured responses
- [x] Configure Swagger/OpenAPI documentation
- [x] Write unit tests for controllers/services
- [x] Update modules to include new controllers
- [x] Test endpoints and ensure frontend integration

## Acceptance Criteria
- Frontend can call endpoints and receive expected payloads
- API docs available (Swagger/OpenAPI)
