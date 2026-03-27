// Express app initialization

const express = require('express');
const flashcardRoutes = require('./routes/flashcardRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'Server is running!' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'FlashCut API', routes: ['/health', '/api/flashcards'] });
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);

// Error handling middleware
app.use(require('./middleware/errorHandler'));

module.exports = app;
