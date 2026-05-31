#!/usr/bin/env node
/**
 * cleanup-assets.js
 * Fixes remaining CDN references after download-assets.js:
 * 1. Downloads missing woff2 fonts and other overlooked assets
 * 2. Renames or retries .tmp files
 * 3. Rewrites ALL remaining CDN URLs in HTML/CSS/JS files
 *
 * Usage: node scripts/cleanup-assets.js <site-dir>
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

const CDN_HOSTS = ['framerusercontent.com', 'fonts.gstatic.com', 'fonts.googleapis.com'];

function isCDN(url) {
  try {
    const h = new URL(url).hostname;
    return CDN_HOSTS.some(cdn => h === cdn || h.endsWith('.' + cdn));
  } catch { return false; }
}

// Wider URL extraction - finds URLs in ALL contexts including inline CSS @font-face
function extractAllUrls(content) {
  const urls = new Set();
  // Match any https URL containing our CDN hosts
  const re = /https?:\/\/(?:framerusercontent\.com|fonts\.gstatic\.com|fonts\.googleapis\.com)[^\s"')\]\\,;>]+/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    let url = m[0].replace(/&amp;/g, '&').replace(/[,;)\]"'>\\]+$/, '');
    urls.add(url);
  }
  return urls;
}

function localPathFor(url) {
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 10);
  const parsed = new URL(url);
  let basename = path.basename(parsed.pathname.split('?')[0]) || 'asset';
  if (!path.extname(basename)) basename += '.bin';
  const bucket = parsed.hostname.replace(/\./g, '_');
  return path.join(assetsDir, `${bucket}_${hash}_${basename}`);
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && !dest.endsWith('.tmp')) { resolve(dest); return; }

    const proto = url.startsWith('https') ? https : http;
    const tmp = dest.endsWith('.tmp') ? dest : dest + '.tmp';
    const file = fs.createWriteStream(tmp);

    const req = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.ben-e.me/',
      }
    }, (resp) => {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        file.close(); try { fs.unlinkSync(tmp); } catch {}
        download(resp.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (resp.statusCode !== 200) {
        file.close(); try { fs.unlinkSync(tmp); } catch {}
        reject(new Error(`HTTP ${resp.statusCode}`));
        return;
      }
      resp.pipe(file);
      file.on('finish', () => {
        file.close();
        const finalDest = tmp.endsWith('.tmp') ? tmp.slice(0, -4) : dest;
        try { fs.renameSync(tmp, finalDest); } catch {}
        resolve(finalDest);
      });
      file.on('error', (e) => { try { fs.unlinkSync(tmp); } catch {} reject(e); });
    });
    req.on('error', (e) => { try { fs.unlinkSync(tmp); } catch {} reject(e); });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  // Step 1: Fix stale .tmp files (retry download)
  console.log('Step 1: Retrying failed .tmp downloads...');
  const tmpFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.tmp'));
  for (const tmp of tmpFiles) {
    const tmpPath = path.join(assetsDir, tmp);
    const finalPath = tmpPath.slice(0, -4);
    // Try to rename if it has content > 1000 bytes
    const stat = fs.statSync(tmpPath);
    if (stat.size > 1000) {
      fs.renameSync(tmpPath, finalPath);
      console.log(`  Renamed: ${tmp} → ${path.basename(finalPath)}`);
    } else {
      console.log(`  Tiny/empty tmp, removing: ${tmp}`);
      fs.unlinkSync(tmpPath);
    }
  }

  // Step 2: Scan all files for remaining CDN URLs
  console.log('\nStep 2: Scanning for remaining CDN URLs...');
  const allFiles = execSync(
    `find "${siteDir}" -type f \\( -name "*.html" -o -name "*.css" -o -name "*.js" -o -name "*.mjs" \\) ! -path "*/_assets/*"`,
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(Boolean);

  const urlToFiles = new Map(); // url → set of files
  for (const f of allFiles) {
    let content;
    try { content = fs.readFileSync(f, 'utf-8'); } catch { continue; }
    for (const url of extractAllUrls(content)) {
      if (!urlToFiles.has(url)) urlToFiles.set(url, new Set());
      urlToFiles.get(url).add(f);
    }
  }

  console.log(`  Found ${urlToFiles.size} unique CDN URLs still in files.`);

  // Step 3: Download missing assets
  console.log('\nStep 3: Downloading missing assets...');
  const urlToLocal = new Map();

  // First, build map for already-downloaded assets
  for (const f of fs.readdirSync(assetsDir)) {
    if (f.endsWith('.tmp')) continue;
    // We can't easily reverse-map filename→url, so we'll re-download or check by path
  }

  const failed = [];
  let downloaded = 0;

  for (const [url] of urlToFiles) {
    const localPath = localPathFor(url);
    if (fs.existsSync(localPath)) {
      urlToLocal.set(url, localPath);
      continue;
    }
    try {
      process.stdout.write(`  ↓ ${url.slice(0, 90)}\n`);
      const p = await download(url, localPath);
      urlToLocal.set(url, p);
      downloaded++;
    } catch (e) {
      failed.push({ url, error: e.message });
      process.stdout.write(`  ✗ ${e.message.slice(0, 60)}: ${url.slice(0, 60)}\n`);
    }
  }

  console.log(`\n  Downloaded ${downloaded} new assets. ${failed.length} failed.`);

  // Step 4: Rewrite all files
  console.log('\nStep 4: Rewriting CDN URLs to local paths...');
  let filesRewritten = 0;

  for (const f of allFiles) {
    let content;
    try { content = fs.readFileSync(f, 'utf-8'); } catch { continue; }
    let changed = false;

    // Sort URLs by length descending to avoid partial replacements
    const urlsSorted = [...urlToLocal.keys()].sort((a, b) => b.length - a.length);

    for (const url of urlsSorted) {
      if (!content.includes(url)) continue;
      const localPath = urlToLocal.get(url);
      const relPath = path.relative(path.dirname(f), localPath).replace(/\\/g, '/');
      const encoded = url.replace(/&/g, '&amp;');
      content = content.split(url).join(relPath);
      if (encoded !== url) content = content.split(encoded).join(relPath);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(f, content, 'utf-8');
      filesRewritten++;
    }
  }

  console.log(`  Rewrote ${filesRewritten} files.`);

  // Step 5: Count remaining CDN refs
  console.log('\nStep 5: Checking remaining CDN references...');
  let remaining = 0;
  for (const f of allFiles) {
    let content;
    try { content = fs.readFileSync(f, 'utf-8'); } catch { continue; }
    const refs = extractAllUrls(content);
    if (refs.size > 0) {
      remaining += refs.size;
      console.log(`  ${path.basename(f)}: ${refs.size} CDN refs remaining`);
      [...refs].slice(0, 3).forEach(u => console.log(`    ${u.slice(0, 80)}`));
    }
  }

  if (remaining === 0) {
    console.log('  ✓ No CDN references remaining!');
  } else {
    console.log(`\n  ${remaining} CDN references still remaining (likely harmless inline mentions).`);
  }

  console.log('\n✓ Cleanup complete!');
  console.log(`\nNext step: cd ${siteDir} && npx serve .`);
}

main().catch(err => { console.error('\nFatal:', err); process.exit(1); });
