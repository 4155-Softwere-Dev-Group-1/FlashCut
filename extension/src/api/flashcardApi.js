// API module for communicating with FlashCut backend

const API_BASE_URL = 'http://localhost:5001/api';

async function createFlashcard(content) {
  try {
    const response = await fetch(`${API_BASE_URL}/flashcards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }
}

export { createFlashcard };
