const express = require('express');
const controller = require('../controllers/simplifyController');
const validateSimplify = require('../middleware/validateSimplify');
const requireAuth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', requireAuth, validateSimplify, controller.simplify);

module.exports = router;
