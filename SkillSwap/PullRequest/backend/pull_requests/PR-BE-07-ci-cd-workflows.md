# PR: Backend CI/CD workflows (GitHub Actions)

## Summary
Adds/updates GitHub Actions workflows for backend validation (install, migrate test DB, run checks) and deployment steps.

## Key changes
- Runs install + lint/build checks on pushes/PRs to main/dev.
- Spins up a Postgres service in CI for migration validation.
- Adds a deployment workflow scaffold for main/dev.

## Files / areas touched
- `.github/workflows/backend-ci.yml`
- `.github/workflows/backend-cd.yml`
- `package.json (scripts: migrate, dev)`

## How to test (local)
1. Open a PR and confirm GitHub Actions run `backend-ci` successfully.
2. Locally: `npm ci` then `npm run migrate` to validate migrations against your DB.

## Suggested reviewers
- Backend: Fady Ragaie
- Backend: Mohamed Bassel
