// Flashcard routes

const express = require('express');
const controller = require('../controllers/flashcardController');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post('/', validateRequest, controller.createFlashcard);
router.get('/', controller.getFlashcards);

module.exports = router;
