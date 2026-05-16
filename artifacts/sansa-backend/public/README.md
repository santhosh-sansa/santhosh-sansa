# SANSA static frontend (`public/`)

This folder is served by the Node app in the parent directory (`index.cjs`). There is no separate `backend/server.js` in this package — the API lives under `/api/*` on the same host.

## Entry points

- `index.html` — marketing / app cards
- `page.html` — product workspace (Adobe-style routes; loads `page-shell.js` + `page-workspace-mvp.js` for Payments / HRMS / PDF studio)
- `apps.html`, `invoice.html`, `cfo-dashboard.html`, `customer-portal.html`, etc.

## Compare with uploaded `Sansa Frontend.zip`

From repo root:

```bash
sh artifacts/sansa-backend/scripts/compare-sansa-frontend-zip.sh
```

The zip is a **snapshot**; when it differs from `public/`, **keep `public/`** unless you intentionally port a small change from the zip.

## SSL

`.well-known/acme-challenge/` exists for HTTP-01 challenges; add token files during issuance only.
