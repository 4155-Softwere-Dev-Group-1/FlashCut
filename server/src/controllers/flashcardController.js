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

async function updateFlashcard(req, res, next) {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer are required' });
    const flashcard = await flashcardService.updateFlashcard(id, req.userId, question, answer);
    if (!flashcard) return res.status(404).json({ error: 'Flashcard not found' });
    res.json(flashcard);
  } catch (error) {
    next(error);
  }
}

async function deleteFlashcard(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await flashcardService.deleteFlashcard(id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Flashcard not found' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFlashcard,
  getFlashcards,
  updateFlashcard,
  deleteFlashcard,
};