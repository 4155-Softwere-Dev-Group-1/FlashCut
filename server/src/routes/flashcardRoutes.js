// Flashcard routes

const express = require('express');
const controller = require('../controllers/flashcardController');
const validateRequest = require('../middleware/validateRequest');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, validateRequest, controller.createFlashcard); 
router.get('/', requireAuth, controller.getFlashcards); 

module.exports = router;
