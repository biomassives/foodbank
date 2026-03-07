#!/usr/bin/env node
/**
 * Static SPA server for Replit (and any Node-based host).
 * Zero external dependencies — uses only Node built-ins.
 * Serves dist/spa with a catch-all fallback to index.html
 * so Vue Router can handle all client-side routes.
 *
 * Usage:
 *   node scripts/serve-spa.js
 *   PORT=3000 node scripts/serve-spa.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3000', 10);
const DIST = path.join(__dirname, '..', 'dist', 'spa');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  // Strip query string
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST, urlPath);

  // Try the exact path, then with .html, then fall back to index.html (SPA)
  const candidates = [filePath, filePath + '.html', path.join(DIST, 'index.html')];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const ext = path.extname(candidate);
      const mime = MIME[ext] || 'application/octet-stream';
      // Long-lived cache for hashed assets; no-cache for index.html
      const isAsset = urlPath.startsWith('/assets/');
      const cacheControl = isAsset
        ? 'public, max-age=31536000, immutable'
        : 'no-cache, no-store, must-revalidate';
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': cacheControl });
      fs.createReadStream(candidate).pipe(res);
      return;
    }
  }

  // Should not reach here (index.html always exists), but just in case
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`FoodBank SPA running at http://localhost:${PORT}`);
  console.log(`Serving: ${DIST}`);
});
