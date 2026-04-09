# FlashCut

Chrome extension (Manifest V3) + Node/Express API + PostgreSQL. Save vocabulary flashcards from selected text and optionally simplify longer selections with AI.

## Quick start

1. **Install dependencies**

   ```bash
   npm install
   npm install --prefix server
   ```

2. **Environment** — Copy `.env.example` to `.env` in the repo root (`FlashCut/.env`). The server loads it from there. Set at least `DATABASE_URL`, `JWT_SECRET`, and `ANTHROPIC_API_KEY`. Optional: `SERVER_PORT` (defaults below).

3. **Database** — Run `server/migrations/init.sql` against your Postgres instance.

4. **Run the API** — Default port is **5001** (avoids macOS AirPlay / Control Center on **5000**).

   ```bash
   npm run dev --prefix server
   ```

   Check `http://localhost:5001/health`.

5. **Load the extension** — In Chrome: `chrome://extensions` → Developer mode → **Load unpacked** → choose the `extension/` folder. Reload the extension after code changes.

6. **Backend URL** — If you use a non-default host/port, open the extension **Options** and set **Backend URL** (stored in extension storage). Default is `http://localhost:5001`.

## Features

| Shortcut | Action |
|----------|--------|
| **Alt+S** | Save **1–3 words** as a flashcard (`POST /api/flashcards`). |
| **Alt+D** | Simplify **2+ words** via `POST /api/simplify` (not saved to the database). |

Shortcuts can be changed under `chrome://extensions/shortcuts`. They do not run on restricted pages (e.g. `chrome://`).

## API overview

| Area | Routes |
|------|--------|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Flashcards | `POST /api/flashcards`, `GET /api/flashcards`, `PUT /api/flashcards/:id`, `DELETE /api/flashcards/:id` |
| Simplify | `POST /api/simplify` (body: `{ "text": "..." }`, min 2 words) |

AI calls use **Anthropic** (`ANTHROPIC_API_KEY` in `.env`).

## Repository layout

- **`extension/`** — Popup, options page, content script, background service worker, `lib/apiConfig.js` for API base URL.
- **`server/`** — Express app (`src/app.js`), routes, services, migrations.
- **`Battle_Plan.md`** — Longer roadmap / process notes.

## Development notes

- Root `npm run dev` runs the server with `concurrently`; the extension is developed by loading it unpacked in Chrome (no separate build step in the current `extension/package.json` scripts).
- Tighten `host_permissions` / CORS before a public release.
