# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This repository contains **two codebases**:

1. **SANSA AI Chatbot** (Replit monorepo) — React 19 + Express 5 + Drizzle ORM, in `.rar` archives at workspace root. This is the original chatbot at the `/artifacts/` and `/lib/` directories.

2. **SANSA Creative Platform** (`sansa-backend/` + `sansa-backend/public/`) — The production website at [sansaai.in](https://sansaai.in). Node.js + Express 4 + PostgreSQL with static HTML/CSS/JS frontend. Features: Creative Studio, PDF tools, HRMS, payments (Razorpay/UPI), AI search, admin panel.

### RAR extraction

The repository stores source code in `.rar` archives at the workspace root (`artifacts.rar`, `lib.rar`, `scripts.rar`, `.agents.rar`, `.config.rar`). These must be extracted before any other work:

```
sudo apt-get install -y -qq unrar
for f in artifacts.rar lib.rar scripts.rar .agents.rar .config.rar; do
  [ -f "$f" ] && unrar x -o+ "$f"
done
```

### Required environment variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://ubuntu:password@localhost:5432/sansa_ai` |
| `PORT` | API server port | `8080` |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI API base URL (server won't start without it) | `https://api.openai.com/v1` |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key (server won't start without it) | `sk-...` |
| `ADMIN_USERNAME` | Admin panel username | `admin` |
| `ADMIN_PASSWORD` | Admin panel password | `admin123` |
| `JWT_SECRET` | JWT signing secret (auto-generates if missing) | any string |
| `NODE_ENV` | Environment mode | `development` |

### PostgreSQL setup

PostgreSQL 16 must be running locally. Create user and database:

```
sudo pg_ctlcluster 16 main start
sudo -u postgres createuser -s ubuntu
sudo -u postgres psql -c "ALTER USER ubuntu WITH PASSWORD 'password';"
sudo -u postgres createdb sansa_ai
```

Push schema: `DATABASE_URL="postgresql://ubuntu:password@localhost:5432/sansa_ai" pnpm --filter @workspace/db run push`

### Running services

- **API server** (port 8080): `pnpm --filter @workspace/api-server run dev`
- **Frontend** (port 23967): `PORT=23967 pnpm --filter @workspace/sansa-ai run dev`

The API server `dev` script builds with esbuild then runs the bundle. It is NOT a watch-mode hot-reload; restart the command after source changes.

The frontend runs Vite dev server with hot module replacement.

### Gotchas

- The `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` env vars are **required** for the API server to start, even if you don't need AI features. Set placeholder values if no real key is available.
- The frontend calls `/api/...` with relative URLs. In Replit's infrastructure these are routed to the API server automatically. In local dev, the two services run on separate ports with no built-in proxy. Use `curl` against port 8080 for API testing or add a reverse proxy if full browser-based E2E is needed.
- `pnpm run typecheck:libs` and per-artifact `typecheck` scripts have **pre-existing type errors** in the repository. These are not regressions from your changes.
- Prettier reports style issues in several files — also pre-existing.
- The `onlyBuiltDependencies` list in `pnpm-workspace.yaml` already covers common native deps (`@swc/core`, `esbuild`, `msw`, `unrs-resolver`). `core-js` build script is intentionally ignored.
- `AI_INTEGRATIONS_OPENAI_BASE_URL` must be the API endpoint (e.g. `https://api.openai.com/v1`), **not** the web dashboard URL (`https://platform.openai.com/...`). The server will start either way but API calls will fail with Cloudflare challenge pages if the wrong URL is used.
- The chat endpoint uses model `gpt-5.2` hardcoded in `artifacts/api-server/src/routes/openai/conversations.ts`. If the OpenAI account doesn't have access to this model, chat will fail.

### SANSA Creative Platform (sansaai.in)

#### Quick start

```
cd sansa-backend
cp .env.example .env   # then edit DATABASE_URL and other values
npm install
node index.cjs
```

The server starts on `PORT` (default 8080, use 3000 if old chatbot API is running on 8080). It serves both the API (`/api/...`, `/admin/...`) and the frontend (`public/` directory) from the same port.

#### Environment variables

See `sansa-backend/.env.example` for the full list. Key ones:
- `DATABASE_URL` — PostgreSQL connection string (optional; runs in JSON file-based demo mode without it)
- `DATABASE_SSL=false` — required for local PostgreSQL
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin panel credentials
- `USE_OPENAI=false` — set true + `OPENAI_API_KEY` for AI features
- `FREE_WEB_SEARCH=true` — enables DuckDuckGo fallback search

#### Frontend config

`sansa-backend/public/sansa-config.js` controls the API base URL. For local dev, `localhost` is auto-detected and API calls go to the same origin. In production, it points to `https://api.sansaai.in`.

#### Database

Schema auto-creates on startup via `initDatabase()` in `src/services/db.js`. No manual migration needed. For a fresh setup: `sudo -u postgres createdb sansa_platform`

#### Gotchas

- The `connect-pg-simple` session store logs a harmless `relation "IDX_session_expire" already exists` warning on restart. Ignore it.
- The `/api/search` endpoint may error with "headers already sent" — this is a pre-existing code issue.
- The backend has a nested zip (`Backend_SANSA_ADOBE_FULL_PLATFORM_2026_CPANEL_SAFE.zip`) which is a cPanel deployment bundle — not needed for local dev.
