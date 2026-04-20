'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (!req.url.startsWith('/file/') || req.url === '/file') {
        res.end('hint message');

        return;
      }

      if (req.url.includes('../')) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('400');

        return;
      }

      if (req.url.includes('//')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404');

        return;
      }

      const fileName = req.url.slice(6);
      const fullPath = path.join(__dirname, 'public', fileName);
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
