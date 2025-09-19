# Milestone 3: Basic scraping worker & safe queue

## Tasks
- [x] Add Redis + queue library (BullMQ) and a worker process in backend. (Already implemented)
- [x] Integrate Crawlee + Playwright to perform scrapes. (Already implemented)
- [x] Implement job model scrape_job to record status, error_log, started_at, finished_at. (Already in schema)
- [x] Basic concurrency limits, per-domain delay, retries with exponential backoff. (Already in BullMQ config)
- [x] Implement deduplication: check source_id/source_url unique constraint and skip if recent unless force-refresh. (Already implemented)
- [x] Expose a protected API to enqueue scrapes (internal usage + on-demand front-end trigger). (API exists, need protection)
- [ ] Update scraping logic to scrape actual data from worldofbooks.com:
  - Navigation headings -> Navigation model
  - Categories & subcategories -> Category model
  - Product tiles/cards: Title, Author, Price, Image, Product Link, Source ID -> Product model
  - Product detail pages: Full description, reviews & ratings, related products, metadata -> ProductDetail, Review models
- [ ] Implement persistence of scraped data to DB with relationships & unique constraints
- [ ] Implement caching with expiry using last_scraped_at, respect robots.txt, rate limiting, delays
- [ ] Add protection to enqueue API (JWT or basic auth)
- [ ] Test the worker: enqueue job for category/product page, process, persist to DB, check ScrapeJob record

## Acceptance
- Worker successfully scrapes a category or product page from worldofbooks and persists to DB, and a scrape_job record exists.
