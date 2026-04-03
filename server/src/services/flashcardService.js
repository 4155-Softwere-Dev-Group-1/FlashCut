const pool = require('../config/db');
const aiService = require('./aiService');

async function generateFlashcard(term, sentence, sourceUrl, userId) {
  const flashcard = await aiService.generateFlashcard(term, sentence);

  const result = await pool.query(
    `INSERT INTO flashcards (user_id, question, answer)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, flashcard.question, flashcard.answer]
  );

  return result.rows[0];
}

async function getAllFlashcards(userId) {
  const result = await pool.query(
    'SELECT * FROM flashcards WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

module.exports = {
  generateFlashcard,
  getAllFlashcards,
};