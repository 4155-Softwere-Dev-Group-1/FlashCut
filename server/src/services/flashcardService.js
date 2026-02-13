// Flashcard service

const pool = require('../config/db');
const aiService = require('./aiService');

async function generateFlashcard(content) {
  try {
    const flashcard = await aiService.generateFlashcard(content);
    // TODO: Save to database
    return flashcard;
  } catch (error) {
    throw error;
  }
}

async function getAllFlashcards() {
  try {
    const result = await pool.query('SELECT * FROM flashcards');
    return result.rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateFlashcard,
  getAllFlashcards,
};
