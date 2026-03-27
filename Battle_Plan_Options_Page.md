# Options Page Implementation Plan
## FlashCut Chrome Extension

---

## Overview

The Options Page is a full-page Chrome extension UI (separate from the popup) that gives users a complete flashcard management dashboard with:
- **View** — browse all saved flashcards
- **Edit** — update question/answer inline
- **Delete** — remove individual cards
- **Export** — download cards as CSV or JSON

It opens when the user clicks "Open Full View" in the popup or right-clicks the extension icon → Options.

---

## STEP 1: Register Options Page in Manifest

### `extension/manifest.json` — Add options_page
```json
{
  "manifest_version": 3,
  "name": "ContextCard",
  "version": "0.1.0",
  "description": "AI-powered vocabulary flashcards from real reading",

  "permissions": [
    "storage",
    "activeTab"
  ],

  "options_page": "options/options.html",

  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content.js"],
      "run_at": "document_end"
    }
  ],

  "background": {
    "service_worker": "background/background.js"
  }
}
```

---

## STEP 2: New Server Routes

Before building the UI, the server needs `PUT` and `DELETE` endpoints.

### `server/src/routes/flashcardRoutes.js` — Add edit and delete
```javascript
const express = require('express');
const controller = require('../controllers/flashcardController');
const validateRequest = require('../middleware/validateRequest');
const requireAuth = require('../middleware/authMiddleware'); // after auth is implemented

const router = express.Router();

router.post('/', requireAuth, validateRequest, controller.createFlashcard);
router.get('/', requireAuth, controller.getFlashcards);
router.put('/:id', requireAuth, controller.updateFlashcard);       // ADD
router.delete('/:id', requireAuth, controller.deleteFlashcard);    // ADD

module.exports = router;
```

> **Note:** If auth is not yet implemented, remove `requireAuth` temporarily and add it back after [Battle_Plan_User_Auth.md](Battle_Plan_User_Auth.md) is complete.

---

### `server/src/services/flashcardService.js` — Add update and delete
```javascript
async function updateFlashcard(id, question, answer, userId) {
  const result = await pool.query(
    `UPDATE flashcards SET question = $1, answer = $2, updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [question, answer, id, userId]
  );
  if (result.rows.length === 0) throw Object.assign(new Error('Flashcard not found'), { status: 404 });
  return result.rows[0];
}

async function deleteFlashcard(id, userId) {
  const result = await pool.query(
    'DELETE FROM flashcards WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  if (result.rows.length === 0) throw Object.assign(new Error('Flashcard not found'), { status: 404 });
  return result.rows[0];
}

module.exports = {
  generateFlashcard,
  getAllFlashcards,
  updateFlashcard,  // ADD
  deleteFlashcard,  // ADD
};
```

---

### `server/src/controllers/flashcardController.js` — Add update and delete handlers
```javascript
async function updateFlashcard(req, res, next) {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer are required' });
    console.log(`[PUT /api/flashcards/${id}] user: ${req.userId}`);
    const flashcard = await flashcardService.updateFlashcard(id, question, answer, req.userId);
    res.json(flashcard);
  } catch (error) {
    next(error);
  }
}

async function deleteFlashcard(req, res, next) {
  try {
    const { id } = req.params;
    console.log(`[DELETE /api/flashcards/${id}] user: ${req.userId}`);
    await flashcardService.deleteFlashcard(id, req.userId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFlashcard,
  getFlashcards,
  updateFlashcard,  // ADD
  deleteFlashcard,  // ADD
};
```

---

## STEP 3: Create Options Page Files

Create the directory and three files:
```
extension/
└── options/
    ├── options.html
    ├── options.css
    └── options.js
```

---

### `extension/options/options.html`
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FlashCut — Manage Flashcards</title>
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>FlashCut</h1>
      <p class="subtitle">Manage your flashcards</p>
      <div class="toolbar">
        <input type="text" id="search-input" placeholder="Search cards..." />
        <button id="export-csv-btn">Export CSV</button>
        <button id="export-json-btn">Export JSON</button>
      </div>
    </header>

    <div id="status-bar" class="status-bar"></div>

    <div id="flashcard-list" class="flashcard-list">
      <p class="loading">Loading flashcards...</p>
    </div>
  </div>

  <script src="options.js"></script>
</body>
</html>
```

---

### `extension/options/options.css`
```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  background: #f7f9fc;
  color: #222;
  padding: 32px;
}

.container {
  max-width: 860px;
  margin: 0 auto;
}

header {
  margin-bottom: 24px;
}

h1 {
  font-size: 28px;
  color: #065A82;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

#search-input {
  flex: 1;
  padding: 8px 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

#export-csv-btn, #export-json-btn {
  background: #065A82;
  color: white;
}

#export-csv-btn:hover, #export-json-btn:hover {
  background: #054a6e;
}

.status-bar {
  min-height: 20px;
  font-size: 13px;
  color: green;
  margin-bottom: 12px;
}

.flashcard-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.flashcard-card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.flashcard-card.view-mode .edit-controls { display: none; }
.flashcard-card.view-mode .view-controls { display: flex; }
.flashcard-card.edit-mode .view-controls { display: none; }
.flashcard-card.edit-mode .edit-controls { display: flex; }

.card-field label {
  font-size: 11px;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 0.5px;
}

.card-field p {
  font-size: 15px;
  color: #222;
  margin-top: 2px;
}

.card-field textarea {
  width: 100%;
  font-size: 15px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
}

.view-controls, .edit-controls {
  gap: 10px;
  justify-content: flex-end;
}

.btn-edit { background: #e8f0fe; color: #065A82; }
.btn-delete { background: #fdecea; color: #c0392b; }
.btn-save { background: #065A82; color: white; }
.btn-cancel { background: #eee; color: #333; }

.card-meta {
  font-size: 11px;
  color: #bbb;
}

.loading, .empty-message {
  text-align: center;
  color: #888;
  font-size: 14px;
  margin-top: 60px;
}
```

---

### `extension/options/options.js`
```javascript
const API = 'http://localhost:5000';
let allCards = [];

async function getToken() {
  return new Promise(resolve => chrome.storage.local.get(['token'], r => resolve(r.token)));
}

function showStatus(msg, isError = false) {
  const bar = document.getElementById('status-bar');
  bar.textContent = msg;
  bar.style.color = isError ? 'red' : 'green';
  setTimeout(() => bar.textContent = '', 3000);
}

// ── Fetch all flashcards ──────────────────────────────────────────────────────
async function loadFlashcards() {
  const token = await getToken();
  try {
    const res = await fetch(`${API}/api/flashcards`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    allCards = await res.json();
    renderCards(allCards);
  } catch (e) {
    document.getElementById('flashcard-list').innerHTML =
      '<p class="empty-message">Could not reach server. Is it running?</p>';
  }
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderCards(cards) {
  const list = document.getElementById('flashcard-list');
  if (cards.length === 0) {
    list.innerHTML = '<p class="empty-message">No flashcards yet. Highlight a word on any webpage!</p>';
    return;
  }

  list.innerHTML = '';
  cards.forEach(card => list.appendChild(createCardElement(card)));
}

function createCardElement(card) {
  const div = document.createElement('div');
  div.className = 'flashcard-card view-mode';
  div.dataset.id = card.id;

  div.innerHTML = `
    <div class="card-field">
      <label>Question</label>
      <p class="view-question">${escapeHtml(card.question)}</p>
      <textarea class="edit-question" rows="2">${escapeHtml(card.question)}</textarea>
    </div>
    <div class="card-field">
      <label>Answer</label>
      <p class="view-answer">${escapeHtml(card.answer)}</p>
      <textarea class="edit-answer" rows="3">${escapeHtml(card.answer)}</textarea>
    </div>
    <div class="card-meta">Saved: ${new Date(card.created_at).toLocaleDateString()}</div>
    <div class="view-controls">
      <button class="btn-edit">Edit</button>
      <button class="btn-delete">Delete</button>
    </div>
    <div class="edit-controls">
      <button class="btn-save">Save</button>
      <button class="btn-cancel">Cancel</button>
    </div>
  `;

  div.querySelector('.btn-edit').addEventListener('click', () => enterEditMode(div));
  div.querySelector('.btn-cancel').addEventListener('click', () => exitEditMode(div, card));
  div.querySelector('.btn-save').addEventListener('click', () => saveCard(div, card.id));
  div.querySelector('.btn-delete').addEventListener('click', () => deleteCard(div, card.id));

  return div;
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
function enterEditMode(div) {
  div.className = 'flashcard-card edit-mode';
}

function exitEditMode(div, originalCard) {
  div.className = 'flashcard-card view-mode';
  div.querySelector('.edit-question').value = originalCard.question;
  div.querySelector('.edit-answer').value = originalCard.answer;
}

async function saveCard(div, id) {
  const token = await getToken();
  const question = div.querySelector('.edit-question').value.trim();
  const answer = div.querySelector('.edit-answer').value.trim();
  if (!question || !answer) return showStatus('Question and answer cannot be empty.', true);

  try {
    const res = await fetch(`${API}/api/flashcards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ question, answer })
    });
    const updated = await res.json();
    div.querySelector('.view-question').textContent = updated.question;
    div.querySelector('.view-answer').textContent = updated.answer;
    div.querySelector('.edit-question').value = updated.question;
    div.querySelector('.edit-answer').value = updated.answer;
    div.className = 'flashcard-card view-mode';
    showStatus('Flashcard updated.');

    // Update local array
    const idx = allCards.findIndex(c => c.id === id);
    if (idx !== -1) allCards[idx] = updated;
  } catch (e) {
    showStatus('Failed to update flashcard.', true);
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function deleteCard(div, id) {
  if (!confirm('Delete this flashcard?')) return;
  const token = await getToken();
  try {
    await fetch(`${API}/api/flashcards/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    div.remove();
    allCards = allCards.filter(c => c.id !== id);
    showStatus('Flashcard deleted.');
    if (allCards.length === 0) renderCards([]);
  } catch (e) {
    showStatus('Failed to delete flashcard.', true);
  }
}

// ── Search ────────────────────────────────────────────────────────────────────
document.getElementById('search-input').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allCards.filter(c =>
    c.question.toLowerCase().includes(query) ||
    c.answer.toLowerCase().includes(query)
  );
  renderCards(filtered);
});

// ── Export ────────────────────────────────────────────────────────────────────
document.getElementById('export-json-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(allCards, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'flashcards.json');
});

document.getElementById('export-csv-btn').addEventListener('click', () => {
  const header = 'id,question,answer,created_at';
  const rows = allCards.map(c =>
    `${c.id},"${escapeCSV(c.question)}","${escapeCSV(c.answer)}",${c.created_at}`
  );
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
  downloadBlob(blob, 'flashcards.csv');
});

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeCSV(str) {
  return str.replace(/"/g, '""');
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadFlashcards();
```

---

## STEP 4: Add "Open Full View" Button to Popup

### `extension/popup/popup.html` — Add link to options page
```html
<!-- Add inside .container, after the header -->
<button id="open-options-btn" class="open-options-btn">Manage Flashcards ↗</button>
```

### `extension/popup/popup.js` — Wire the button
```javascript
document.getElementById('open-options-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
```

### `extension/popup/popup.css` — Style the button
```css
.open-options-btn {
  background: none;
  border: 1px solid #065A82;
  color: #065A82;
  border-radius: 8px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 13px;
  align-self: flex-start;
}

.open-options-btn:hover {
  background: #e8f4fb;
}
```

---

## STEP 5: Reload Extension in Chrome

After all files are created:
1. Go to `chrome://extensions`
2. Find ContextCard → click the **reload icon**
3. Right-click extension icon → **Options** to open the options page
   — or click "Manage Flashcards ↗" in the popup

---

## Testing Checklist

```
[ ] Options page opens via right-click → Options
[ ] Options page opens via "Manage Flashcards ↗" button in popup
[ ] All saved flashcards load and display correctly
[ ] Search filters cards by question or answer text
[ ] Edit button switches card to edit mode
[ ] Cancel restores original values
[ ] Save button sends PUT request and updates card in-place
[ ] Delete button confirms then removes card from page and database
[ ] Export JSON downloads a valid JSON file
[ ] Export CSV downloads a valid CSV file
[ ] "Could not reach server" message shows when server is down
[ ] Empty state message shows when no cards exist
```

---

## Summary of New Files

| File | Purpose |
|------|---------|
| `extension/options/options.html` | Options page structure |
| `extension/options/options.css` | Options page styles |
| `extension/options/options.js` | View, edit, delete, search, export logic |

## Summary of Modified Files

| File | Change |
|------|--------|
| `extension/manifest.json` | Add `options_page` field |
| `extension/popup/popup.html` | Add "Manage Flashcards" button |
| `extension/popup/popup.js` | Wire button to `chrome.runtime.openOptionsPage()` |
| `extension/popup/popup.css` | Style the new button |
| `server/src/routes/flashcardRoutes.js` | Add `PUT /:id` and `DELETE /:id` routes |
| `server/src/services/flashcardService.js` | Add `updateFlashcard` and `deleteFlashcard` |
| `server/src/controllers/flashcardController.js` | Add `updateFlashcard` and `deleteFlashcard` handlers |
