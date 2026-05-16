# SANSA — Secrets & environment checklist (Step 3)

**Time:** about **20 minutes** first pass; **5 minutes** on a schedule (e.g. quarterly).  
**Goal:** Know **where every secret lives**, confirm **nothing sensitive is in git**, and mark keys **verified** or **rotated**.

**Related:** `deploy-ready/MILESWEB_DEPLOY_GUIDE.md` · Step 2: `deploy-ready/BACKUP_AND_RECOVERY_CHECKLIST.md`

---

## Where secrets can live (pick what you use)

| Location | Typical use |
|----------|-------------|
| **`.env`** on server | Node app at runtime (never commit) |
| **cPanel → Node.js App → Environment Variables** | Same as `.env`, host-managed |
| **GitHub → Repository → Settings → Secrets and variables → Actions** | CI/CD (e.g. `MILESWEB_SSH_*` from deploy workflow) |
| **Password manager / vault** | Master copy, rotation history |

---

## A — Confirm `.env` is not tracked by git

Run in your **clone** (laptop or server):

```sh
cd /path/to/santhosh-sansa
git check-ignore -v sansa-backend/.env artifacts/sansa-backend/.env 2>/dev/null || true
```

Expected: each path that exists on disk should be **ignored** (git prints a rule).

**Repo rule check** (`.gitignore` should contain):

- `sansa-backend/.env`
- `artifacts/sansa-backend/.env`

- [ ] `git check-ignore` OK for real `.env` path(s)  
- [ ] No `.env` with secrets ever pushed — if unsure, rotate **SESSION_SECRET** and all API keys below.

---

## B — Inventory (fill: key → where → last checked)

Copy the table and add rows for **only** what you actually use. **Do not paste real secret values** into this file if it is stored in git — use `***` or “set in cPanel”.

| Key / secret (name) | Stored where (`.env` / cPanel / GitHub / vault) | Last checked (YYYY-MM-DD) | Verified OK | Rotated this pass? |
|---------------------|--------------------------------------------------|-----------------------------|---------------|----------------------|
| `DATABASE_URL` | | | [ ] | [ ] |
| `SESSION_SECRET` | | | [ ] | [ ] |
| `ADMIN_PASSWORD` | | | [ ] | [ ] |
| `OPENAI_API_KEY` | | | [ ] | [ ] |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | | | [ ] | [ ] |
| `RAZORPAY_WEBHOOK_SECRET` | | | [ ] | [ ] |
| `VECTORENGINE_API_KEY` / `VECTOR_ENGINE_API_KEY` | | | [ ] | [ ] |
| `REPLICATE_API_TOKEN` | | | [ ] | [ ] |
| `GOOGLE_AI_API_KEY` | | | [ ] | [ ] |
| `SANSA_UPI_ID` (public-style ID; still treat as sensitive in docs) | | | [ ] | [ ] |
| **GitHub Actions:** `MILESWEB_SSH_HOST` | GitHub Secrets | | [ ] | [ ] |
| **GitHub Actions:** `MILESWEB_SSH_USER` | GitHub Secrets | | [ ] | [ ] |
| **GitHub Actions:** `MILESWEB_SSH_KEY` | GitHub Secrets | | [ ] | [ ] |
| **GitHub Actions:** `MILESWEB_REPO_PATH` | GitHub Secrets | | [ ] | [ ] |
| **GitHub Actions:** `MILESWEB_RESTART_CMD` | GitHub Secrets (optional) | | [ ] | [ ] |

**More keys from your real `.env`:** (add rows)

| Key / secret (name) | Stored where | Last checked | Verified | Rotated |
|---------------------|--------------|----------------|----------|---------|
| | | | [ ] | [ ] |

---

## C — Rotate only when needed

Rotate **if**: leak suspected, employee left, key in chat/email, or compliance policy.

| Action | Notes |
|--------|--------|
| **OpenAI / Razorpay / etc.** | Provider dashboard → revoke old → create new → update `.env` or cPanel env → **restart Node** |
| **`SESSION_SECRET` change** | All users **logged out** once |
| **`RAZORPAY_WEBHOOK_SECRET`** | Must match Razorpay dashboard webhook settings after rotate |

**This pass rotated:** Y / N — list names only: ________________________________

---

## D — Production sanity (no secrets in output)

- [ ] Repo search: no live keys in tracked files (spot-check `public/`, `*.html`, `*.js` in git history only if you suspect a leak — use GitHub secret scanning if available).  
- [ ] `APP_BASE_URL` / `CORS_ORIGINS` match **HTTPS** live domains.  
- [ ] `ADMIN_PASSWORD` is **not** default `Admin@123` on public internet.

---

## Sign-off (Step 3 complete)

| Check | Done |
|-------|------|
| Inventory table filled (name → where → date) | [ ] |
| `.env` ignored / not in git | [ ] |
| GitHub Secrets listed (or N/A) | [ ] |
| Rotation done or explicitly “not needed” | [ ] |

**Completed on (date):** ______________  
**Next review date (suggest +90 days):** ______________

**Step 3 complete when:** the short list “key name → where → last checked date” is filled for every secret you rely on.
