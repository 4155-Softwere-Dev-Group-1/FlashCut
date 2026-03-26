const express = require('express');
const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Capture vocabulary endpoint
app.post('/api/captures', async (req, res) => {
  const { term, sentence, sourceUrl } = req.body;
  
  console.log('Received capture:', { term, sentence });
  
  try {
    // For now, just echo back - we'll add database later
    res.json({
      success: true,
      data: { term, sentence, sourceUrl }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to save capture' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});