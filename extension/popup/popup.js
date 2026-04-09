let currentTab = 'login';

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('register-username-group').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('submit-btn').textContent = tab === 'login' ? 'Sign in' : 'Create account';
  clearError();
}

function showError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
}
function clearError() {
  document.getElementById('auth-error').style.display = 'none';
}

async function handleAuth() {
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  clearError();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value.trim();

  if (!email || !password) { showError('Email and password are required.'); btn.disabled = false; return; }
  if (currentTab === 'register' && !username) { showError('Username is required.'); btn.disabled = false; return; }

  const endpoint = currentTab === 'login' ? '/api/auth/login' : '/api/auth/register';
  const body = currentTab === 'login' ? { email, password } : { username, email, password };

  try {
    const apiBase = await getFlashcutApiBaseUrl();
    const res = await fetch(`${apiBase}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) { showError(data.error || 'Authentication failed.'); btn.disabled = false; return; }
    chrome.storage.local.set({ token: data.token, user: data.user }, () => showMain(data.token, data.user));
  } catch (e) {
    showError('Cannot reach server. Check Backend URL in Options and that the API is running.');
    btn.disabled = false;
  }
}

async function showMain(token, user) {
  document.getElementById('auth-section').style.display = 'none';
  const main = document.getElementById('main-section');
  main.style.display = 'flex';

  const headerRight = document.getElementById('header-right');
  const initials = user ? (user.username || user.email || '?').slice(0, 2).toUpperCase() : '??';
  const displayName = user ? (user.username || user.email) : '';
  headerRight.innerHTML = `
    <div class="user-chip">
      <div class="avatar">${initials}</div>
      <span class="user-name">${displayName}</span>
    </div>
    <a href="options.html" target="_blank" class="options-btn">Options</a>
  `;

  await loadFlashcards(token);
}

async function loadFlashcards(token) {
  const loading = document.getElementById('loading');
  const list = document.getElementById('flashcard-list');
  const empty = document.getElementById('empty-state');
  const errBanner = document.getElementById('server-error');

  loading.style.display = 'flex';
  list.innerHTML = '';
  empty.style.display = 'none';
  errBanner.style.display = 'none';

  try {
    const apiBase = await getFlashcutApiBaseUrl();
    const res = await fetch(`${apiBase}/api/flashcards`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loading.style.display = 'none';
    if (!res.ok) { errBanner.style.display = 'block'; return; }

    const cards = await res.json();
    document.getElementById('card-count').textContent = cards.length;

    if (cards.length === 0) { empty.style.display = 'flex'; return; }

    cards.forEach(card => {
      const div = document.createElement('div');
      div.className = 'flashcard';
      const date = card.created_at ? new Date(card.created_at).toLocaleDateString() : '';
      div.innerHTML = `
        <div class="fc-q">Question</div>
        <div class="fc-term">${esc(card.question)}</div>
        <div class="fc-answer">${esc(card.answer)}</div>
        ${date ? `<div class="fc-meta">${date}</div>` : ''}
      `;
      list.appendChild(div);
    });
  } catch(e) {
    loading.style.display = 'none';
    errBanner.style.display = 'block';
  }
}

function handleLogout() {
  chrome.storage.local.remove(['token', 'user'], () => location.reload());
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function init() {
  const result = await new Promise(r => chrome.storage.local.get(['token','user'], r));
  if (result.token) {
    showMain(result.token, result.user);
  } else {
    document.getElementById('auth-section').style.display = 'flex';
  }
}

document.getElementById('tab-login').addEventListener('click', () => switchTab('login'));
document.getElementById('tab-register').addEventListener('click', () => switchTab('register'));
document.getElementById('submit-btn').addEventListener('click', handleAuth);
document.getElementById('logout-btn').addEventListener('click', handleLogout);
document.getElementById('shortcut-link-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});
document.getElementById('password').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleAuth();
});

init();
