// Store the selection when the user releases the mouse so it's available when
// the keyboard shortcut fires (the selection remains intact, but caching it is
// more reliable in case a modifier key inadvertently moves focus).
// getFlashcutApiBaseUrl is defined in lib/apiConfig.js (loaded before this script).
let _pendingTerm          = null;
let _pendingSentence      = null;
let _pendingSimplifyText  = null;

document.addEventListener('mouseup', () => {
  const text = window.getSelection().toString().trim();
  _pendingSimplifyText = text || null;

  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  if (text && wordCount <= 3) {
    _pendingTerm     = text;
    _pendingSentence = getSentenceFromSelection();
  } else {
    _pendingTerm     = null;
    _pendingSentence = null;
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'save-flashcard') {
    handleSaveFlashcard();
  } else if (request.action === 'simplify-selection') {
    handleSimplifySelection();
  }
});

function handleSaveFlashcard() {
  const selectedText = _pendingTerm || window.getSelection().toString().trim();
  const sentence     = _pendingSentence || getSentenceFromSelection();
  _pendingTerm     = null;
  _pendingSentence = null;

  if (!selectedText || selectedText.split(/\s+/).filter(Boolean).length > 3) {
    console.warn('FlashCut: No valid selection (1–3 words) to save.');
    return;
  }

  console.log('Selected text:', selectedText);

  (async () => {
    try {
      const { token } = await new Promise(r => chrome.storage.local.get(['token'], r));
      if (!token) {
        console.warn('FlashCut: Not logged in — skipping save');
        return;
      }

      const apiBase = await getFlashcutApiBaseUrl();
      const response = await fetch(`${apiBase}/api/flashcards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          term: selectedText,
          sentence: sentence,
          sourceUrl: window.location.href
        })
      });

      const data = await response.json().catch(() => ({}));
      console.log('Backend response:', data);

      if (!response.ok) {
        console.warn('FlashCut: Save failed', data.error || response.status);
        showFlashcutToast(data.error || 'Could not save flashcard. Try again.');
        return;
      }

      showConfirmation(selectedText);

    } catch (error) {
      console.error('Error sending to backend:', error);
      showFlashcutToast('Cannot reach server. Check Backend URL in Options.');
    }
  })();
}

function handleSimplifySelection() {
  const selectedText = _pendingSimplifyText || window.getSelection().toString().trim();
  _pendingSimplifyText = null;

  if (!selectedText || selectedText.split(/\s+/).filter(Boolean).length < 2) {
    console.warn('FlashCut: Select at least two words to simplify.');
    showFlashcutToast('Select at least two words, then press Alt+D.');
    return;
  }

  (async () => {
    try {
      const { token } = await new Promise(r => chrome.storage.local.get(['token'], r));
      if (!token) {
        console.warn('FlashCut: Not logged in — skipping simplify');
        showFlashcutToast('Sign in to FlashCut to use simplify.');
        return;
      }

      const loading = showSimplifyLoading();

      const apiBase = await getFlashcutApiBaseUrl();
      const response = await fetch(`${apiBase}/api/simplify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: selectedText })
      });

      const data = await response.json().catch(() => ({}));
      loading.remove();

      if (!response.ok) {
        showSimplifyModalError(data.error || 'Could not simplify this selection.');
        return;
      }

      if (data.simplified == null || String(data.simplified).trim() === '') {
        showSimplifyModalError('Server returned an empty simplification.');
        return;
      }

      showSimplifyModal(selectedText, data.simplified);
    } catch (error) {
      console.error('Error simplifying:', error);
      removeSimplifyOverlay();
      showSimplifyModalError('Cannot reach server. Check Backend URL in Options.');
    }
  })();
}

function getSentenceFromSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return '';

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const text = container.textContent || '';

  const selectedIndex = text.indexOf(selection.toString());

  let start = text.lastIndexOf('.', selectedIndex);
  start = start === -1 ? 0 : start + 1;

  let end = text.indexOf('.', selectedIndex + selection.toString().length);
  end = end === -1 ? text.length : end + 1;

  return text.substring(start, end).trim();
}

function showConfirmation(term) {
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

function showFlashcutToast(message) {
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 320px;
    background: #1e293b;
    color: #f1f5f9;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 2147483647;
    font-family: system-ui, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function showSimplifyLoading() {
  const existing = document.getElementById('flashcut-simplify-loading');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.id = 'flashcut-simplify-loading';
  wrap.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 17, 23, 0.45);
    font-family: system-ui, sans-serif;
  `;
  wrap.innerHTML = `
    <div style="background:#0f1117;color:#e2e8f0;padding:20px 28px;border-radius:12px;border:1px solid #2a3147;box-shadow:0 16px 48px rgba(0,0,0,0.4);">
      <div style="display:flex;align-items:center;gap:12px;font-size:14px;">
        <span style="width:20px;height:20px;border:2px solid #2a3147;border-top-color:#6366f1;border-radius:50%;animation:flashcut-spin 0.7s linear infinite;display:inline-block;"></span>
        Simplifying…
      </div>
    </div>
    <style>@keyframes flashcut-spin { to { transform: rotate(360deg); } }</style>
  `;
  document.body.appendChild(wrap);
  return wrap;
}

function removeSimplifyOverlay() {
  document.getElementById('flashcut-simplify-modal')?.remove();
  document.getElementById('flashcut-simplify-loading')?.remove();
}

function showSimplifyModal(original, simplified) {
  removeSimplifyOverlay();

  const backdrop = document.createElement('div');
  backdrop.id = 'flashcut-simplify-modal';
  backdrop.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(15, 17, 23, 0.55);
    font-family: system-ui, -apple-system, sans-serif;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    max-width: 480px;
    max-height: 85vh;
    overflow: auto;
    background: #0f1117;
    color: #e2e8f0;
    border: 1px solid #2a3147;
    border-radius: 12px;
    padding: 20px 22px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.45);
  `;

  const esc = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  card.innerHTML = `
    <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Simplified</div>
    <div style="font-size:15px;line-height:1.55;color:#f1f5f9;margin-bottom:16px;">${esc(simplified)}</div>
    <details style="margin-bottom:16px;font-size:12px;color:#94a3b8;">
      <summary style="cursor:pointer;color:#818cf8;">Original selection</summary>
      <div style="margin-top:8px;line-height:1.5;">${esc(original)}</div>
    </details>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button type="button" id="flashcut-simplify-copy" style="background:#1e2330;border:1px solid #2a3147;color:#e2e8f0;padding:8px 14px;border-radius:8px;font-size:13px;cursor:pointer;">Copy</button>
      <button type="button" id="flashcut-simplify-close" style="background:#6366f1;border:none;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;">Close</button>
    </div>
  `;

  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  const close = () => { backdrop.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };

  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);

  card.querySelector('#flashcut-simplify-close').addEventListener('click', close);
  card.querySelector('#flashcut-simplify-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(simplified);
      const btn = card.querySelector('#flashcut-simplify-copy');
      const prev = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => { btn.textContent = prev; }, 1500);
    } catch (_) {
      showFlashcutToast('Could not copy to clipboard.');
    }
  });
}

function showSimplifyModalError(message) {
  removeSimplifyOverlay();

  const backdrop = document.createElement('div');
  backdrop.id = 'flashcut-simplify-modal';
  backdrop.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(15, 17, 23, 0.55);
    font-family: system-ui, sans-serif;
  `;

  const esc = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const card = document.createElement('div');
  card.style.cssText = `
    max-width: 400px;
    background: #0f1117;
    color: #fca5a5;
    border: 1px solid #7f1d1d;
    border-radius: 12px;
    padding: 18px 20px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.45);
  `;
  card.innerHTML = `
    <div style="font-size:14px;line-height:1.5;margin-bottom:14px;">${esc(message)}</div>
    <div style="text-align:right;">
      <button type="button" id="flashcut-simplify-err-close" style="background:#6366f1;border:none;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;">Close</button>
    </div>
  `;
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);

  const close = () => { backdrop.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);
  card.querySelector('#flashcut-simplify-err-close').addEventListener('click', close);
}
