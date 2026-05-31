#!/usr/bin/env node
/**
 * fix-module-assets.js
 * 1. Scans all _modules/*.mjs for framerusercontent.com image/font/asset URLs
 * 2. Downloads them to _assets/ (skips already downloaded)
 * 3. Rewrites URLs in .mjs files to local relative paths
 * 4. Patches out framer.com/edit/init.mjs dynamic import
 *
 * Usage: node scripts/fix-module-assets.js <site-dir>
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
const modulesDir = path.join(siteDir, '_modules');

fs.mkdirSync(assetsDir, { recursive: true });

const CDN_HOSTS = ['framerusercontent.com', 'fonts.gstatic.com', 'fonts.googleapis.com'];

function isCDN(url) {
  try {
    const h = new URL(url).hostname;
    return CDN_HOSTS.some(cdn => h === cdn || h.endsWith('.' + cdn));
  } catch { return false; }
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
        file.close(); try { fs.unlinkSync(tmp); } catch {}
        download(resp.headers.location, dest).then(resolve).catch(reject); return;
      }
      if (resp.statusCode !== 200) {
        file.close(); try { fs.unlinkSync(tmp); } catch {}
        reject(new Error(`HTTP ${resp.statusCode}`)); return;
      }
      resp.pipe(file);
      file.on('finish', () => { file.close(); fs.renameSync(tmp, dest); resolve(dest); });
      file.on('error', (e) => { try { fs.unlinkSync(tmp); } catch {} reject(e); });
    });
    req.on('error', (e) => { try { fs.unlinkSync(tmp); } catch {} reject(e); });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractCDNUrls(content) {
  const urls = new Set();
  const re = /["'`](https?:\/\/(?:framerusercontent\.com|fonts\.gstatic\.com)[^"'`\s]+)["'`]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const url = m[1].replace(/&amp;/g, '&');
    // Only images, fonts, assets — not other .mjs modules (those are handled separately)
    if (!url.endsWith('.mjs') && !url.includes('/sites/') || url.includes('/images/') || url.includes('/assets/') || url.includes('/third-party-assets/')) {
      urls.add(url);
    }
  }
  return urls;
}

async function main() {
  const mjsFiles = fs.readdirSync(modulesDir)
    .filter(f => f.endsWith('.mjs'))
    .map(f => path.join(modulesDir, f));

  console.log(`Found ${mjsFiles.length} .mjs files in _modules/\n`);

  // Step 1: Collect all CDN URLs from all .mjs files
  console.log('Step 1: Scanning .mjs files for CDN asset URLs...');
  const allUrls = new Set();
  for (const f of mjsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    for (const u of extractCDNUrls(content)) allUrls.add(u);
  }
  console.log(`  Found ${allUrls.size} unique CDN URLs\n`);

  // Step 2: Download missing assets
  console.log('Step 2: Downloading missing assets...');
  const urlToLocal = new Map();
  let downloaded = 0, skipped = 0, failed = 0;

  // Process in batches of 15
  const urls = [...allUrls];
  for (let i = 0; i < urls.length; i += 15) {
    const batch = urls.slice(i, i + 15);
    await Promise.all(batch.map(async (url) => {
      const localPath = localPathFor(url);
      if (fs.existsSync(localPath)) {
        urlToLocal.set(url, localPath);
        skipped++;
        return;
      }
      try {
        process.stdout.write(`  ↓ ${url.slice(0, 80)}\n`);
        await download(url, localPath);
        urlToLocal.set(url, localPath);
        downloaded++;
      } catch (e) {
        process.stdout.write(`  ✗ ${url.slice(0, 60)}: ${e.message}\n`);
        failed++;
      }
    }));
  }
  console.log(`\n  Downloaded: ${downloaded}, Already cached: ${skipped}, Failed: ${failed}\n`);

  // Step 3: Rewrite URLs in all .mjs files
  console.log('Step 3: Rewriting CDN URLs in .mjs files...');
  let filesChanged = 0;

  // Sort URLs longest-first to avoid partial replacement
  const sortedUrls = [...urlToLocal.keys()].sort((a, b) => b.length - a.length);

  for (const f of mjsFiles) {
    let content = fs.readFileSync(f, 'utf-8');
    let changed = false;

    for (const url of sortedUrls) {
      if (!content.includes(url)) continue;
      const localPath = urlToLocal.get(url);
      const relPath = path.relative(path.dirname(f), localPath).replace(/\\/g, '/');
      content = content.split(url).join(relPath);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(f, content, 'utf-8');
      filesChanged++;
    }
  }
  console.log(`  Rewrote ${filesChanged} .mjs files\n`);

  // Step 4: Patch out framer.com/edit/init.mjs dynamic import from script_main
  console.log('Step 4: Patching out Framer editor init import...');
  const scriptMain = path.join(modulesDir, 'script_main.Cx9w0sk5.mjs');
  if (fs.existsSync(scriptMain)) {
    let content = fs.readFileSync(scriptMain, 'utf-8');
    // Replace dynamic import of framer editor
    const before = content.length;
    content = content.replace(
      /import\s*\(\s*["']https?:\/\/framer\.com\/edit\/init\.mjs["']\s*\)/g,
      'Promise.resolve()'
    );
    // Also replace any localStorage check that triggers it
    content = content.replace(
      /if\s*\([^)]*__framer_force_showing_editorbar[^)]*\)\s*\{[^}]*\}/g,
      '/* framer editor bar removed */'
    );
    if (content.length !== before) {
      fs.writeFileSync(scriptMain, content);
      console.log('  Patched script_main.Cx9w0sk5.mjs');
    } else {
      console.log('  No pattern match — checking raw content...');
      // Check what's actually in there
      const lines = content.split('\n').filter(l => l.includes('framer.com/edit'));
      lines.forEach(l => console.log('    ' + l.slice(0, 120)));
    }
  } else {
    console.log('  script_main not found, searching all .mjs files...');
    for (const f of mjsFiles) {
      const content = fs.readFileSync(f, 'utf-8');
      if (content.includes('framer.com/edit')) {
        console.log(`  Found in: ${path.basename(f)}`);
        const fixed = content.replace(
          /import\s*\(\s*["']https?:\/\/framer\.com\/edit\/init\.mjs["']\s*\)/g,
          'Promise.resolve()'
        );
        if (fixed !== content) fs.writeFileSync(f, fixed);
      }
    }
  }

  // Step 5: Verify - count remaining CDN refs in .mjs files
  console.log('\nStep 5: Counting remaining CDN refs...');
  let total = 0;
  for (const f of mjsFiles) {
    const content = fs.readFileSync(f, 'utf-8');
    const refs = (content.match(/https?:\/\/(?:framerusercontent|fonts\.gstatic)\.com[^\s"'`]*/g) || []).length;
    total += refs;
  }
  console.log(`  ${total} CDN refs remaining in .mjs files`);
  if (total > 0) console.log('  (These are likely non-downloadable/dynamic URLs — acceptable)');

  console.log('\n✓ Done!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
