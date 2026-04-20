'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json',
};

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const pathname = decodeURIComponent(urlObj.pathname);

      if (!pathname.startsWith('/file/') || pathname === '/file') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('To load a file, use /file/filename.ext');

        return;
      }

      if (pathname.includes('../')) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Status: 400 - Traversal detected');

        return;
      }

      if (pathname.includes('//')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Status: 404');

        return;
      }

      let fileName = pathname.slice(6);

      if (fileName === '') {
        fileName = 'index.html';
      }

      const fullPath = path.join(process.cwd(), 'public', fileName);
      const content = await fs.promises.readFile(fullPath);
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'text/plain';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
  });
}

module.exports = {
  createServer,
};
