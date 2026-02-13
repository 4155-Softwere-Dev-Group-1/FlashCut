// Flashcard controller

const flashcardService = require('../services/flashcardService');

async function createFlashcard(req, res, next) {
  try {
    const { content } = req.body;
    const flashcard = await flashcardService.generateFlashcard(content);
    res.json(flashcard);
  } catch (error) {
    next(error);
  }
}

async function getFlashcards(req, res, next) {
  try {
    const flashcards = await flashcardService.getAllFlashcards();
    res.json(flashcards);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFlashcard,
  getFlashcards,
};
