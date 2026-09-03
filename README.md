# MEP Engineering Exam (Static, No-Backend Edition)

A fully client-side MEP (Mechanical, Electrical, Plumbing) engineering MCQ exam and practice platform. **Plain HTML, CSS, and JavaScript — no framework, no build step, no server, no database, no login.** Everything runs in your browser; all data (questions, exam history, bookmarks, progress) is stored locally via IndexedDB.

Ships with a bundled bank of **5,000 questions** across Electrical, HVAC, Fire Fighting, Plumbing, ELV, BMS, Lifts, Solar, MEP Estimation, and Codes & Standards, loaded automatically the first time you open the app.

## Running it

You don't need Node.js, npm, or any dependency to use the app day-to-day — just a static file server (or, for most features, even opening `index.html` directly). Pick one:

### Option A — open it directly (simplest)
Double-click `index.html`. This works in most browsers because the app avoids `fetch()` for local files (the bundled question bank loads via a plain `<script>` tag), but IndexedDB behavior on the `file://` origin varies slightly by browser — if you see storage issues, use Option B instead.

### Option B — a tiny local static server (recommended)
```bash
npx --yes serve -l 5000 .
```
Then open `http://localhost:5000`. Any static server works (Python's `http.server`, VS Code's Live Server extension, etc.) — the app has no server-side requirements at all.

### Option C — deploy it as a static site
Push this folder to any static host: Vercel, Netlify, GitHub Pages, Cloudflare Pages, or a plain S3 bucket. No build command, no environment variables, no framework preset needed — just "deploy this directory as static files."

## How data works

- **The 5,000-question bank** is embedded in `data/seed-questions.js` and loaded into IndexedDB the first time the app runs in a given browser. After that, the app skips re-loading the (large) bundled file and reads straight from IndexedDB.
- **Everything you do** — exams taken, scores, bookmarks, questions you add/edit/import, reported questions — is saved in that same browser's IndexedDB. It is **per-browser and per-device**: nothing syncs, nothing is sent anywhere, and clearing your browser's site data for this app will reset it back to just the bundled 5,000 questions.
- **No login, no admin gate.** Since there's no backend to enforce one, every feature (including question bank management) is available to whoever opens the page. If you need to keep this on a shared machine, that's a matter of physical/OS-level access control, not something this app can enforce.

## Regenerating the bundled question bank

The 5,000 questions are produced by a deterministic generator (adapted from the original project), not hand-typed. To change or regenerate it:

```bash
node tools/build-seed-data.mjs
```

This requires Node.js (only for this one offline authoring step — never for running the app itself) and rewrites `data/seed-questions.js`. It's deterministic: re-running it produces the same 5,000 questions with the same IDs every time. Note that regenerating this file does **not** retroactively update a browser that already seeded its IndexedDB — those users would need to clear site data, or you can add new questions via **Admin → Import** instead.

## Managing your own questions

- **Admin → Add Question**: full validation (all 4 options required and distinct, minimum lengths, discipline/topic/difficulty required) plus a client-side "possible duplicate" warning (word-overlap similarity against the existing bank).
- **Admin → Import**: upload a CSV or JSON file. CSV columns: `question,optionA,optionB,optionC,optionD,correctAnswer,explanation,discipline,topic,subtopic,difficulty,tags,calculationBased`. A sample template is downloadable from that page. JSON should be an array of objects with the same field names (camelCase).
- **Admin → Export**: download the full bank, or a discipline/topic/difficulty-filtered subset, as CSV.
- **Admin → Manage Questions**: search, filter, edit, duplicate, bulk-select and delete.

## Project structure

```text
index.html                  Single HTML shell — everything renders into it via the hash router
css/styles.css               Design tokens (light/dark) + component styles, plain CSS
js/
  app.js                     Hash router + app shell (sidebar/topbar) + bootstrap
  db.js                      Promise wrapper around IndexedDB (schema + generic CRUD)
  seed-loader.js              One-time load of the bundled bank into IndexedDB
  exam-engine.js              Random question selection + scoring (client-side)
  lib/
    utils.js                  Formatting, toasts, confirm dialogs, misc helpers
    constants.js               Disciplines/topics/difficulties
    csv.js                     Hand-rolled CSV parse/stringify
    charts.js                  Dependency-free bar/ratio/sparkline "charts"
  views/*.js                  One file per screen (dashboard, exam runner, admin, etc.)
data/seed-questions.js         The bundled 5,000-question bank (generated, not hand-written)
tools/
  build-seed-data.mjs          Regenerates data/seed-questions.js (Node, offline use only)
  seed-generator/               The underlying deterministic question generator
assets/sample-questions-template.csv   Downloadable CSV import template
```

## Known limitations

- No cross-device sync, no accounts, no server-side backup — this is a local, single-browser tool by design (per the no-backend requirement). Exporting your question bank periodically (Admin → Export) is a reasonable way to keep a backup.
- No real access control — anyone with access to the browser/device has full admin capability.
- Duplicate detection is a lightweight word-overlap heuristic, not a hard block — it flags likely duplicates for you to confirm, not reject.
- Very old browsers without IndexedDB support won't work; any browser from the last several years is fine.
# MEP-MCQ-EXAM
# MEP-MCQ-EXAM
# MEP-MCQ-EXAM
