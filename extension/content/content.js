document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();

  if (!selectedText) return;

  // Limit to short phrases (1–3 words)
  if (selectedText.split(/\s+/).length > 3) return;

  console.log('Selected text:', selectedText);

  const confirmSave = confirm(`Save "${selectedText}" as a flashcard?`);
  if (!confirmSave) return;

  const sentence = window.getSelection().anchorNode?.parentElement?.innerText || 'Context unavailable';

  chrome.storage.local.get(['flashcards'], (result) => {
    const flashcards = result.flashcards || [];

    flashcards.push({
      term: selectedText,
      sentence: sentence,
      timestamp: Date.now()
    });

    chrome.storage.local.set({ flashcards }, () => {
      console.log('Flashcard saved!');
    });
  });
});