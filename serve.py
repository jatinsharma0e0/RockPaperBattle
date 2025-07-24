#!/usr/bin/env python3
"""
Python server wrapper for Rock Paper Battle game.
This serves as a compatibility layer for Replit while maintaining 
the existing Node.js/Express architecture for security and separation of concerns.
"""

import subprocess
import sys
import os
import signal
import time

def signal_handler(sig, frame):
    """Handle shutdown signals gracefully"""
    print("\nShutting down server...")
    sys.exit(0)

def main():
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("Starting Rock Paper Battle server...")
    print("This Python wrapper starts the Node.js Express server for Replit compatibility.")
    
    # Check if node_modules exists, if not install dependencies
    if not os.path.exists("node_modules"):
        print("Installing Node.js dependencies...")
        try:
            subprocess.run(["npm", "install"], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to install dependencies: {e}")
            sys.exit(1)
    
    # Build the project if dist doesn't exist
    if not os.path.exists("dist"):
        print("Building project...")
        try:
            subprocess.run(["npm", "run", "build"], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Failed to build project: {e}")
            print("Falling back to development mode...")
    
    # Set environment variables for Replit
    os.environ["PORT"] = "5000"
    os.environ["HOST"] = "0.0.0.0"
    
    try:
        # Always use the simple server approach for reliability
        print("Starting development server on port 5000...")
        subprocess.run(["node", "-e", """
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOST = '0.0.0.0';

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

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  if (req.url === '/favicon.ico') {
    const faviconPath = path.join(__dirname, 'assets', 'icons', 'favicon.ico');
    if (fs.existsSync(faviconPath)) {
      res.setHeader('Content-Type', 'image/x-icon');
      fs.createReadStream(faviconPath).pipe(res);
      return;
    }
  }

  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      filePath = path.join(__dirname, 'index.html');
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Rock Paper Battle server running at http://${HOST}:${PORT}/`);
  console.log('Game is ready to play!');
});
"""], check=True)
            
    except subprocess.CalledProcessError as e:
        print(f"Server failed to start: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
        sys.exit(0)

if __name__ == "__main__":
    main()