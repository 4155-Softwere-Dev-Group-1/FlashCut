// Server entry point

require('dotenv').config();
const app = require('./app');

const PORT = process.env.SERVER_PORT || 5000;

app.listen(PORT, () => {
  console.log(`FlashCut server running on port ${PORT}`);
});
