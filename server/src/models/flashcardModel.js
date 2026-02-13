// Flashcard model

const pool = require('../config/db');

class Flashcard {
  constructor(question, answer, userId) {
    this.question = question;
    this.answer = answer;
    this.userId = userId;
  }

  async save() {
    const query = 'INSERT INTO flashcards (question, answer, user_id) VALUES ($1, $2, $3) RETURNING *';
    const result = await pool.query(query, [this.question, this.answer, this.userId]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM flashcards WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Flashcard;
