const pool = require('../config/db');
const aiService = require('./aiService');

async function generateFlashcard(content) {
  const flashcard = await aiService.generateFlashcard(content);

  const result = await pool.query(
    `INSERT INTO flashcards (user_id, question, answer)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [null, flashcard.question, flashcard.answer]
  );

  return result.rows[0];
}

async function getAllFlashcards() {
  const result = await pool.query(
    'SELECT * FROM flashcards ORDER BY created_at DESC'
  );
  return result.rows;
}

module.exports = {
  generateFlashcard,
  getAllFlashcards,
};