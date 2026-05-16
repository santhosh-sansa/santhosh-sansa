# SANSA — Backup & recovery checklist (Step 2)

**Time:** about **30–45 minutes** the first time; then **15 minutes** on a schedule.  
**Goal:** You can **restore database + app data** after mistake, hack, or host failure.

**Related:** `deploy-ready/MILESWEB_DEPLOY_GUIDE.md` · Step 1: `deploy-ready/STABILIZE_WEEK1_CHECKLIST.md` (if present on `main`)

---

## Before you start (fill once)

| Item | Your value |
|------|------------|
| cPanel URL | |
| Primary domain | |
| PostgreSQL DB name (if used) | |
| App root on server (example) | `~/repos/santhosh-sansa/sansa-backend` or `.../artifacts/sansa-backend` |
| Where backups will be stored (folder + cloud) | |

---

## A — Database export (phpMyAdmin)

Use this if SANSA uses **MySQL/MariaDB** (typical cPanel). If you use **only** JSON files under `data/` and no DB, mark **N/A** and rely on **section B + C**.

1. cPanel → **phpMyAdmin**.
2. Left sidebar → **select your database** (not `information_schema`).
3. Top tab → **Export**.
4. Method: **Quick** · Format: **SQL** (default).
5. Click **Go** → save file as:

   `sansa-db-YYYY-MM-DD.sql`  
   (replace `YYYY-MM-DD` with today’s date.)

6. Copy the `.sql` file to:
   - [ ] **Local PC** (Downloads / project vault)  
   - [ ] **Cloud** (Drive / Dropbox / S3 — **not** a public folder)

**Optional — larger DB:** choose **Custom** export, compression **gzip**.

**Done:** [ ] SQL file saved in **≥2** places (host + local or cloud)

---

## B — Host-level backup (cPanel)

Pick what your host offers (names vary):

1. cPanel → **Backup** / **Backup Wizard** / **JetBackup** / **Site Backup**.
2. Enable or run:
   - [ ] **Full account backup** (home directory + DB), **or**
   - [ ] **Scheduled** weekly/monthly backup if the plan includes it.
3. Note the **provider’s retention** (e.g. “last 7 days”) — you may still want your own copy in section A/C.

**Done:** [ ] You know **where** host backups appear and **how to restore** (link or screenshot path in notes below).

```
Notes:
```

---

## C — Application files & secrets (no `node_modules`)

**Never commit `.env`** — copy it **only** to a secure place (password manager export, encrypted disk, private cloud).

### Typical SANSA paths (adjust to your layout)

| What | Path (examples) |
|------|------------------|
| Runtime JSON data | `.../sansa-backend/data/` (or `artifacts/sansa-backend/data/`) |
| Uploads | `.../sansa-backend/uploads/` |
| Environment | `.../sansa-backend/.env` (copy **secure**; do not push to git) |
| Repo without deps | whole `~/repos/santhosh-sansa` **excluding** `node_modules` |

### Optional — tarball from SSH (exclude heavy dirs)

Run from **parent** of repo; adjust paths.

```sh
BACKUP_ROOT="$HOME/backups"
mkdir -p "$BACKUP_ROOT"
cd "$HOME/repos" || exit 1
tar --exclude='santhosh-sansa/**/node_modules' \
    --exclude='santhosh-sansa/.git' \
    -czvf "$BACKUP_ROOT/santhosh-sansa-files-$(date +%Y-%m-%d).tar.gz" \
    santhosh-sansa
```

- [ ] Archive created: path `________________________`  
- [ ] Copied to second location (cloud / other disk): [ ]

**`.env` separately:** [ ] Saved in vault (name: ________________) — **not** inside public zip on Drive.

---

## D — Schedule (weekly)

| Field | Value |
|-------|-------|
| Weekly backup day (e.g. Sunday) | |
| Calendar / phone reminder set? | [ ] Yes |

**Automation (optional):** host cron or GitHub Action that only **pulls** backups off-server — document your choice:

```
(paste link or cron line here — no secrets)
```

---

## E — Recovery drill (do once after first backup)

**Goal:** Prove you can restore, not only backup.

1. **Test DB restore** on a **copy** DB or local MariaDB (import SQL) — [ ] Done / N/A  
2. **Test file restore** — unpack tarball to a temp folder and confirm `data/` looks right — [ ] Done  
3. Write **3 bullet** “disaster restore” steps you would follow under stress:

```
1.
2.
3.
```

---

## Sign-off (Step 2 complete)

| Check | Done |
|-------|------|
| DB export OR N/A documented | [ ] |
| Host backup path / schedule known | [ ] |
| `data/` + uploads + `.env` (secure) covered | [ ] |
| Weekly reminder set | [ ] |
| Recovery drill done or scheduled | [ ] |

**Last full backup date:** `YYYY-MM-DD` → ______________  
**Next planned backup date:** ______________  
**Primary backup location(s):** ______________  

**Step 2 complete when:** the table above is filled and dates are real.

---

## Quick reference — restore order (production down)

1. Stop app / put maintenance page (optional).  
2. Restore **database** from `.sql` (phpMyAdmin → Import).  
3. Restore **files** (`data/`, `uploads/`, `public/` if needed) from tarball or git tag.  
4. Restore **`.env`** from secure vault (never from git).  
5. `npm ci` or `npm install` in app directory if `package.json` changed.  
6. Restart Node / Passenger (see deploy guide).  
7. Smoke test (Step 1 checklist).
