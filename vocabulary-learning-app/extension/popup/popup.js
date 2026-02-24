console.log('Popup opened!');

const list = document.getElementById('flashcard-list');
const clearBtn = document.getElementById('clear-btn');

function renderFlashcards(flashcards) {
  list.innerHTML = '';

  if (flashcards.length === 0) {
    list.innerHTML = '<p class="empty-message">No flashcards yet. Highlight a word on any webpage!</p>';
    return;
  }

  flashcards.slice().reverse().forEach((card, index) => {
    const div = document.createElement('div');
    div.className = 'flashcard';

    div.innerHTML = `
      <div class="term">${card.term}</div>
      <div class="sentence">${card.sentence}</div>
    `;

    list.appendChild(div);
  });
}

chrome.storage.local.get(['flashcards'], (result) => {
  const flashcards = result.flashcards || [];
  renderFlashcards(flashcards);
});

clearBtn.addEventListener('click', () => {
  chrome.storage.local.set({ flashcards: [] }, () => {
    renderFlashcards([]);
  });
});