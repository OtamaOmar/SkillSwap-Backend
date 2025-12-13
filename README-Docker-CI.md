# Docker & CI/CD for SkillSwap Backend

## Docker
- Build: `docker build -t skillswap-backend .`
- Run: `docker run -p 3000:3000 --env-file .env skillswap-backend`
- Compose: `docker compose up --build -d`

Ensure `.env` includes values used by `server.js` and `db.js` (e.g., `PORT=3000`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL` for Postgres).

## GitHub Actions
- CI: `.github/workflows/ci.yml` runs on PRs and branch pushes; installs npm deps and builds the Docker image; includes a simple smoke test.
- CD: `.github/workflows/cd.yml` builds and pushes images to GitHub Container Registry (GHCR) on push to `main`.

### Registry
Images are published to `ghcr.io/otamaomar/skillswap-backend`. You can pull with:
```
docker pull ghcr.io/otamaomar/skillswap-backend:latest
```

### Secrets
- `GITHUB_TOKEN`: provided automatically for GHCR push.
- If deploying to a cloud provider, add respective secrets (e.g., `AZURE_WEBAPP_PUBLISH_PROFILE`, `RENDER_API_KEY`).

### Next steps
- Add a health endpoint (e.g., `/health`) for robust smoke checks.
- If using local Postgres, uncomment compose `db` service and set `DATABASE_URL`.
