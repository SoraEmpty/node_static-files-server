'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host}`);
      const pathname = decodeURIComponent(urlObj.pathname);

      if (!pathname.startsWith('/file/') || req.url === '/file') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('To load a file, use /file/filename.ext');

        return;
      }

      if (pathname.includes('..')) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Status: 400 - Traversal detected');

        return;
      }

      if (pathname.includes('//')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Status: 404');

        return;
      }

      const fileName = pathname.slice(6);
      const fullPath = path.join(process.cwd(), 'public', fileName);
      const content = await fs.promises.readFile(fullPath);

      res.writeHead(200);
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
