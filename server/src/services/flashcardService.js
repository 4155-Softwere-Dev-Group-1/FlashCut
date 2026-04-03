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

async function updateFlashcard(id, userId, question, answer) {
  const result = await pool.query(
    `UPDATE flashcards SET question = $1, answer = $2, updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [question, answer, id, userId]
  );
  return result.rows[0] || null;
}

async function deleteFlashcard(id, userId) {
  const result = await pool.query(
    'DELETE FROM flashcards WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows[0] || null;
}

module.exports = {
  generateFlashcard,
  getAllFlashcards,
  updateFlashcard,
  deleteFlashcard,
};