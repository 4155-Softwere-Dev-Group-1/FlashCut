const flashcardService = require('../services/flashcardService');

async function createFlashcard(req, res, next) {
  try {
    const { term, sentence, sourceUrl } = req.body;
    console.log(`[POST /api/flashcards] user: ${req.userId} | term: "${term}" | source: ${sourceUrl}`);
    const flashcard = await flashcardService.generateFlashcard(term, sentence, sourceUrl, req.userId);
    console.log(`[POST /api/flashcards] saved flashcard id: ${flashcard.id}`);
    res.json(flashcard);
  } catch (error) {
    next(error);
  }
}

async function getFlashcards(req, res, next) {
  try {
    console.log(`[GET /api/flashcards] user: ${req.userId}`);
    const flashcards = await flashcardService.getAllFlashcards(req.userId);
    console.log(`[GET /api/flashcards] returned ${flashcards.length} cards`);
    res.json(flashcards);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFlashcard,
  getFlashcards,
};