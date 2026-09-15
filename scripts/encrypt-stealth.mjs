#!/usr/bin/env node
// Encrypts a private HTML page into a password-gated static page.
// Only ciphertext is written to the repo; the plaintext source stays outside it.
//
// Usage: STEALTH_PASSWORD=... node scripts/encrypt-stealth.mjs <source.html> <out-dir>

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";
import path from "node:path";

const [, , source, outDir] = process.argv;
const password = process.env.STEALTH_PASSWORD;
if (!source || !outDir || !password) {
  console.error("Usage: STEALTH_PASSWORD=... node scripts/encrypt-stealth.mjs <source.html> <out-dir>");
  process.exit(1);
}

const ITERATIONS = 600000;
const plaintext = await readFile(source, "utf8");
const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

// Password is normalised to upper case so entry is case-insensitive.
const baseKey = await crypto.subtle.importKey("raw", enc.encode(password.trim().toUpperCase()), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
  baseKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt"]
);
const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext)));
const b64 = (u8) => Buffer.from(u8).toString("base64");

const page = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>Vertraulich</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body { margin: 0; font-family: "Outfit", ui-sans-serif, system-ui, -apple-system, sans-serif; color: #fff; -webkit-font-smoothing: antialiased;
    background: radial-gradient(ellipse 46% 58% at 100% 0%, #3494c6 0%, rgba(80,115,235,0.5) 48%, transparent 72%),
      radial-gradient(ellipse 60% 45% at 45% 110%, rgba(24,170,150,0.8) 0%, transparent 70%),
      radial-gradient(ellipse 60% 60% at 30% 55%, #321a85 0%, rgba(50,26,133,0.6) 50%, transparent 75%),
      linear-gradient(120deg, #6a3cff 0%, #5f35ea 50%, #6a3cff 100%);
    display: grid; place-items: center; padding: 24px; }
  form { width: 100%; max-width: 400px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.24); border-radius: 28px; padding: 36px 32px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
  .kicker { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin: 0 0 10px; }
  h1 { font-size: 28px; line-height: 1.15; margin: 0 0 22px; }
  label { display: block; font-size: 14px; color: rgba(255,255,255,0.8); margin-bottom: 8px; }
  input { width: 100%; font: inherit; font-size: 17px; color: #130738; background: #fff; border: 0; border-radius: 14px; padding: 13px 16px; outline: none; }
  input:focus-visible { box-shadow: 0 0 0 3px rgba(185,255,240,0.9); }
  button { margin-top: 14px; width: 100%; font: inherit; font-size: 16px; font-weight: 600; color: #fff; background: #130738; border: 0; border-radius: 14px; padding: 13px 16px; cursor: pointer; }
  button:hover { background: #22105c; }
  button:disabled { opacity: 0.7; cursor: progress; }
  .err { min-height: 22px; margin: 12px 0 0; font-size: 14px; color: #ffd9d9; }
</style>
</head>
<body>
<form id="gate" autocomplete="off">
  <p class="kicker">Vertraulich</p>
  <h1>Bitte Passwort eingeben</h1>
  <label for="pw">Passwort</label>
  <input id="pw" name="pw" type="password" required autofocus>
  <button type="submit" id="go">Öffnen</button>
  <p class="err" id="err" role="alert" aria-live="polite"></p>
</form>
<script>
(function () {
  var DATA = { salt: "${b64(salt)}", iv: "${b64(iv)}", ct: "${b64(cipher)}", it: ${ITERATIONS} };
  var KEY = "stealth-pw";
  function u8(b) { var s = atob(b), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  async function decrypt(pw) {
    var base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw.trim().toUpperCase()), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: u8(DATA.salt), iterations: DATA.it, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    var plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: u8(DATA.iv) }, key, u8(DATA.ct));
    return new TextDecoder().decode(plain);
  }
  function show(html) { document.open(); document.write(html); document.close(); }
  var form = document.getElementById("gate"), input = document.getElementById("pw"), btn = document.getElementById("go"), err = document.getElementById("err");
  try { var saved = sessionStorage.getItem(KEY); if (saved) { decrypt(saved).then(show).catch(function () { sessionStorage.removeItem(KEY); }); } } catch (e) {}
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    btn.disabled = true; err.textContent = "";
    decrypt(input.value).then(function (html) {
      try { sessionStorage.setItem(KEY, input.value); } catch (e) {}
      show(html);
    }).catch(function () {
      btn.disabled = false; err.textContent = "Passwort nicht korrekt."; input.select();
    });
  });
})();
</script>
<!-- Cloudflare Web Analytics (cookieless), same site token as app/layout.tsx -->
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "ec3112e86b694a0caad3132122a0514"}'></script>
</body>
</html>
`;

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "index.html"), page);
console.log(`Encrypted ${path.basename(source)} -> ${path.join(outDir, "index.html")} (${cipher.length} bytes ciphertext)`);
