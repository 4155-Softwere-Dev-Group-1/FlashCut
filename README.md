# FlashCut Codebase Tour for a Newcomer

Here’s the quickest mental model: this is a monorepo with two apps — a Chrome extension frontend and a Node/Express backend API — plus SQL schema setup. The current implementation is mostly scaffolded, with core flow outlined but several TODOs still open.

---

## 1) General Structure

### Root

Orchestrates both subprojects via npm scripts (`dev` runs extension + server together with `concurrently`).

### extension/

Chrome extension (Manifest V3) with:
- Popup UI  
- Content script  
- Service worker  
- API client  
- Storage helpers  

### server/


### server/migrations/init.sql

PostgreSQL schema for:
- users  
- flashcards  
- decks  
- deck ↔ flashcard join table  

### Battle_Plan.md

Long-form project roadmap/playbook; useful for onboarding intent and milestone planning.

Express app with a layered backend structure:


---

## 2) How the App Is Intended to Work (End-to-End)

1. User interacts with the extension UI/content on a page.
2. Extension sends selected content to backend (`POST /api/flashcards`).
3. Backend controller calls service layer.
4. Service layer calls AI generation and (eventually) persists/retrieves records from Postgres.
5. Results return to extension popup/UI.

This flow is visible in:

- Manifest wiring (popup + content script + service worker)
- Extension API client target (`http://localhost:5000/api/flashcards`)
- Server route → controller → service chain
- Server startup + route mount path

---

## 3) Important Things to Know Right Away

### Scaffold Status / TODO-Heavy

- Popup click handler is still TODO
- Selection handling is TODO
- AI service currently returns sample data
- Validation middleware is minimal
- Flashcard generation service has a TODO to save generated flashcards

---

### Layered Backend Architecture Is Already Good

- App bootstrap present
- Route registration implemented
- Controller delegation structured
- Service logic separated
- Middleware separation in place

---

### Database Pieces Are Partly Duplicated / Incomplete in Usage

- There is both a `Flashcard` model class and raw SQL query usage in service
- The model isn’t integrated into the flow yet

---

### Config Is Environment-Driven

- Database and OpenAI are wired from environment variables:
  - `DB_*`
  - `OPENAI_API_KEY`
  - `SERVER_PORT`

---

### Extension Permissions Are Broad

- `host_permissions: ["<all_urls>"]`
- Content script runs on all URLs

Useful for development, but should be tightened for production.

---

## 4) Suggested Learning Path (What to Learn Next)

If onboarding, follow this order:

### 1. Run and Trace One API Request

- Start server
- Hit `POST /api/flashcards`
- Follow route → controller → service

This gives immediate understanding of backend flow.

---

### 2. Understand Chrome Extension Runtime Model (Manifest V3)

Learn the difference between:
- Popup script
- Content script
- Service worker lifecycle

This repo uses all three roles (even if minimally implemented).

---

### 3. Finish the “Happy Path” TODOs

Implement:

- Selection capture
- Popup action
- API call
- DB persistence

The current TODO markers act as the roadmap.

---

### 4. Harden Backend Validation + Error Handling

- Expand `validateRequest`
- Standardize error shapes
- Apply formatter utility consistently

---

### 5. Wire Real OpenAI Integration

- Replace stub with actual OpenAI calls
- Add retries/fallbacks
- Add cost controls

---

### 6. Align Persistence Strategy

Choose one approach:

- Model-centric
- Service/raw-query style

Then make it consistent across the codebase.

---

## 5) Practical Newcomer Pointers

- Keep architecture docs near code
- `README.md` is brief
- `Battle_Plan.md` contains more process context
- Add `.env.example` early (not currently present)
- Add real tests once flow solidifies (backend route/service tests first)
- Restrict extension host permissions before release

---

## Commands Used to Inspect the Repo

```bash
pwd && find .. -name AGENTS.md -print

rg --files | head -n 200

sed -n '1,220p' README.md

cat package.json && echo '---' && cat extension/package.json && echo '---' && cat server/package.json

nl -ba <key backend and extension files>

nl -ba server/migrations/init.sql

nl -ba Battle_Plan.md
