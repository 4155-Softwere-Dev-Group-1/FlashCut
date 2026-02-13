// Express app initialization

const express = require('express');
const flashcardRoutes = require('./routes/flashcardRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/flashcards', flashcardRoutes);

// Error handling middleware
app.use(require('./middleware/errorHandler'));

module.exports = app;
