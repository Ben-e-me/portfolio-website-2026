#!/usr/bin/env node
/**
 * download-assets.js
 * Downloads all external assets from crawled Framer HTML pages:
 * - Images, fonts, JS modules from framerusercontent.com and fonts.gstatic.com
 * - Follows import() and import statements inside .mjs/.js files recursively
 * - Rewrites all CDN URLs to local relative paths
 *
 * Usage: node scripts/download-assets.js <site-dir>
 *   e.g. node scripts/download-assets.js ~/portfolio-crawl/site/www.ben-e.me
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');
const { execSync } = require('child_process');

const siteDir = path.resolve(process.argv[2] || process.env.HOME + '/portfolio-crawl/site/www.ben-e.me');
const assetsDir = path.join(siteDir, '_assets');

fs.mkdirSync(assetsDir, { recursive: true });

const downloaded = new Map(); // url → local abs path
const queue = new Set();
const failed = [];

// CDN hosts to download locally
const CDN_HOSTS = ['framerusercontent.com', 'fonts.gstatic.com', 'fonts.googleapis.com'];

function isCDN(url) {
  try {
    const h = new URL(url).hostname;
    return CDN_HOSTS.some(cdn => h === cdn || h.endsWith('.' + cdn));
  } catch { return false; }
}

function localPathFor(url) {
  if (downloaded.has(url)) return downloaded.get(url);
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 10);
  const parsed = new URL(url);
  // Preserve filename + ext for readability
  let basename = path.basename(parsed.pathname.split('?')[0]) || 'asset';
  if (!path.extname(basename)) basename += '.bin';
  // Prefix with host bucket
  const bucket = parsed.hostname.replace(/\./g, '_');
  const local = path.join(assetsDir, `${bucket}_${hash}_${basename}`);
  return local;
}

function download(url) {
  return new Promise((resolve, reject) => {
    const dest = localPathFor(url);
    if (fs.existsSync(dest)) { resolve(dest); return; }

    const proto = url.startsWith('https') ? https : http;
    const tmp = dest + '.tmp';
    const file = fs.createWriteStream(tmp);

    const req = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.ben-e.me/',
      }
    }, (resp) => {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        file.close();
        fs.unlinkSync(tmp);
        download(resp.headers.location).then(resolve).catch(reject);
        return;
      }
      if (resp.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(tmp); } catch {}
        reject(new Error(`HTTP ${resp.statusCode} for ${url}`));
        return;
      }
      resp.pipe(file);
      file.on('finish', () => { file.close(); fs.renameSync(tmp, dest); resolve(dest); });
      file.on('error', (e) => { try { fs.unlinkSync(tmp); } catch {} reject(e); });
    });
    req.on('error', (e) => { try { fs.unlinkSync(tmp); } catch {} reject(e); });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout: ' + url)); });
  });
}

function extractUrls(content, baseUrl) {
  const urls = new Set();
  // HTML: src="...", href="...", content="...", url(...)
  const patterns = [
    /(?:src|href|content)=["'](https?:\/\/[^"']+)["']/g,
    /url\(["']?(https?:\/\/[^"')]+)["']?\)/g,
    // ES module imports with full URL
    /from\s+["'](https?:\/\/[^"']+)["']/g,
    /import\s*\(\s*["'](https?:\/\/[^"']+)["']\s*\)/g,
    // modulepreload
    /modulepreload.*?href=["'](https?:\/\/[^"']+)["']/g,
    // Bare URLs in JSON/CSS
    /"(https?:\/\/framerusercontent\.com\/[^"]+)"/g,
    /"(https?:\/\/fonts\.gstatic\.com\/[^"]+)"/g,
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(content)) !== null) {
      const u = m[1].replace(/&amp;/g, '&');
      if (isCDN(u)) urls.add(u);
    }
  }
  return urls;
}

async function processAsset(url) {
  if (downloaded.has(url)) return;
  queue.delete(url);

  process.stdout.write(`  ↓ ${url.slice(0, 100)}\n`);
  let localPath;
  try {
    localPath = await download(url);
    downloaded.set(url, localPath);
  } catch (e) {
    failed.push({ url, error: e.message });
    console.warn(`  ✗ ${e.message}`);
    return;
  }

  // If it's a JS/MJS file, extract more URLs from it
  const ext = path.extname(url.split('?')[0]).toLowerCase();
  if (['.js', '.mjs', '.css'].includes(ext)) {
    try {
      const content = fs.readFileSync(localPath, 'utf-8');
      const moreUrls = extractUrls(content, url);
      for (const u of moreUrls) {
        if (!downloaded.has(u) && !queue.has(u)) {
          queue.add(u);
        }
      }
    } catch {}
  }
}

async function rewriteFile(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf-8'); } catch { return; }

  let changed = false;
  // Replace all CDN URLs with local relative paths
  for (const [url, localPath] of downloaded) {
    if (!content.includes(url)) continue;
    const relPath = path.relative(path.dirname(filePath), localPath).replace(/\\/g, '/');
    // Replace URL and also HTML-encoded version
    const encoded = url.replace(/&/g, '&amp;');
    content = content.split(url).join(relPath);
    if (encoded !== url) content = content.split(encoded).join(relPath);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  Rewritten: ${path.relative(siteDir, filePath)}`);
  }
}

async function main() {
  console.log(`\nSite dir:   ${siteDir}`);
  console.log(`Assets dir: ${assetsDir}\n`);

  // Step 1: Collect all URLs from HTML files
  const htmlFiles = execSync(`find "${siteDir}" -maxdepth 1 -name "*.html"`, { encoding: 'utf-8' })
    .trim().split('\n').filter(Boolean);

  console.log(`Found ${htmlFiles.length} HTML files. Scanning for CDN assets...\n`);

  for (const f of htmlFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const urls = extractUrls(content, 'https://www.ben-e.me/');
    for (const u of urls) queue.add(u);
  }

  console.log(`Found ${queue.size} unique CDN URLs to download.\n`);

  // Step 2: Download all assets (queue grows as JS files are parsed)
  while (queue.size > 0) {
    const batch = [...queue].slice(0, 10); // 10 parallel downloads
    for (const u of batch) queue.delete(u);
    await Promise.all(batch.map(u => processAsset(u)));
    if (queue.size > 0) process.stdout.write(`  [${queue.size} remaining in queue]\n`);
  }

  console.log(`\nDownloaded ${downloaded.size} assets. Rewriting paths...\n`);

  // Step 3: Rewrite all HTML, CSS, JS files
  const allFiles = execSync(
    `find "${siteDir}" -type f \\( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.mjs" \\) ! -path "*/_assets/*"`,
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(Boolean);

  for (const f of allFiles) await rewriteFile(f);

  console.log(`\n✓ Done!`);
  console.log(`  Assets downloaded: ${downloaded.size}`);
  if (failed.length) {
    console.log(`  Failed (${failed.length}):`);
    failed.slice(0, 10).forEach(f => console.log(`    - ${f.url.slice(0, 80)}: ${f.error}`));
  }
  console.log(`\nNext: cd ${siteDir} && npx serve .`);
}

main().catch(err => { console.error('\nFatal:', err); process.exit(1); });
