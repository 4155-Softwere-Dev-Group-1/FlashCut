// Utility functions for formatting

function formatFlashcard(flashcard) {
  return {
    id: flashcard.id,
    question: flashcard.question,
    answer: flashcard.answer,
    createdAt: flashcard.created_at
  };
}

function formatError(error) {
  return {
    message: error.message,
    status: error.status || 500
  };
}

module.exports = {
  formatFlashcard,
  formatError,
};
