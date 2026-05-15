# SANSA AI Adobe-Style Full Platform Deploy

This package is built for MilesWeb/cPanel Node.js with the existing CommonJS startup file.

## MilesWeb Node.js Settings

- Application URL: `api.sansaai.in` (or your API host)
- Startup file: `index.cjs`
- Node.js version: 20.x
- Application mode: `Production`
- Application root: point at **this folder** (`artifacts/sansa-backend` inside your clone), for example:
  - `~/repos/santhosh-sansa/artifacts/sansa-backend`

## Deploy from GitHub (recommended)

1. In cPanel **Terminal / SSH**: `git clone https://github.com/santhosh-sansa/santhosh-sansa.git` (or use your existing repo path).
2. `cd santhosh-sansa && git checkout main && git pull origin main`
3. In **Setup Node.js App**, set **Application root** to `.../artifacts/sansa-backend` (absolute path on the server).
4. Use **Run NPM Install** in the panel (CloudLinux expects `node_modules` as a symlink; do not keep a real `node_modules` folder you created manually in that root).
5. Copy `.env.example` to `.env` (or set variables in the Node.js app UI) and fill production values below.
6. **Restart** the application.

Local check before you push or after `git pull`:

```bash
cd artifacts/sansa-backend
npm run verify
```

## Upload (zip bundle, optional)

If you use the older zip bundles instead of Git:

1. Extract the frontend zip into `public_html` (if you still split static hosting that way).
2. Extract the backend zip into your Node application root (same layout as this repo’s `artifacts/sansa-backend`).
3. In the Node.js panel, run **Run NPM Install** and restart.

## Required Environment Variables

Use `.env.example` as the reference.

Minimum production values:

```text
NODE_ENV=production
APP_BASE_URL=https://sansaai.in
CORS_ORIGINS=https://sansaai.in,https://www.sansaai.in,https://api.sansaai.in
ADMIN_USERNAME=admin@sansai.in
ADMIN_PASSWORD=Admin@123
SESSION_SECRET=change-this-long-random-secret
```

Optional:

```text
DATABASE_URL=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
VECTORENGINE_API_KEY=
OPENAI_API_KEY=
```

If `DATABASE_URL` is empty, SANSA uses JSON files in `data/` for users, settings, subscriptions and audit events.

## Verify

Open:

```text
https://sansaai.in/
https://api.sansaai.in/health
https://api.sansaai.in/api/health
https://api.sansaai.in/api/apps
https://api.sansaai.in/api/plans
```

Admin login uses the values from `ADMIN_USERNAME` and `ADMIN_PASSWORD`. Default local/cPanel setup also accepts `admin@sansai.in` / `Admin@123` until you change the environment variables. Social login buttons are placeholders until OAuth credentials are configured.

Login fix notes:

- Keep `NODE_ENV=production` on MilesWeb so the secure cross-subdomain session cookie is used.
- The backend also accepts older admin password `Sansa@638345` as a fallback if it is still saved in the Node.js environment panel.
- Guest demo login auto-creates `demo@sansaai.in` / `demo123` in JSON fallback mode.
