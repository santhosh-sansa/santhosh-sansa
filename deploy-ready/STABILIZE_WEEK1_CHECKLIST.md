# SANSA — Week 1 stabilization checklist (post-deploy)

Use this for **7 days** after merge + deploy. Spend **10–15 minutes per day**. Goal: catch **404 / 5xx / slowness** before users report them.

**Related:** `deploy-ready/MILESWEB_DEPLOY_GUIDE.md`

---

## How to use

1. Fill **Date** and **Tester** each day.
2. Check boxes when done.
3. Under **Issues found**, paste URL or short note (e.g. `GET /api/foo 500`).
4. If the **same** issue appears **twice** → open a **GitHub Issue** or add to your fix list.

**Step 1 complete when:** Days 1–7 rows filled (even “no issues”).

---

## Production URLs (fill yours)

| Role | URL |
|------|-----|
| Public site | https://________________ |
| API base (if separate) | https://________________ |
| Health (if exposed) | https://________________/health |

---

## Day 1 — Smoke test (desktop)

| Field | Value |
|-------|-------|
| Date | |
| Tester | |

- [ ] Open **home** — loads under 5 s (note if slower): ________ s  
- [ ] **Login / register** (if enabled) — works or N/A: ________  
- [ ] Tool **A** (e.g. PDF or invoice): ________ — pass / fail  
- [ ] Tool **B**: ________ — pass / fail  

**Issues found (URLs + symptom):**

```
(paste here)
```

---

## Day 2 — Browser Network (desktop)

| Field | Value |
|-------|-------|
| Date | |
| Tester | |

**Chrome / Edge:** `F12` → **Network** → reload page → filter **Fetch/XHR** and **Doc**.

- [ ] Note any row **red** (4xx/5xx) — list URL + status:  
```
(paste here)
```
- [ ] Open **slow** requests (over 2 s) — note URL + time:  
```
(paste here)
```

---

## Day 3 — Server logs (cPanel)

| Field | Value |
|-------|-------|
| Date | |
| Tester | |

- [ ] cPanel → **Errors** / **Metrics** / **Raw access** / **Error log** (host name varies)  
- [ ] Search for: `sansa`, `node`, `500`, `Error`  
- [ ] Copy **1–3** relevant lines (no secrets):  

```
(paste here)
```

---

## Day 4 — Mobile + private window

| Field | Value |
|-------|-------|
| Date | |
| Tester | |

- [ ] **Phone** (or narrow browser): home + 1 tool — pass / fail  
- [ ] **Incognito / private** window: home + login + 1 tool — pass / fail  

**Issues found:**

```
(paste here)
```

---

## Day 5 — Repeat smoke

| Field | Value |
|-------|-------|
| Date | |
| Tester | |

- [ ] Same as **Day 1** quick path (home + 2 tools)  
- [ ] Compare to Day 1 — **new** regression? Y / N — note:  

```
(paste here)
```

---

## Day 6 — Repeat Network

| Field | Value |
|-------|-------|
| Date | |
| Tester | |

- [ ] Network tab again on **heaviest** page (dashboard / tools)  
- [ ] Any **new** red lines vs Day 2? Y / N — note:  

```
(paste here)
```

---

## Day 7 — Review + backlog

| Field | Value |
|-------|-------|
| Date | |
| Tester | |

- [ ] Re-read Days **1–6** notes  
- [ ] List **top 3** issues by impact:  
  1. ________________________  
  2. ________________________  
  3. ________________________  
- [ ] Created **GitHub issues** / tickets (links):  

```
(paste here)
```

---

## GitHub issue template (copy when same error twice)

**Title:** `[Stabilize] <short symptom>`

**Body:**

```markdown
## Where
Production URL: 
Page / action:

## Symptom
- Expected:
- Actual:
- HTTP status (if any):

## How often
Seen on days: (e.g. Day 2 + Day 6)

## Screenshots / log lines
(paste — redact secrets)
```

---

## Sign-off

| Item | Done |
|------|------|
| All 7 days filled | [ ] |
| Repeated issues logged for fix | [ ] |
| Ready for **Step 2 — Backup** | [ ] |

**Completed on (date):** ________________
