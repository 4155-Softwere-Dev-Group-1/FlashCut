// Server entry point

require('dotenv').config();
const app = require('./app');

const desiredPort = process.env.SERVER_PORT || process.env.PORT;

function start(port) {
  const server = app.listen(port, () => {
    const p = server.address().port;
    console.log(`FlashCut server running on port ${p}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use — trying a random available port...`);
      setTimeout(() => start(0), 100);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

start(desiredPort ? Number(desiredPort) : 0);
