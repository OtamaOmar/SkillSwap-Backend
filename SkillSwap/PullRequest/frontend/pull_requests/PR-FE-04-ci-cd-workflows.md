# PR: Frontend CI/CD workflows (GitHub Actions)

## Summary
Adds/updates GitHub Actions workflows for frontend validation and deployment on main/dev branches.

## Key changes
- Runs install + lint + build on pushes/PRs.
- Provides a deployment workflow scaffold for production builds.
- Ensures environment handling for API base URL (relative `/api` by default).

## Files / areas touched
- `.github/workflows/frontend-ci.yml`
- `.github/workflows/frontend-cd.yml`
- `package.json (scripts: dev/build/lint)`

## How to test (local)
1. Open a PR and confirm the Frontend CI workflow runs and passes.
2. Locally run: `npm ci && npm run lint && npm run build`.

## Suggested reviewers
- Frontend: Omar Tarek
- Frontend: Hamza Salah
