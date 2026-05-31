#!/usr/bin/env node
/**
 * fix-cdn-assets.js
 * Scans all HTML/CSS/JS files for remaining external CDN URLs
 * (Framer CDN, Google Fonts, etc.), downloads them locally, and rewrites paths.
 *
 * Usage: node scripts/fix-cdn-assets.js <site-directory>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { execSync } = require('child_process');
const crypto = require('crypto');

const TARGET_HOSTS = [
  'framerusercontent.com',
  'assets.framer.com',
  'framer.com/m/',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

const siteDir = path.resolve(process.argv[2] || '.');
const assetsLocalDir = path.join(siteDir, '_cdn-assets');

if (!fs.existsSync(assetsLocalDir)) fs.mkdirSync(assetsLocalDir, { recursive: true });

const downloaded = new Map(); // url → local absolute path

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (resp) => {
      if (resp.statusCode === 301 || resp.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(resp.headers.location, destPath).then(resolve).catch(reject);
      }
      if (resp.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${resp.statusCode}`));
      }
      resp.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    }).on('error', (e) => { file.close(); reject(e); });
  });
}

async function download(url) {
  if (downloaded.has(url)) return downloaded.get(url);

  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 8);
  let ext = path.extname(new URL(url).pathname) || '';
  // Strip query strings from ext
  if (ext.includes('?')) ext = ext.split('?')[0];
  if (!ext || ext.length > 6) ext = '.bin';

  const parsed = new URL(url);
  const filename = `${parsed.hostname.replace(/\./g, '_')}_${hash}${ext}`;
  const localPath = path.join(assetsLocalDir, filename);

  if (fs.existsSync(localPath)) {
    downloaded.set(url, localPath);
    return localPath;
  }

  process.stdout.write(`  ↓ ${url.slice(0, 90)}...\n`);
  await downloadFile(url, localPath);
  downloaded.set(url, localPath);
  return localPath;
}

function findExternalUrls(content) {
  const urls = new Set();
  // Match URLs in quotes, parens, or bare
  const re = /(?:["'(])?(https?:\/\/[^\s"')\]>\\,;]+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const url = m[1].replace(/[,;)\]"'>\\]+$/, '');
    if (TARGET_HOSTS.some(host => url.includes(host))) {
      urls.add(url);
    }
  }
  return urls;
}

async function processFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return; // binary file, skip
  }

  const urls = findExternalUrls(content);
  if (urls.size === 0) return;

  console.log(`\n  File: ${path.relative(siteDir, filePath)} — ${urls.size} external URL(s)`);
  let changed = false;

  for (const url of urls) {
    try {
      const localPath = await download(url);
      const relPath = path.relative(path.dirname(filePath), localPath).replace(/\\/g, '/');
      content = content.split(url).join(relPath);
      changed = true;
    } catch (e) {
      console.warn(`  ✗ Failed: ${url.slice(0, 80)} — ${e.message}`);
    }
  }

  if (changed) fs.writeFileSync(filePath, content, 'utf-8');
}

async function main() {
  console.log(`\nScanning site directory: ${siteDir}`);
  console.log(`Local assets dir:        ${assetsLocalDir}\n`);

  const findCmd = `find "${siteDir}" -type f \\( -name "*.html" -o -name "*.css" -o -name "*.js" \\) ! -path "*/_cdn-assets/*"`;
  const files = execSync(findCmd, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);

  console.log(`Found ${files.length} files to scan.`);

  for (const file of files) {
    await processFile(file);
  }

  console.log(`\n✓ Done. Downloaded ${downloaded.size} remote assets to _cdn-assets/`);
  console.log(`\nNext step: npx serve . to test locally`);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
