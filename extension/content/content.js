// Store the selection when the user releases the mouse so it's available when
// the keyboard shortcut fires (the selection remains intact, but caching it is
// more reliable in case a modifier key inadvertently moves focus).
let _pendingTerm     = null;
let _pendingSentence = null;

document.addEventListener('mouseup', () => {
  const text = window.getSelection().toString().trim();
  if (text && text.split(' ').length <= 3) {
    _pendingTerm     = text;
    _pendingSentence = getSentenceFromSelection();
  } else {
    _pendingTerm     = null;
    _pendingSentence = null;
  }
});

// Listen for the command forwarded by the background service worker
chrome.runtime.onMessage.addListener((request) => {
  if (request.action !== 'save-flashcard') return;

  // Prefer cached value; fall back to live selection
  const selectedText = _pendingTerm || window.getSelection().toString().trim();
  const sentence     = _pendingSentence || getSentenceFromSelection();
  _pendingTerm     = null;
  _pendingSentence = null;

  if (!selectedText || selectedText.split(' ').length > 3) {
    console.warn('FlashCut: No valid selection (1–3 words) to save.');
    return;
  }

  console.log('Selected text:', selectedText);

  // Send to backend API
  (async () => {
    try {
      const { token } = await new Promise(r => chrome.storage.local.get(['token'], r));
      if (!token) {
        console.warn('FlashCut: Not logged in — skipping save');
        return;
      }

      const response = await fetch('http://localhost:5000/api/flashcards', {
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

      const data = await response.json();
      console.log('Backend response:', data);

      // Show confirmation
      showConfirmation(selectedText);

    } catch (error) {
      console.error('Error sending to backend:', error);
    }
  })();
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