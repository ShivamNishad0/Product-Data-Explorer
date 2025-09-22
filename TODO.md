# Milestone 8 — Tests & CI Implementation Plan

## Backend Tests
- [ ] Add unit tests for backend services and scrapers.
  - Mock Playwright where appropriate.
- [ ] Add integration tests for API endpoints using a test database.
- [ ] Ensure existing tests are passing and coverage is sufficient.

## Frontend Tests
- [x] Add React Testing Library and Jest dependencies.
- [x] Add unit/component tests for key React components.
  - [x] ScrapingJob component tests
  - [x] SubcategoryDropdown component tests
  - [x] ProductCard component tests
- [ ] Add at least one e2e happy-path test using Playwright or Cypress.
- [x] Add test scripts to frontend/package.json.

## CI Workflow (GitHub Actions)
- [ ] Create GitHub Actions workflow file `.github/workflows/ci.yml`.
- [ ] Configure workflow to run on pull requests.
- [ ] Steps: lint → test → build.
- [ ] Fail the workflow on lint or test regressions.
- [ ] Optionally add deploy preview on PRs.

## Followup Steps
- [ ] Run all tests locally and in CI.
- [ ] Verify CI workflow triggers and passes on PRs.
- [ ] Document test running instructions in README if needed.

---

This TODO will be updated as tasks are completed.
