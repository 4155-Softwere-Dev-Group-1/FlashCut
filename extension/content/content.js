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