import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.drawio': 'application/xml',
  '.properties': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function serveFile(req, res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(data),
      'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Referrer-Policy', 'no-referrer');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', app: 'drawio', version: '1.0.0' }));
    return;
  }

  if (pathname.endsWith('.map')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  if (pathname.endsWith('/app-bridge.global.js')) {
    serveFile(req, res, path.join(PUBLIC_DIR, 'app-bridge.global.js'), MIME_TYPES['.js']);
    return;
  }

  const requestedFile = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidatePath = path.resolve(PUBLIC_DIR, requestedFile);

  if (candidatePath !== PUBLIC_DIR && !candidatePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(candidatePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(candidatePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      serveFile(req, res, candidatePath, mime);
    } else if (!err && stats.isDirectory()) {
      const indexCandidate = path.join(candidatePath, 'index.html');
      if (fs.existsSync(indexCandidate)) {
        serveFile(req, res, indexCandidate, MIME_TYPES['.html']);
      } else {
        serveFile(req, res, path.join(PUBLIC_DIR, 'index.html'), MIME_TYPES['.html']);
      }
    } else {
      serveFile(req, res, path.join(PUBLIC_DIR, 'index.html'), MIME_TYPES['.html']);
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`draw.io listening on http://${HOST}:${PORT}`);
});
