# User Authentication Implementation Plan
## FlashCut — JWT-Based Auth

---

## Overview

We'll use **JWT (JSON Web Tokens)** with **bcrypt** password hashing. The flow is:
1. User registers or logs in via the extension popup
2. Server returns a signed JWT
3. Extension stores the token in `chrome.storage.local`
4. Every API request includes the token in the `Authorization` header
5. Server middleware verifies the token and attaches the user to the request

---

## STEP 1: Database — Add Password Column

The `users` table exists but has no password field. Run this in your **Supabase SQL Editor**:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '';
```

---

## STEP 2: Install Dependencies

```bash
cd server
npm install bcrypt jsonwebtoken
```

| Package | Purpose |
|---------|---------|
| `bcrypt` | Hash and compare passwords securely |
| `jsonwebtoken` | Sign and verify JWTs |

Add to `.env`:
```
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
```

---

## STEP 3: Server — New Files to Create

### `server/src/models/userModel.js`
```javascript
const pool = require('../config/db');

async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function createUser(username, email, passwordHash) {
  const result = await pool.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
    [username, email, passwordHash]
  );
  return result.rows[0];
}

module.exports = { findByEmail, findById, createUser };
```

---

### `server/src/services/authService.js`
```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

async function register(username, email, password) {
  const existing = await userModel.findByEmail(email);
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userModel.createUser(username, email, passwordHash);
  const token = signToken(user.id);
  return { user, token };
}

async function login(email, password) {
  const user = await userModel.findByEmail(email);
  if (!user) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw Object.assign(new Error('Invalid email or password'), { status: 401 });

  const token = signToken(user.id);
  return { user: { id: user.id, username: user.username, email: user.email }, token };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

module.exports = { register, login };
```

---

### `server/src/controllers/authController.js`
```javascript
const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'username, email, and password are required' });

    const { user, token } = await authService.register(username, email, password);
    console.log(`[POST /api/auth/register] new user: ${email}`);
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' });

    const { user, token } = await authService.login(email, password);
    console.log(`[POST /api/auth/login] user logged in: ${email}`);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
```

---

### `server/src/routes/authRoutes.js`
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
```

---

### `server/src/middleware/authMiddleware.js`
```javascript
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
```

---

## STEP 4: Server — Update Existing Files

### `server/src/app.js` — Register auth routes
```javascript
const express = require('express');
const cors = require('cors');
const flashcardRoutes = require('./routes/flashcardRoutes');
const authRoutes = require('./routes/authRoutes');         // ADD

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.use('/api/auth', authRoutes);                          // ADD
app.use('/api/flashcards', flashcardRoutes);
app.use(require('./middleware/errorHandler'));

module.exports = app;
```

---

### `server/src/routes/flashcardRoutes.js` — Protect routes
```javascript
const express = require('express');
const controller = require('../controllers/flashcardController');
const validateRequest = require('../middleware/validateRequest');
const requireAuth = require('../middleware/authMiddleware');  // ADD

const router = express.Router();

router.post('/', requireAuth, validateRequest, controller.createFlashcard);  // UPDATED
router.get('/', requireAuth, controller.getFlashcards);                       // UPDATED

module.exports = router;
```

---

### `server/src/services/flashcardService.js` — Use real user ID
```javascript
async function generateFlashcard(term, sentence, sourceUrl, userId) {  // ADD userId param
  const flashcard = await aiService.generateFlashcard(term, sentence);

  const result = await pool.query(
    `INSERT INTO flashcards (user_id, question, answer)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, flashcard.question, flashcard.answer]  // UPDATED: use real userId
  );

  return result.rows[0];
}

async function getAllFlashcards(userId) {  // ADD userId param
  const result = await pool.query(
    'SELECT * FROM flashcards WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]  // UPDATED: filter by user
  );
  return result.rows;
}
```

---

### `server/src/controllers/flashcardController.js` — Pass userId from request
```javascript
async function createFlashcard(req, res, next) {
  try {
    const { term, sentence, sourceUrl } = req.body;
    console.log(`[POST /api/flashcards] user: ${req.userId} | term: "${term}"`);
    const flashcard = await flashcardService.generateFlashcard(term, sentence, sourceUrl, req.userId);
    console.log(`[POST /api/flashcards] saved flashcard id: ${flashcard.id}`);
    res.json(flashcard);
  } catch (error) {
    next(error);
  }
}

async function getFlashcards(req, res, next) {
  try {
    console.log(`[GET /api/flashcards] user: ${req.userId}`);
    const flashcards = await flashcardService.getAllFlashcards(req.userId);
    console.log(`[GET /api/flashcards] returned ${flashcards.length} cards`);
    res.json(flashcards);
  } catch (error) {
    next(error);
  }
}
```

---

## STEP 5: Extension — Add Login UI to Popup

### `extension/popup/popup.html` — Add login form
Add a login/register form that shows when unauthenticated and hides when a token exists in `chrome.storage.local`.

```html
<!-- Add above flashcard-list div -->
<div id="auth-section">
  <input type="email" id="email" placeholder="Email" />
  <input type="password" id="password" placeholder="Password" />
  <button id="login-btn">Login</button>
  <button id="register-btn">Register</button>
  <input type="text" id="username" placeholder="Username (register only)" />
  <p id="auth-error" style="color:red;"></p>
</div>

<div id="main-section" style="display:none;">
  <p id="user-label"></p>
  <button id="logout-btn">Logout</button>
  <div id="flashcard-list"></div>
</div>
```

---

### `extension/popup/popup.js` — Handle auth state
```javascript
const API = 'http://localhost:5000';

async function getToken() {
  return new Promise(resolve => chrome.storage.local.get(['token'], r => resolve(r.token)));
}

async function init() {
  const token = await getToken();
  if (token) {
    showMain(token);
  } else {
    document.getElementById('auth-section').style.display = 'block';
  }
}

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) return document.getElementById('auth-error').textContent = data.error;
  chrome.storage.local.set({ token: data.token, user: data.user }, () => showMain(data.token));
});

document.getElementById('register-btn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;
  const res = await fetch(`${API}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  if (!res.ok) return document.getElementById('auth-error').textContent = data.error;
  chrome.storage.local.set({ token: data.token, user: data.user }, () => showMain(data.token));
});

document.getElementById('logout-btn').addEventListener('click', () => {
  chrome.storage.local.remove(['token', 'user'], () => location.reload());
});

async function showMain(token) {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('main-section').style.display = 'block';
  const res = await fetch(`${API}/api/flashcards`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const flashcards = await res.json();
  renderFlashcards(flashcards);
}

init();
```

---

### `extension/content/content.js` — Send token with captures
```javascript
// Replace the fetch call with this to include the auth token:
const token = await new Promise(resolve =>
  chrome.storage.local.get(['token'], r => resolve(r.token))
);

if (!token) {
  console.warn('Not logged in — open extension popup to sign in');
  return;
}

const response = await fetch('http://localhost:5000/api/flashcards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ term: selectedText, sentence, sourceUrl: window.location.href })
});
```

---

## STEP 6: Extension — Update Manifest Permissions

`chrome.storage` requires the `storage` permission — verify it's in `extension/manifest.json`:

```json
"permissions": [
  "storage",
  "activeTab"
]
```

---

## Testing Checklist

```
[ ] POST /api/auth/register — creates user, returns token
[ ] POST /api/auth/login — returns token for valid credentials
[ ] POST /api/auth/login — returns 401 for wrong password
[ ] GET /api/flashcards without token — returns 401
[ ] GET /api/flashcards with token — returns only that user's cards
[ ] Extension popup login form works
[ ] Token persists across popup open/close
[ ] Logout clears token
[ ] Highlight word while logged out — shows warning, no request sent
[ ] Highlight word while logged in — flashcard saved with correct user_id
```

---

## Summary of New Files

| File | Purpose |
|------|---------|
| `server/src/models/userModel.js` | DB queries for users |
| `server/src/services/authService.js` | Register/login logic, bcrypt, JWT signing |
| `server/src/controllers/authController.js` | Route handlers for auth endpoints |
| `server/src/routes/authRoutes.js` | `/api/auth/register` and `/api/auth/login` |
| `server/src/middleware/authMiddleware.js` | JWT verification middleware |

## Summary of Modified Files

| File | Change |
|------|--------|
| `server/migrations/init.sql` | Add `password_hash` column to users |
| `server/src/app.js` | Register `/api/auth` routes |
| `server/src/routes/flashcardRoutes.js` | Add `requireAuth` middleware |
| `server/src/services/flashcardService.js` | Accept and use `userId` |
| `server/src/controllers/flashcardController.js` | Pass `req.userId` to service |
| `extension/popup/popup.html` | Add login/register form |
| `extension/popup/popup.js` | Auth state management, fetch with token |
| `extension/content/content.js` | Read token from storage, send in header |
