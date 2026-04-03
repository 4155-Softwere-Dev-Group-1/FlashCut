const express = require('express');
const cors = require('cors');
const flashcardRoutes = require('./routes/flashcardRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'FlashCut API', routes: ['/health', '/api/auth', '/api/flashcards'] });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use(require('./middleware/errorHandler'));

module.exports = app;