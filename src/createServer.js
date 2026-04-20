/* eslint-disable no-console */
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

      // 1. Початкова перевірка маршруту
      if (!pathname.startsWith('/file/') || pathname === '/file') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('To load a file, use /file/filename.ext');

        return;
      }

      // 2. Виділення імені файлу
      let fileName = pathname.slice(6); // Вирізаємо "/file/"

      // 3. Нормалізація: якщо порожньо — використовуємо index.html
      if (fileName === '' || fileName === '/') {
        fileName = 'index.html';
      }

      if (fileName.startsWith('/') || pathname.includes('..')) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Status: 400 - Bad Request');

        return;
      }

      // 5. Побудова абсолютних шляхів для перевірки
      const publicDir = path.join(process.cwd(), 'public');
      const fullPath = path.resolve(publicDir, fileName);

      if (!fullPath.startsWith(publicDir)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Status: 400 - Access Denied');

        return;
      }

      // 7. Перевірка на подвійні слеші в URL (за вашою умовою — 404)
      if (pathname.includes('//')) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Status: 404');

        return;
      }

      // 8. Читання файлу
      const content = await fs.promises.readFile(fullPath);

      // 9. Визначення Content-Type
      const ext = path.extname(fullPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'text/plain';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'EISDIR') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    }
  });
}

module.exports = { createServer };
