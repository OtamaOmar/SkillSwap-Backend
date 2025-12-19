# SkillSwap Backend

Node.js + Express API for SkillSwap with JWT auth and PostgreSQL. Handles profiles, posts, comments, skills, friendships, chat, and notifications. Ships with SQL migrations and Docker support. Live at http://skillswap-app.duckdns.org/ (backend served from a container running on our Azure server).

## Stack
- Node.js 18+ (ESM) + Express
- PostgreSQL (`pg` pool)
- JWT auth (`jsonwebtoken`, `bcrypt`)
- File uploads via `multer`

## Quick start (local dev)
1) Install dependencies
```bash
npm install
```
2) Create `.env` (see sample). Provide either `DATABASE_URL` or discrete `DB_*` values.
3) Run migrations
```bash
npm run migrate
```
4) Start API
```bash
npm start
# http://localhost:4000
```

### Env sample (`.env`)
```
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgres://user:password@localhost:5432/skillswap_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=mora
DB_PASSWORD=Omar.2005
DB_NAME=skillswap_db
JWT_SECRET=change-me
```

### Database migrations
- SQL files live in `migrations/` and run in lexical order (001_*.sql, 002_*.sql...).
- Use `npm run migrate` to apply all scripts once; it respects `DATABASE_PUBLIC_URL` (Railway) or `DATABASE_URL`.
- Ensure the UUID extension exists: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` (already included in the first migration).

### API surface (high level)
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh`
- Users: `/api/users`, `/api/users/me`, `/api/users/:id`, profile updates, upload avatar/cover
- Posts: list/create/delete, comments, likes
- Skills: add/update/delete, fetch by user
- Friendships: requests, accept/reject, unfriend (also mounted at `/api/friends`)
- Chat and notifications routes are mounted under `/api/chat` and `/api/notifications`.

### Docker
- Full stack compose lives at repo root. From `/home/mora/github/SkillSwap` run:
```bash
docker compose up --build
```
- Backend listens on `4000`, Postgres on `5432`. Override env via compose or `.env`.
- Backend `Dockerfile` uses `PORT` and reads the same `.env` keys.

### CI/CD
- CI: `.github/workflows/backend-ci.yml` installs, lints (if configured), and runs build/test steps.
- CD: `.github/workflows/backend-cd.yml` builds and deploys to Railway; set secrets for database URL and JWT secret.

### Project layout
```
SkillSwap-Backend/
├─ server.js            # Express app + route mounting
├─ db.js                # pg Pool using DATABASE_URL or DB_* vars
├─ middleware.js        # JWT auth middleware
├─ migrations.js        # Runner for SQL migrations in migrations/
├─ routes/              # API route modules (users, posts, skills, friendships, chat, notifications)
├─ controllers/         # Route handlers
├─ utils/               # Realtime helpers, uploads
└─ migrations/          # Ordered SQL migration files
```

### Troubleshooting
- `EADDRINUSE`: free the port `lsof -ti:4000 | xargs kill -9`.
- DB connection: verify `DATABASE_URL`/`DB_*`, ensure PostgreSQL is reachable and `uuid-ossp` is enabled.
- Auth failures: check `Authorization: Bearer <token>` header and `JWT_SECRET` consistency across services.
