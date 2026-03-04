const express = require('express');
const cors = require('cors');
const flashcardRoutes = require('./routes/flashcardRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/flashcards', flashcardRoutes);
app.use(require('./middleware/errorHandler'));

module.exports = app;