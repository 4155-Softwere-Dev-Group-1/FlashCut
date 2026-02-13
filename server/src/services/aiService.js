// AI service for flashcard generation

const openai = require('../config/openai');

async function generateFlashcard(content) {
  try {
    // TODO: Implement OpenAI API call to generate flashcards
    console.log('Generating flashcard for content:', content);
    return {
      question: 'Sample question',
      answer: 'Sample answer'
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateFlashcard,
};
