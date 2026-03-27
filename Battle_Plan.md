# First Steps: Setting Up Your Vocabulary Learning Project
## Week 1-2 Framework Setup Guide

---

## PHASE 0: Team Setup & Planning (Day 1-2)

### Day 1: Team Organization

**1. Set up collaboration tools**
```bash
# Essential tools to set up immediately:
- GitHub repository (for code)
- Slack or Discord (for communication)
- Google Drive or Notion (for documentation)
- Trello/Jira/Linear (optional - for task tracking)
```

**2. Create shared GitHub repository**
```bash
# One person creates, then adds all team members as collaborators
1. Go to github.com
2. New Repository → "vocabulary-learning-app" (or your chosen name)
3. Initialize with README
4. Add .gitignore (Node template)
5. Invite all 4 other team members as collaborators
```

**3. Define team roles clearly**
Write this in your README.md:
```markdown
## Team Roles
- **[Name]**: Frontend/Extension Developer
- **[Name]**: Backend API Developer  
- **[Name]**: AI Integration Specialist
- **[Name]**: UI/UX & Testing Lead
- **[Name]**: Integration & Documentation Lead
```

**4. Set up weekly check-ins**
- Schedule: Every Monday, 30 minutes
- Agenda: What did you do? What's blocked? What's next?
- Tool: Google Calendar recurring event

### Day 2: Technical Planning

**5. Create initial project structure in GitHub**
```bash
FlashCut/
├── README.md
├── Battle_Plan.md
├── package.json
├── .env.example
├── .gitignore
├── extension/          # Chrome extension code
│   ├── manifest.json
│   ├── package.json
│   ├── background/
│   │   └── background.js
│   ├── content/
│   │   └── content.js
│   ├── icons/
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   └── src/            # Modular source files
│       ├── api/
│       │   └── flashcardApi.js
│       ├── background/
│       │   └── serviceWorker.js
│       ├── content/
│       │   ├── contentScript.js
│       │   └── selectionHandler.js
│       ├── popup/
│       │   ├── popup.html
│       │   ├── popup.css
│       │   └── popup.js
│       └── utils/
│           └── storage.js
└── server/             # API server (Node/Express)
    ├── package.json
    ├── migrations/
    │   └── init.sql
    └── src/
        ├── app.js
        ├── server.js
        ├── ai/
        │   └── claude-test.js
        ├── config/
        │   ├── db.js
        │   └── openai.js
        ├── controllers/
        │   └── flashcardController.js
        ├── middleware/
        │   ├── errorHandler.js
        │   └── validateRequest.js
        ├── models/
        │   └── flashcardModel.js
        ├── routes/
        │   └── flashcardRoutes.js
        ├── services/
        │   ├── aiService.js
        │   └── flashcardService.js
        └── utils/
            └── formatter.js
```

**6. Write initial README**
Include:
- Project description (1 paragraph)
- Team members and roles
- Tech stack
- Setup instructions (will fill in later)
- Development workflow (branching strategy)

**7. Decide on branching strategy**
Recommended approach:
```bash
main          # Production-ready code only
develop       # Integration branch
feature/xyz   # Individual features

Workflow:
1. Create feature branch from develop
2. Work on your feature
3. PR to develop when ready
4. Merge develop to main at milestones
```

---

## PHASE 1: Development Environment Setup (Day 3-5)

### Day 3: Backend Developer - Set Up API Skeleton

**Person 2 (Backend Dev) does this:**

```bash
# 1. Create backend directory structure
cd vocabulary-learning-app
mkdir server
cd server

# 2. Initialize Node.js project
npm init -y

# 3. Install core dependencies
npm install express cors dotenv pg
npm install --save-dev nodemon

# 4. Install database client (PostgreSQL)
npm install pg

# 5. Create basic server structure
```

**Create `server/src/server.js`:**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Create `server/package.json` scripts:**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

**Test it:**
```bash
npm run dev
# Visit http://localhost:3000/health
# Should see: {"status": "Server is running!"}
```

**Create `.env.example`:**
```
SERVER_PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flashcut_db
DB_USER=postgres
DB_PASSWORD=password
OPENAI_API_KEY=your_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
EXTENSION_ID=your_extension_id_here
```

✅ **Deliverable:** Working Express server with one test endpoint

---

### Day 3-4: Frontend Developer - Create Extension Scaffold

**Person 1 (Frontend Dev) does this:**

```bash
# 1. Create extension directory
cd FlashCut
mkdir -p extension/popup extension/content extension/background extension/icons
```

**Create `extension/manifest.json`:**
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

**Create `extension/popup/popup.html`:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ContextCard</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>ContextCard</h1>
    <p>Your flashcards will appear here</p>
    <div id="flashcard-list"></div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

**Create `extension/popup/popup.css`:**
```css
body {
  width: 400px;
  min-height: 300px;
  margin: 0;
  padding: 16px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h1 {
  font-size: 20px;
  margin: 0;
  color: #065A82;
}
```

**Create `extension/popup/popup.js`:**
```javascript
// Test: Log when popup opens
console.log('Popup opened!');

// Later: Load flashcards from storage
chrome.storage.local.get(['flashcards'], (result) => {
  const flashcards = result.flashcards || [];
  console.log('Flashcards:', flashcards);
  
  const list = document.getElementById('flashcard-list');
  if (flashcards.length === 0) {
    list.innerHTML = '<p>No flashcards yet. Highlight a word on any webpage!</p>';
  }
});
```

**Create `extension/content/content.js`:**
```javascript
// Test: Detect when user selects text
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText && selectedText.split(' ').length <= 3) {
    console.log('Selected text:', selectedText);
    
    // TODO: Get full sentence
    // TODO: Send to backend
    
    // For now, just save locally
    chrome.storage.local.get(['flashcards'], (result) => {
      const flashcards = result.flashcards || [];
      flashcards.push({
        term: selectedText,
        sentence: 'Test sentence...',
        timestamp: Date.now()
      });
      chrome.storage.local.set({ flashcards });
      console.log('Saved!');
    });
  }
});
```

**Create `extension/background/background.js`:**
```javascript
// Background service worker
console.log('Background service worker loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  sendResponse({ success: true });
});
```

**Load extension in Chrome:**
```
1. Open Chrome
2. Go to chrome://extensions/
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select your extension/ folder
6. Extension icon should appear in toolbar!
```

**Test it:**
1. Click extension icon → popup should open
2. Visit any webpage
3. Highlight a word
4. Check browser console → should see "Selected text: ..."
5. Click extension icon again → should see saved flashcard in console

✅ **Deliverable:** Working Chrome extension that captures text selection

---

### Day 4-5: Database Setup

**Person 2 (Backend Dev) continues:**

**Option A: Local PostgreSQL (Recommended for development)**

```bash
# Install PostgreSQL locally
# Mac: brew install postgresql
# Ubuntu: sudo apt install postgresql
# Windows: Download from postgresql.org

# Start PostgreSQL
# Mac: brew services start postgresql
# Ubuntu: sudo service postgresql start

# Create database
psql postgres
CREATE DATABASE vocab_app;
\q
```

**Create `server/migrations/init.sql`:**
```sql
-- Users table (optional for MVP, but good to have structure)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Captures table (raw vocabulary captures)
CREATE TABLE IF NOT EXISTS captures (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  term VARCHAR(255) NOT NULL,
  sentence TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  capture_id INTEGER REFERENCES captures(id),
  term VARCHAR(255) NOT NULL,
  definition TEXT,
  sentence_context TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_captures_user_id ON captures(user_id);
```

**Run the schema:**
```bash
psql vocab_app < server/migrations/init.sql
```

**Create `server/src/config/db.js`:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/vocab_app'
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});

module.exports = pool;
```

**Option B: Free Cloud Database (ElephantSQL)**

```bash
# 1. Go to elephantsql.com
# 2. Sign up for free "Tiny Turtle" plan
# 3. Create new instance
# 4. Copy database URL
# 5. Add to .env:
DATABASE_URL=postgres://user:pass@server.db.elephantsql.com/dbname
```

✅ **Deliverable:** Database created with schema, connection working

---

### Day 5: AI Integration Developer - Test OpenAI API

**Person 3 (AI Integration) does this:**

```bash
# 1. Get API key
# Go to platform.openai.com
# Create account → API keys → Create new key
# Copy key to .env file

# 2. Install OpenAI SDK
cd backend
npm install openai

# 3. Create test script
```

**Create `server/src/ai/openai-test.js`:**
```javascript
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testDefinitionGeneration() {
  const term = "ameliorate";
  const sentence = "The medication helps ameliorate chronic pain.";
  
  console.log(`Generating definition for: "${term}"`);
  console.log(`Context: "${sentence}"\n`);
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Define the term "${term}" as used in this sentence: "${sentence}". 
        Provide a clear, 2-3 sentence definition that explains the meaning in this specific context.`
      }],
      temperature: 0.7,
      max_tokens: 150
    });
    
    const definition = response.choices[0].message.content.trim();
    
    console.log('AI Generated Definition:');
    console.log(definition);
    console.log('\n---');
    console.log('Tokens used:', response.usage.total_tokens);
    console.log('Estimated cost: $' + (response.usage.total_tokens / 1000000 * 0.15).toFixed(6));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDefinitionGeneration();
```

**Run the test:**
```bash
# Run from the project root:
node server/src/ai/openai-test.js
```

**Expected output:**
```
Generating definition for: "ameliorate"
Context: "The medication helps ameliorate chronic pain."

AI Generated Definition:
To ameliorate means to make something bad or unsatisfactory better or more bearable. In this medical context, it refers to reducing the severity or intensity of chronic pain, making it more manageable for the patient.

---
Tokens used: 127
Estimated cost: $0.000019
```

**Alternative: Test Claude API**

```bash
npm install @anthropic-ai/sdk
```

**Create `server/src/ai/claude-test.js`:**
```javascript
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function testDefinitionGeneration() {
  const term = "ameliorate";
  const sentence = "The medication helps ameliorate chronic pain.";
  
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Define the term "${term}" as used in this sentence: "${sentence}". 
        Provide a clear, 2-3 sentence definition that explains the meaning in this specific context.`
      }]
    });
    
    const definition = response.content[0].text;
    console.log('Claude Generated Definition:');
    console.log(definition);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDefinitionGeneration();
```

✅ **Deliverable:** Successful AI API call, test definition generated

---

## PHASE 2: First Integration (Day 6-7)

### Day 6: Connect Extension to Backend

**Goal:** Extension sends captured text to backend API

**Backend: Create capture endpoint**

**Edit `server/src/server.js`:**
```javascript
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Capture vocabulary endpoint
app.post('/api/captures', async (req, res) => {
  const { term, sentence, sourceUrl } = req.body;
  
  console.log('Received capture:', { term, sentence });
  
  try {
    // For now, just echo back - we'll add database later
    res.json({
      success: true,
      data: { term, sentence, sourceUrl }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to save capture' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Frontend: Update content script to send to API**

**Edit `extension/content/content.js` (or `extension/src/content/contentScript.js` for modular version):**
```javascript
document.addEventListener('mouseup', async () => {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText && selectedText.split(' ').length <= 3) {
    console.log('Selected text:', selectedText);
    
    // Get the full sentence (simple version)
    const sentence = getSentenceFromSelection();
    
    // Send to backend API
    try {
      const response = await fetch('http://localhost:3000/api/captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: selectedText,
          sentence: sentence,
          sourceUrl: window.location.href
        })
      });
      
      const data = await response.json();
      console.log('Backend response:', data);
      
      // Show confirmation
      showConfirmation(selectedText);
      
    } catch (error) {
      console.error('Error sending to backend:', error);
    }
  }
});

function getSentenceFromSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return '';
  
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const text = container.textContent || '';
  
  // Simple sentence extraction - find period before and after
  const selectedIndex = text.indexOf(selection.toString());
  
  // Find start of sentence (period or start of text)
  let start = text.lastIndexOf('.', selectedIndex);
  start = start === -1 ? 0 : start + 1;
  
  // Find end of sentence (period or end of text)
  let end = text.indexOf('.', selectedIndex + selection.toString().length);
  end = end === -1 ? text.length : end + 1;
  
  return text.substring(start, end).trim();
}

function showConfirmation(term) {
  // Create temporary notification
  const notification = document.createElement('div');
  notification.textContent = `✓ Saved: ${term}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #065A82;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 10000;
    font-family: sans-serif;
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 2000);
}
```

**Test the integration:**
```bash
# Terminal 1: Start backend
cd server
npm run dev

# Browser:
1. Reload extension (chrome://extensions → reload button)
2. Visit any webpage
3. Highlight a word
4. Check backend terminal → should see "Received capture: ..."
5. Check browser console → should see "Backend response: ..."
6. Should see confirmation notification on page!
```

✅ **Deliverable:** Extension successfully sends data to backend API

---

### Day 7: Store Captures in Database

**Backend: Add database storage**

**Edit `server/src/server.js` capture endpoint:**
```javascript
app.post('/api/captures', async (req, res) => {
  const { term, sentence, sourceUrl } = req.body;
  
  console.log('Received capture:', { term, sentence });
  
  try {
    // Save to database
    const result = await db.query(
      'INSERT INTO captures (term, sentence, source_url) VALUES ($1, $2, $3) RETURNING *',
      [term, sentence, sourceUrl]
    );
    
    console.log('Saved to database:', result.rows[0]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save capture' });
  }
});

// Add endpoint to retrieve captures
app.get('/api/captures', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM captures ORDER BY created_at DESC LIMIT 50'
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch captures' });
  }
});
```

**Test database storage:**
```bash
# 1. Capture some words via extension
# 2. Check database:
psql vocab_app
SELECT * FROM captures;

# Should see your captured words!
```

✅ **Deliverable:** Captures are stored in database

---

## END OF WEEK 1 CHECKLIST

At the end of Week 1, you should have:

- ✅ GitHub repo with all team members
- ✅ Project structure created
- ✅ Backend server running with test endpoint
- ✅ Database created and connected
- ✅ Chrome extension loading in browser
- ✅ Extension can capture text selections
- ✅ Extension sends data to backend API
- ✅ Backend stores captures in database
- ✅ AI API tested (OpenAI or Claude)

**What you DON'T have yet (that's OK!):**
- ❌ AI definition generation integrated
- ❌ Flashcard display in popup
- ❌ User authentication
- ❌ Polished UI

**That's PERFECT for Week 1!** You've built the foundation.

---

## WEEK 2 PRIORITIES

### Day 8-10: AI Integration

**Person 3 (AI Dev):**
- Create `/api/flashcards` endpoint
- Integrate AI definition generation
- Handle errors and fallbacks

**Create `server/src/routes/flashcardRoutes.js`:**
```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { generateDefinition } = require('../services/aiService');

router.post('/', async (req, res) => {
  const { captureId } = req.body;
  
  try {
    // Get capture from database
    const capture = await db.query(
      'SELECT * FROM captures WHERE id = $1',
      [captureId]
    );
    
    if (capture.rows.length === 0) {
      return res.status(404).json({ error: 'Capture not found' });
    }
    
    const { term, sentence } = capture.rows[0];
    
    // Generate AI definition
    const definition = await generateDefinition(term, sentence);
    
    // Save flashcard
    const result = await db.query(
        'INSERT INTO flashcards (capture_id, term, definition, sentence_context) VALUES ($1, $2, $3, $4) RETURNING *',
      [captureId, term, definition, sentence]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating flashcard:', error);
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

module.exports = router;
```

### Day 11-12: Frontend Flashcard Display

**Person 1 (Frontend Dev):**
- Fetch flashcards from backend
- Display in popup
- Add delete functionality

### Day 13-14: Testing & Polish

**Person 4 (Testing Lead):**
- Test full workflow: capture → generate → display
- Fix bugs
- Improve error handling

---

## TROUBLESHOOTING COMMON ISSUES

### Extension won't load:
```
Error: "Manifest file is invalid"
→ Check manifest.json syntax (valid JSON, no trailing commas)
→ Make sure all file paths exist
```

### Backend won't start:
```
Error: "EADDRINUSE: address already in use"
→ Port 3000 is taken
→ Change PORT in .env or kill other process: lsof -ti:3000 | xargs kill
```

### Database connection fails:
```
Error: "Connection refused"
→ PostgreSQL not running
→ Start it: brew services start postgresql (Mac)
```

### CORS errors:
```
Error: "blocked by CORS policy"
→ Make sure backend has: app.use(cors());
→ Or add specific origin: app.use(cors({ origin: 'chrome-extension://...' }));
```

---

## SUMMARY: YOUR FIRST WEEK ROADMAP

**Day 1-2:** Team setup, GitHub, roles, project structure  
**Day 3:** Backend skeleton (Express server)  
**Day 3-4:** Extension scaffold (manifest, popup, content script)  
**Day 4-5:** Database setup (PostgreSQL, schema)  
**Day 5:** AI API testing (OpenAI or Claude)  
**Day 6:** Connect extension to backend  
**Day 7:** Store captures in database  

**Goal:** By end of Week 1, have a minimal working pipeline where:
1. User highlights word
2. Extension sends to backend
3. Backend saves to database
4. (Week 2: AI generates definition, displays in popup)

This foundation lets you build incrementally without getting overwhelmed!

---

## RECOMMENDED DAILY STANDUP TEMPLATE

Post in your Slack/Discord every day:

```
**Daily Update - [Your Name]**
✅ Yesterday: Set up Express server with test endpoint
🔨 Today: Create database schema and test connection
❌ Blocked: Need PostgreSQL installation help

Questions for team: Should we use ElephantSQL or local Postgres?
```

Keeps everyone aligned without meetings!

---

Good luck! Start with these steps and you'll have a solid foundation in the first week. Focus on getting ONE thing working end-to-end before adding features. 🚀
