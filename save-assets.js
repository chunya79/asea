const http = require('http');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'assets');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Filename');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST') {
    const filename = req.headers['x-filename'] || 'unknown.bin';
    const filepath = path.join(ASSETS_DIR, filename);
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(filepath, buf);
      console.log(`Saved: ${filename} (${buf.length} bytes)`);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, file: filename, bytes: buf.length }));
    });
    return;
  }

  res.writeHead(404); res.end();
});

server.listen(7788, () => console.log('Asset saver ready on http://localhost:7788'));
