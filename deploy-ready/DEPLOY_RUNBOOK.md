# SANSA — Deploy runbook (Step 5)

**Goal:** If you are **not available**, someone else (or future you) can **pull, install, restart, or roll back** safely.

**Time to fill:** about **1 hour** first time; **5 minutes** when URLs/paths change.

**Related:** `deploy-ready/MILESWEB_DEPLOY_GUIDE.md` · Steps 1–4: other `deploy-ready/*CHECKLIST.md` files

---

## 1 — People & access (fill once)

| Role | Name / team | Contact |
|------|-------------|---------|
| Repo owner | | |
| Hosting / cPanel | | **Support URL:** _________________________ **Ticket / chat:** |
| Domain DNS | | |
| Payment provider (e.g. Razorpay) | | Dashboard URL only (no secrets here) |

---

## 2 — Where the app lives (server)

| Item | Your value |
|------|------------|
| SSH host | |
| SSH user | |
| **Git clone path** (canonical) | e.g. `~/repos/santhosh-sansa` |
| **Node app root** (where `package.json` + start file live) | e.g. `~/repos/santhosh-sansa/sansa-backend` |
| **Application startup file** (cPanel Node selector) | e.g. `index.cjs` or `server.js` |
| **Public site URL** | `https://________________` |
| **API / same host URL** (if different) | `https://________________` |

---

## 3 — Git: update to latest `main`

```sh
ssh YOUR_USER@YOUR_HOST
cd YOUR_CLONE_PATH_HERE          # e.g. ~/repos/santhosh-sansa
git fetch origin
git checkout main
git pull origin main
```

- [ ] Confirmed on correct branch: `git branch --show-current` → `main`

---

## 4 — Node / npm on cPanel (PATH)

`npm` is often **not** on default SSH PATH. Use **full path** or extend PATH.

**Detected Node on this host (fill after you run `node -v` once):**

```sh
export PATH="/opt/alt/alt-nodejs20/root/usr/bin:$PATH"   # adjust version/path per host
node -v
npm -v
```

**Install dependencies (app root = section 2):**

```sh
cd YOUR_APP_ROOT_HERE            # e.g. ~/repos/santhosh-sansa/sansa-backend
npm ci || npm install
```

**Optional — add to `~/.bashrc` so every SSH session has npm:**

```sh
echo 'export PATH="/opt/alt/alt-nodejs20/root/usr/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

*(Or use cPanel **Setup Node.js App** → “Enter virtual environment” command, then `npm install`.)*

---

## 5 — Restart application

Pick what matches your host:

| Method | What to do |
|--------|------------|
| **Passenger** | cPanel → **Setup Node.js App** → **Restart**; or `touch tmp/restart.txt` inside app root **if** `tmp/` exists and Passenger uses it |
| **Custom script** | Command: _________________________________________________ |
| **GitHub Actions deploy** | Requires secrets; see `MILESWEB_DEPLOY_GUIDE.md` |

- [ ] Restart done after each deploy that changes server code or `package.json`

---

## 6 — Smoke check after deploy

| URL | Expected |
|-----|----------|
| `/health` or `/api/health` | JSON `ok: true` (see `MILESWEB_DEPLOY_GUIDE.md`) |
| Home page | Loads |
| One critical tool you rely on | Works |

---

## 7 — Rollback (use only when deploy broke production)

**Warning:** `git checkout <old_commit>` leaves **detached HEAD** on server — OK for emergency, then fix forward on `main` from laptop.

```sh
cd YOUR_CLONE_PATH_HERE
git log -1 --oneline              # note current before rollback
git fetch origin
git checkout main
git log --oneline -5               # pick last known good SHA
git checkout PASTE_GOOD_SHA_HERE   # detached — app dir may still be subfolder
# reinstall if package.json differs
cd YOUR_APP_ROOT_HERE && npm ci || npm install
# restart app (section 5)
```

**Alternative:** cPanel **JetBackup / Restore** a known-good **full account** backup (see Step 2 backup doc).

**Never rollback secrets from git** — restore `.env` from **vault** only.

---

## 8 — Share this runbook (Step 5 complete)

| Check | Done |
|-------|------|
| Sections 1–2 filled (paths, URLs, contacts) | [ ] |
| Sections 3–5 tested once from a **clean** SSH session | [ ] |
| Rollback section read by a second person (peer check) | [ ] |

**Where this file lives in repo:** `deploy-ready/DEPLOY_RUNBOOK.md`  
**Shared with (e.g. Slack / email / Drive link):** _________________________________________________  
**Date shared:** ______________

**Step 5 complete when:** link or file path is **communicated to the team** (or stored in your ops wiki) and the table above is checked.
