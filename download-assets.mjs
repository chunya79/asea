import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, 'assets');

const images = [
  { url: 'https://www.aseaglobal.com/_next/static/media/ars-carousel-ch.2500080b.jpg',  out: 'product-ars.jpg' },
  { url: 'https://www.aseaglobal.com/_next/static/media/renu-carousel.d3480de9.jpg',    out: 'product-renu28.jpg' },
  { url: 'https://www.aseaglobal.com/_next/static/media/ra-carousel.93f18c6c.jpg',      out: 'product-renuadvanced.jpg' },
  { url: 'https://www.aseaglobal.com/_next/static/media/woman-in-city.1f0d8235.jpg',    out: 'hero-woman.jpg' },
  { url: 'https://www.aseaglobal.com/_next/static/media/man-cutout.25a684bc.png',       out: 'hero-man.png' },
];

function download(url, outPath) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    const req = https.get({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Referer': 'https://www.aseaglobal.com/en-GB',
        'sec-fetch-dest': 'image',
        'sec-fetch-mode': 'no-cors',
        'sec-fetch-site': 'same-origin',
      }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, outPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(outPath, buf);
        resolve(buf.length);
      });
    });
    req.on('error', reject);
  });
}

for (const img of images) {
  const outPath = path.join(ASSETS, img.out);
  try {
    const bytes = await download(img.url, outPath);
    console.log(`✓ ${img.out} (${(bytes/1024).toFixed(1)} KB)`);
  } catch (e) {
    console.error(`✗ ${img.out}: ${e.message}`);
  }
}
