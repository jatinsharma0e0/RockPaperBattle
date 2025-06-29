const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json'
};

// Create the server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Handle favicon.ico request
  if (req.url === '/favicon.ico') {
    const faviconPath = path.join(__dirname, 'assets', 'icons', 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
      res.setHeader('Content-Type', 'image/x-icon');
      fs.createReadStream(faviconPath).pipe(res);
      return;
    }
  }

  // Parse the URL
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // If file doesn't exist, serve index.html (for SPA routing)
      filePath = path.join(__dirname, 'index.html');
    }
    
    // Get file extension and set content type
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        return;
      }
      
      // Serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Simple server running at http://localhost:${PORT}/`);
  console.log(`Serving files directly from source (no Express dependency)`);
}); 