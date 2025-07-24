const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start the server if not running in Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rock Paper Battle server running at http://0.0.0.0:${PORT}/`);
    console.log('Game is ready to play!');
  });
}

// Export the Express app for Vercel
module.exports = app; 