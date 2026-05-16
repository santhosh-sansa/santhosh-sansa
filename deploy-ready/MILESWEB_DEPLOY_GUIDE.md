# SANSA AI — MilesWeb cPanel Deployment Guide

## Architecture

```
sansaai.in (Frontend)  ──→  api.sansaai.in (Backend API)
     │                              │
     │  Static HTML/CSS/JS          │  Node.js + Express
     │  Served from public/         │  PostgreSQL (optional)
     └──────────────────────────────┘
           Same Node.js app
```

Both frontend and backend run from **one Node.js app** (`index.cjs`). The backend serves the frontend static files from its `public/` directory.

---

## Step-by-Step Deployment

### Step 1: Upload Files

1. Go to **cPanel → File Manager**
2. Navigate to `public_html/sansa-ai-backend/` (create if it doesn't exist)
3. Upload `SANSA_AI_DEPLOY_MILESWEB.zip`
4. Right-click → **Extract** → Extract to `public_html/sansa-ai-backend/`
5. Make sure the files are directly inside `sansa-ai-backend/` (not in a sub-folder)

Your directory should look like:
```
public_html/sansa-ai-backend/
├── index.cjs          ← Startup file
├── package.json
├── package-lock.json
├── server.js
├── .env.example
├── data/
├── public/            ← Frontend files
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── ...
├── python/
├── sql/
├── src/
│   ├── middleware/
│   ├── routes/
│   └── services/
├── tmp/
└── uploads/
```

### Step 2: Set Up Node.js App

1. Go to **cPanel → Node.js Selector** (or Setup Node.js App)
2. Click **Create Application**
3. Settings:
   - **Node.js version**: `20` (or `18` minimum)
   - **Application mode**: `Production`
   - **Application root**: `public_html/sansa-ai-backend`
   - **Application URL**: your domain (e.g., `api.sansaai.in`)
   - **Application startup file**: `index.cjs`
4. Click **Create**

### Step 3: Install Dependencies (NPM Install)

1. In the Node.js app page, click **Run NPM Install**
2. Wait for it to complete
3. Or use **Terminal**: `cd ~/public_html/sansa-ai-backend && npm install`

### Step 4: Set Environment Variables

In **cPanel → Node.js Selector → Your App → Environment Variables**, add:

| Variable | Value | Required? |
|----------|-------|-----------|
| `NODE_ENV` | `production` | YES |
| `PORT` | `8080` | YES |
| `APP_BASE_URL` | `https://sansaai.in` | YES |
| `CORS_ORIGINS` | `https://sansaai.in,https://www.sansaai.in,https://api.sansaai.in` | YES |
| `ADMIN_USERNAME` | `admin@sansaai.in` | YES |
| `ADMIN_PASSWORD` | (your strong password) | YES |
| `SESSION_SECRET` | (long random string) | YES |
| `DATABASE_URL` | (PostgreSQL URL if using DB) | Optional |
| `DATABASE_SSL` | `false` | If using local cPanel PG |
| `USE_OPENAI` | `false` | Set `true` if you have OpenAI key |
| `FREE_WEB_SEARCH` | `true` | For DuckDuckGo search |
| `OPENAI_API_KEY` | (your key) | Optional |
| `PYTHON_BIN` | `python3` (or `python`) | For PDF tools |
| `SANSA_FORCE_PUBLIC_MODE` | `true` | Recommended |

**Optional (for paid features)**:
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `SANSA_UPI_ID`
- `VECTORENGINE_API_KEY`, `VECTORENGINE_API_URL`
- `REPLICATE_API_TOKEN`, `REPLICATE_VIDEO_MODEL`, `REPLICATE_SOUND_MODEL`, `REPLICATE_MUSIC_MODEL`

### Step 5: Set Up PostgreSQL (Optional)

Without PostgreSQL, the app runs in **JSON file mode** (data stored in `data/*.json`). This works for demos but is not recommended for production.

To use PostgreSQL:
1. Go to **cPanel → PostgreSQL Databases**
2. Create a new database (e.g., `sansa_ai`)
3. Create a user with a password
4. Add user to the database with ALL privileges
5. Set `DATABASE_URL` in Node.js env vars:
   ```
   postgresql://username:password@localhost:5432/database_name
   ```
6. The schema is **auto-created** when the app starts (no manual SQL needed)

### Step 6: Set Up Python (For PDF Tools)

1. Go to **cPanel → Terminal**
2. Run: `pip install PyPDF2==1.26.0`
3. Check Python path: `which python3` (or `which python`)
4. Set `PYTHON_BIN` env var to match (e.g., `python3` or `python`)

### Step 7: Start/Restart the App

1. Go to **cPanel → Node.js Selector**
2. Find your app → Click **Restart**
3. Wait 10-15 seconds
4. Visit `https://api.sansaai.in/health` — should show `{"ok":true,"app":"SANSA AI"}`

### Step 8: DNS Setup (if not done)

| Record | Type | Value |
|--------|------|-------|
| `sansaai.in` | A | Your server IP |
| `www.sansaai.in` | CNAME | `sansaai.in` |
| `api.sansaai.in` | A or CNAME | Same server |

---

## Verify Everything Works

After deploy, check these URLs:

| URL | Expected |
|-----|----------|
| `https://api.sansaai.in/health` | `{"ok":true,"app":"SANSA AI"}` |
| `https://api.sansaai.in/api/health` | `{"ok":true,"app":"SANSA AI"}` |
| `https://api.sansaai.in/` | SANSA landing page |
| `https://api.sansaai.in/admin/login` | Admin login page |
| `https://api.sansaai.in/api/live-audit/status` | Audit status JSON |

---

## Troubleshooting

**App won't start**: Check the `stderr.log` in your app directory via File Manager.

**"Cannot find module" errors**: Run NPM Install again from the Node.js Selector.

**Sessions not persisting**: Without PostgreSQL, sessions use memory store (lost on restart). Add `DATABASE_URL` for persistent sessions.

**CORS errors in browser**: Make sure `CORS_ORIGINS` includes your frontend domain with `https://`.

**PDF tools not working**: Check `PYTHON_BIN` points to the correct Python binary. Test with: `python3 -c "import PyPDF2; print('OK')"`

---

## File Permissions

Make sure these directories are writable:
- `uploads/` — for file uploads
- `data/` — for JSON storage (when no PostgreSQL)
- `tmp/` — for temporary files

In cPanel Terminal: `chmod 755 uploads data tmp`

---

## Post-deploy checklists (operations)

After the app is live, use these **in order**:

| Step | Document |
|------|----------|
| 1 — Stabilize (week 1) | `deploy-ready/STABILIZE_WEEK1_CHECKLIST.md` — daily smoke tests, Network tab review, error-log checks |
| 2 — Backup & recovery | `deploy-ready/BACKUP_AND_RECOVERY_CHECKLIST.md` |

When other ops PRs merge on GitHub, `git pull origin main` to pick up additional `deploy-ready/*CHECKLIST.md` files and refresh this table if needed.
