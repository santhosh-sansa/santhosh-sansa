# SANSA Super AI

Node.js + Python + PostgreSQL AI search tool for cPanel-style hosting.

## What This Includes

- **Sansa Frontend.zip** extras merged into `public/`: `invoice.html`, `cfo-dashboard.html`, `customer-portal.html`, `js/*`, `css/style.css` (same core `index.html` / `app.js` as the zip baseline).
- **Skill & knowladge.zip** archives extracted to `data/skill-packs/` and listed via `GET /api/skills/status` (`bundledSkillPacks`) and `GET /api/skills/packs`.
- Public AI search/chat UI
- Admin login
- Admin document upload
- Manual teaching
- User logs
- Search testing page
- Python document extraction pipeline
- PostgreSQL schema
- pgvector optional upgrade file
- Free local text search and public web-search answers

## Stack

- Frontend: HTML/CSS/JavaScript served by Node
- Backend: Node.js + Express
- AI Processing: Python script called from Node
- Database: PostgreSQL
- AI Search: JSON embedding fallback now, pgvector optional upgrade
- AI API: free local knowledge search + public web search
- No-payment mode: local knowledge text search + free public web search

## cPanel Deploy

1. Upload this folder or zip to your Node.js application root, for example `public_html/sansa-ai-backend`.
2. In cPanel Node.js selector:
   - Application startup file: `index.cjs`
   - Node version: 18 or 20
   - App URL: your API/domain URL
3. Run NPM Install.
4. Copy `.env.example` to `.env`.
5. Set:
   - `DATABASE_URL`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `USE_OPENAI=false` for free-search mode
   - `FREE_WEB_SEARCH=true` for public web search fallback
   - `VECTORENGINE_API_KEY` if you want VectorEngine AI/RAG provider mode
6. Restart Node app.
7. Open `/admin/login`.

## Live Option Audit

After deploy/restart, verify every public option is mapped and no button falls into a 404:

```text
https://api.sansaai.in/api/live-audit/status
https://api.sansaai.in/admin/live-audit
```

Health `working-with-fallbacks` is acceptable for cPanel-safe mode. Add real provider keys and enable live modes when you want binary PDF conversion, live WhatsApp send, Razorpay checkout, or AI media generation.

## Python Setup

Install Python requirements in your cPanel terminal or Python app environment. These versions are pinned for wider cPanel compatibility:

```bash
pip install -r python/requirements.txt
```

If your server uses `python` instead of `python3`, set:

```bash
PYTHON_BIN=python
```

## Flow

Admin Upload -> Python extracts text -> Node splits chunks -> PostgreSQL store -> User asks -> search relevant chunks -> SANSA returns local/public-source answer.

No-payment mode:

Admin Upload/Manual Teaching -> PostgreSQL text search -> direct source-based answer. If no local knowledge is found, SANSA tries free public DuckDuckGo web results and readable public pages, then composes a source-based answer. This does not guarantee access to every website and may be blocked by search engines or websites, but it avoids paid AI/search APIs.

## Security

Do not put API keys in frontend JavaScript. Keep all secrets in `.env`. If a key was shown in screenshots, rotate it immediately.

## VectorEngine AI Env

Add the token only in cPanel/MilesWeb Node.js Environment Variables:

```bash
VECTORENGINE_API_KEY=your_token_here
VECTORENGINE_API_URL=https://api.vectorengine.ai
```

`VECTOR_ENGINE_API_KEY` is also supported as an alias. Restart the Node app after saving.
