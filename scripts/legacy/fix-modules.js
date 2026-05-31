#!/usr/bin/env node
/**
 * fix-modules.js
 * Problem: .mjs files were saved as _assets/framerusercontent_com_HASH_basename.mjs
 *          but internal ES module imports reference just "./basename.mjs"
 *          → Browser can't resolve → 404 → text/html MIME error
 *
 * Fix:
 * 1. Move all .mjs files from _assets/ to _modules/ using just the basename
 * 2. Rewrite all _assets/HASH_basename.mjs references in HTML + _modules/*.mjs → _modules/basename.mjs
 * 3. Update _headers for correct MIME type
 *
 * Usage: node scripts/fix-modules.js <site-dir>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const siteDir = path.resolve(process.argv[2] || process.env.HOME + '/portfolio-crawl/site/www.ben-e.me');
const assetsDir = path.join(siteDir, '_assets');
const modulesDir = path.join(siteDir, '_modules');

fs.mkdirSync(modulesDir, { recursive: true });

// Step 1: Build mapping: old path → new path, for all .mjs files
console.log('Step 1: Building .mjs rename map...');
const renameMap = new Map(); // old abs path → new abs path
const baseToNew = new Map(); // original basename → new abs path (for relative import fix)

for (const f of fs.readdirSync(assetsDir)) {
  if (!f.endsWith('.mjs')) continue;
  const oldPath = path.join(assetsDir, f);

  // Strip prefix: framerusercontent_com_HASH_ → get everything after the 3rd underscore
  // Pattern: hostname_hash_basename  (hostname has underscores too)
  // Files look like: framerusercontent_com_HASH_basename.mjs
  // "framerusercontent_com" has 2 underscores, then hash, then basename
  const parts = f.split('_');
  // framerusercontent(0) _ com(1) _ HASH(2) _ rest...
  // so basename starts at index 3
  let basename = parts.slice(3).join('_');
  if (!basename) basename = f; // fallback

  const newPath = path.join(modulesDir, basename);
  renameMap.set(oldPath, newPath);
  baseToNew.set(basename, newPath);
  console.log(`  ${f} → _modules/${basename}`);
}

// Step 2: Copy .mjs files to _modules/ with new names
console.log(`\nStep 2: Copying ${renameMap.size} .mjs files to _modules/...`);
for (const [oldPath, newPath] of renameMap) {
  fs.copyFileSync(oldPath, newPath);
}

// Step 3: Build substitution list
// For each old file, we have: old path → new path
// We need to rewrite:
//   - In HTML: relative path like "_assets/framerusercontent_com_HASH_base.mjs" → "_modules/base.mjs"
//   - In .mjs files: relative path like "../_assets/framerusercontent_com_HASH_base.mjs" → "./base.mjs"
//   - In .mjs files: relative path like "./base.mjs" (unchanged if already correct basename)

console.log('\nStep 3: Rewriting references in HTML and .mjs files...');

const allFiles = [
  ...execSync(`find "${siteDir}" -maxdepth 1 -name "*.html"`, { encoding: 'utf-8' }).trim().split('\n').filter(Boolean),
  ...fs.readdirSync(modulesDir).filter(f => f.endsWith('.mjs')).map(f => path.join(modulesDir, f)),
];

let filesChanged = 0;
for (const filePath of allFiles) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf-8'); } catch { continue; }

  let changed = false;

  for (const [oldAbsPath, newAbsPath] of renameMap) {
    const oldRel = path.relative(path.dirname(filePath), oldAbsPath).replace(/\\/g, '/');
    const newRel = path.relative(path.dirname(filePath), newAbsPath).replace(/\\/g, '/');

    if (content.includes(oldRel)) {
      content = content.split(oldRel).join(newRel);
      changed = true;
    }
  }

  // Also fix bare relative imports within _modules/ files (e.g., "./framer.CKsSuJat.mjs" already correct)
  // but any "./_assets/..." references that crept in
  if (filePath.startsWith(modulesDir)) {
    // Fix relative paths that point up to _assets/ from within _modules/
    const reStr = /(['"])(\.\.\/_assets\/framerusercontent_com_[a-f0-9]+_([^'"]+))(['"])/g;
    if (reStr.test(content)) {
      content = content.replace(
        /(['"])\.\.\/_assets\/framerusercontent_com_[a-f0-9]+_([^'"]+)(['"])/g,
        (m, q1, basename, q2) => `${q1}./${basename}${q2}`
      );
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    filesChanged++;
    console.log(`  Updated: ${path.relative(siteDir, filePath)}`);
  }
}

// Step 4: Also rewrite in _modules/*.mjs: any remaining bare basename refs should be fine
// But check for any absolute CDN URL references that still exist
console.log('\nStep 4: Checking for remaining CDN refs in _modules/...');
let remaining = 0;
for (const f of fs.readdirSync(modulesDir).filter(f => f.endsWith('.mjs'))) {
  const content = fs.readFileSync(path.join(modulesDir, f), 'utf-8');
  const cdnRefs = (content.match(/https?:\/\/framerusercontent\.com[^\s"')`]*/g) || []).length;
  if (cdnRefs > 0) {
    console.log(`  ${f}: ${cdnRefs} CDN refs`);
    remaining += cdnRefs;
  }
}
if (remaining === 0) console.log('  ✓ None found');

// Step 5: Update project _headers for MIME types
console.log('\nStep 5: Checking _headers file...');
const headersPath = path.join(siteDir, '_headers');
let headers = '';
try { headers = fs.readFileSync(headersPath, 'utf-8'); } catch {}
if (!headers.includes('/_modules/')) {
  headers += `\n/_modules/*.mjs\n  Content-Type: application/javascript\n`;
  fs.writeFileSync(headersPath, headers);
  console.log('  Added /_modules/*.mjs Content-Type to _headers');
}

console.log(`\n✓ Done! ${filesChanged} files updated.`);
console.log(`\nNow test with: cd ${siteDir} && node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = {'html':'text/html','mjs':'application/javascript','js':'application/javascript','css':'text/css','png':'image/png','jpg':'image/jpeg','svg':'image/svg+xml','woff2':'font/woff2','gif':'image/gif','json':'application/json'};
http.createServer((req,res)=>{
  const f = path.join('${siteDir}', req.url.split('?')[0] || 'index.html');
  const file = fs.existsSync(f) && fs.statSync(f).isDirectory() ? f+'/index.html' : f;
  if(!fs.existsSync(file)){res.writeHead(404);res.end('not found');return;}
  const ext = file.split('.').pop();
  res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
}).listen(3002, ()=>console.log('http://localhost:3002'));
"`);
