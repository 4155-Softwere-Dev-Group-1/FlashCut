// Flashcard controller

const flashcardService = require('../services/flashcardService');

async function createFlashcard(req, res, next) {
  try {
    const { term, sentence, sourceUrl } = req.body;
    console.log(`[POST /api/flashcards] term: "${term}" | source: ${sourceUrl}`);
    const flashcard = await flashcardService.generateFlashcard(term, sentence, sourceUrl);
    console.log(`[POST /api/flashcards] saved flashcard id: ${flashcard.id}`);
    res.json(flashcard);
  } catch (error) {
    next(error);
  }
}

async function getFlashcards(req, res, next) {
  try {
    console.log('[GET /api/flashcards] fetching all flashcards');
    const flashcards = await flashcardService.getAllFlashcards();
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
