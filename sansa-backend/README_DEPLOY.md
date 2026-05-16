# SANSA AI Adobe-Style Full Platform Deploy

This package is built for MilesWeb/cPanel Node.js with the existing CommonJS startup file.

## MilesWeb Node.js Settings

- Application root: `public_html/sansa-ai-backend`
- Application URL: `api.sansaai.in`
- Startup file: `index.cjs`
- Node.js version: 20.x
- Application mode: `Production`

## Upload

1. Extract `Frontend_SANSA_ADOBE_FULL_PLATFORM_2026.zip` into `public_html`.
2. Extract `Backend_SANSA_ADOBE_FULL_PLATFORM_2026_CPANEL_SAFE.zip` into `public_html/sansa-ai-backend`.
3. In MilesWeb Node.js panel, run `Run NPM Install`.
4. Restart the Node.js app.

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
https://sansaai.in/?v=sansa-adobe-full-platform-2026-v1
https://api.sansaai.in/api/health
https://api.sansaai.in/api/apps
https://api.sansaai.in/api/plans
```

Admin login uses the values from `ADMIN_USERNAME` and `ADMIN_PASSWORD`. Default local/cPanel setup also accepts `admin@sansai.in` / `Admin@123` until you change the environment variables. Social login buttons are placeholders until OAuth credentials are configured.

Login fix notes:

- Keep `NODE_ENV=production` on MilesWeb so the secure cross-subdomain session cookie is used.
- The backend also accepts older admin password `Sansa@638345` as a fallback if it is still saved in the Node.js environment panel.
- Guest demo login auto-creates `demo@sansaai.in` / `demo123` in JSON fallback mode.
