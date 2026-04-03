const API = 'http://localhost:5000';
const PER_PAGE = 10;

let allCards = [];
let filtered = [];
let currentPage = 1;
let token = null;
let pendingDeleteId = null;
let deleteAll = false;

// ── Boot ──
async function init() {
  const result = await new Promise(r => chrome.storage.local.get(['token','user'], r));
  if (!result.token) { window.location.href = 'popup.html'; return; }
  token = result.token;

  const user = result.user || {};
  const initials = (user.username || user.email || '?').slice(0, 2).toUpperCase();
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-name').textContent = user.username || user.email || 'User';
  document.getElementById('user-email').textContent = user.email || '';

  await loadCards();
}

// ── Load cards ──
async function loadCards() {
  document.getElementById('loading-state').style.display = 'flex';
  document.getElementById('cards-grid').style.display = 'none';
  document.getElementById('empty-state').style.display = 'none';
  hideBanner();

  try {
    const res = await fetch(`${API}/api/flashcards`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Unauthorized');
    allCards = await res.json();
    filterCards();
  } catch(e) {
    showBanner('error', '⚠ Could not reach server. Make sure the backend is running on port 5000.');
    document.getElementById('loading-state').style.display = 'none';
  }
}

// ── Filter + sort ──
function filterCards() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const sort = document.getElementById('sort-select').value;

  filtered = allCards.filter(c =>
    (c.question || '').toLowerCase().includes(q) ||
    (c.answer || '').toLowerCase().includes(q)
  );

  if (sort === 'newest') filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  else if (sort === 'oldest') filtered.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  else filtered.sort((a,b) => (a.question||'').localeCompare(b.question||''));

  currentPage = 1;
  renderCards();
}

// ── Render ──
function renderCards() {
  const loading = document.getElementById('loading-state');
  const grid = document.getElementById('cards-grid');
  const empty = document.getElementById('empty-state');
  const list = document.getElementById('cards-list');

  loading.style.display = 'none';

  const weekAgo = Date.now() - 7 * 86400000;
  const weekCount = allCards.filter(c => new Date(c.created_at) > weekAgo).length;
  document.getElementById('stat-total').textContent = allCards.length;
  document.getElementById('stat-week').textContent = weekCount;
  document.getElementById('stat-showing').textContent = filtered.length;

  if (filtered.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }

  empty.style.display = 'none';
  grid.style.display = 'block';

  const start = (currentPage - 1) * PER_PAGE;
  const page = filtered.slice(start, start + PER_PAGE);

  list.innerHTML = '';
  page.forEach(card => {
    const el = createCardEl(card);
    list.appendChild(el);
  });

  renderPagination();
}

function createCardEl(card) {
  const div = document.createElement('div');
  div.className = 'fc-card';
  div.id = `card-${card.id}`;

  const date = card.created_at ? new Date(card.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '';

  const top = document.createElement('div');
  top.className = 'fc-card-top';

  const body = document.createElement('div');
  body.className = 'fc-body';
  body.innerHTML = `
    <div class="fc-q-label">Q</div>
    <div class="fc-question" id="q-${card.id}">${esc(card.question)}</div>
    <div class="fc-a-label">A</div>
    <div class="fc-answer" id="a-${card.id}">${esc(card.answer)}</div>
    ${date ? `<div class="fc-date">${date}</div>` : ''}
  `;

  const actions = document.createElement('div');
  actions.className = 'fc-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn btn-edit';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => startEdit(card.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn btn-delete';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => openDeleteOne(card.id));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  top.appendChild(body);
  top.appendChild(actions);

  const editFields = document.createElement('div');
  editFields.className = 'edit-fields';
  editFields.id = `edit-${card.id}`;
  editFields.style.display = 'none';
  editFields.innerHTML = `
    <div class="edit-group">
      <label>Question</label>
      <input type="text" id="edit-q-${card.id}" value="${esc(card.question)}" />
    </div>
    <div class="edit-group">
      <label>Answer</label>
      <textarea id="edit-a-${card.id}" rows="3">${esc(card.answer)}</textarea>
    </div>
  `;

  const saveRow = document.createElement('div');
  saveRow.className = 'edit-save-row';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'action-btn btn-save';
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', () => saveEdit(card.id));

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'action-btn btn-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => cancelEdit(card.id));

  saveRow.appendChild(saveBtn);
  saveRow.appendChild(cancelBtn);
  editFields.appendChild(saveRow);

  div.appendChild(top);
  div.appendChild(editFields);
  return div;
}

// ── Pagination ──
function renderPagination() {
  const total = Math.ceil(filtered.length / PER_PAGE);
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';
  if (total <= 1) return;

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.textContent = '← Prev';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => { currentPage--; renderCards(); });
  pag.appendChild(prev);

  for (let i = 1; i <= total; i++) {
    if (total > 7 && Math.abs(i - currentPage) > 2 && i !== 1 && i !== total) {
      if (i === 2 || i === total - 1) {
        const dot = document.createElement('span');
        dot.textContent = '…';
        dot.style.padding = '0 4px';
        dot.style.color = 'var(--faint)';
        pag.appendChild(dot);
      }
      continue;
    }
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => { currentPage = i; renderCards(); });
    pag.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.textContent = 'Next →';
  next.disabled = currentPage === total;
  next.addEventListener('click', () => { currentPage++; renderCards(); });
  pag.appendChild(next);
}

// ── Edit ──
function startEdit(id) {
  document.getElementById(`edit-${id}`).style.display = 'block';
  document.getElementById(`card-${id}`).classList.add('editing');
}
function cancelEdit(id) {
  document.getElementById(`edit-${id}`).style.display = 'none';
  document.getElementById(`card-${id}`).classList.remove('editing');
}
async function saveEdit(id) {
  const q = document.getElementById(`edit-q-${id}`).value.trim();
  const a = document.getElementById(`edit-a-${id}`).value.trim();
  if (!q || !a) { showBanner('error', 'Question and answer cannot be empty.'); return; }

  try {
    const res = await fetch(`${API}/api/flashcards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ question: q, answer: a })
    });
    if (!res.ok) throw new Error();

    const idx = allCards.findIndex(c => c.id === id);
    if (idx >= 0) { allCards[idx].question = q; allCards[idx].answer = a; }

    document.getElementById(`q-${id}`).textContent = q;
    document.getElementById(`a-${id}`).textContent = a;
    cancelEdit(id);
    showBanner('success', '✓ Flashcard updated.');
  } catch(e) {
    showBanner('error', 'Failed to update. Check server connection.');
  }
}

// ── Delete ──
function openDeleteOne(id) {
  pendingDeleteId = id; deleteAll = false;
  document.getElementById('modal-title').textContent = 'Delete this flashcard?';
  document.getElementById('modal-body').textContent = 'This action cannot be undone.';
  document.getElementById('modal-confirm').onclick = confirmDelete;
  document.getElementById('delete-modal').classList.add('open');
}
function openDeleteAll() {
  if (allCards.length === 0) return;
  pendingDeleteId = null; deleteAll = true;
  document.getElementById('modal-title').textContent = `Delete all ${allCards.length} flashcards?`;
  document.getElementById('modal-body').textContent = 'Every flashcard in your account will be permanently removed. This cannot be undone.';
  document.getElementById('modal-confirm').onclick = confirmDelete;
  document.getElementById('delete-modal').classList.add('open');
}
function closeModal() { document.getElementById('delete-modal').classList.remove('open'); }

async function confirmDelete() {
  closeModal();
  try {
    if (deleteAll) {
      const ids = allCards.map(c => c.id);
      await Promise.all(ids.map(id => fetch(`${API}/api/flashcards/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      })));
      allCards = [];
    } else {
      const res = await fetch(`${API}/api/flashcards/${pendingDeleteId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      allCards = allCards.filter(c => c.id !== pendingDeleteId);
    }
    filterCards();
    showBanner('success', deleteAll ? '✓ All flashcards deleted.' : '✓ Flashcard deleted.');
  } catch(e) {
    showBanner('error', 'Delete failed. Check server connection.');
  }
}

// ── Export ──
function exportCards(format) {
  if (allCards.length === 0) { showBanner('error', 'No flashcards to export.'); return; }

  let content, mime, ext;
  if (format === 'json') {
    content = JSON.stringify(allCards.map(c => ({ id: c.id, question: c.question, answer: c.answer, created_at: c.created_at })), null, 2);
    mime = 'application/json'; ext = 'json';
  } else if (format === 'csv') {
    const rows = [['id','question','answer','created_at'],
      ...allCards.map(c => [c.id, `"${(c.question||'').replace(/"/g,'""')}"`, `"${(c.answer||'').replace(/"/g,'""')}"`, c.created_at])];
    content = rows.map(r => r.join(',')).join('\n');
    mime = 'text/csv'; ext = 'csv';
  } else {
    content = allCards.map((c,i) => `${i+1}. Q: ${c.question}\n   A: ${c.answer}`).join('\n\n');
    mime = 'text/plain'; ext = 'txt';
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `flashcut-export-${new Date().toISOString().slice(0,10)}.${ext}`;
  a.click(); URL.revokeObjectURL(url);
  showBanner('success', `✓ Exported ${allCards.length} cards as ${ext.toUpperCase()}.`);
}

// ── Sections ──
function showSection(name) {
  ['flashcards','export'].forEach(s => {
    document.getElementById(`${s}-section`).style.display = s === name ? 'block' : 'none';
    document.getElementById(`nav-${s}`).classList.toggle('active', s === name);
  });
  const titles = { flashcards: ['My Flashcards', 'View, edit, and manage your saved vocabulary'], export: ['Export', 'Download your flashcards in your preferred format'] };
  document.getElementById('topbar-title').textContent = titles[name][0];
  document.getElementById('topbar-sub').textContent = titles[name][1];
  document.getElementById('topbar-actions').style.display = name === 'flashcards' ? 'flex' : 'none';
}

// ── Banner ──
function showBanner(type, msg) {
  const el = document.getElementById('banner');
  el.className = `banner banner-${type === 'error' ? 'error' : 'success'}`;
  el.textContent = msg;
  el.style.display = 'flex';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}
function hideBanner() { document.getElementById('banner').style.display = 'none'; }

// ── Logout ──
function handleLogout() {
  chrome.storage.local.remove(['token','user'], () => { window.location.href = 'popup.html'; });
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Wire up static event listeners ──
document.getElementById('nav-flashcards').addEventListener('click', () => showSection('flashcards'));
document.getElementById('nav-export').addEventListener('click', () => showSection('export'));
document.getElementById('logout-icon').addEventListener('click', handleLogout);
document.getElementById('refresh-btn').addEventListener('click', loadCards);
document.getElementById('clear-all-btn').addEventListener('click', openDeleteAll);
document.getElementById('search-input').addEventListener('input', filterCards);
document.getElementById('sort-select').addEventListener('change', filterCards);
document.getElementById('export-json').addEventListener('click', () => exportCards('json'));
document.getElementById('export-csv').addEventListener('click', () => exportCards('csv'));
document.getElementById('export-txt').addEventListener('click', () => exportCards('txt'));
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('shortcut-link-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

init();
