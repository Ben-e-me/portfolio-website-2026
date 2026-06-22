# Portfolio Website 2026

`ben-e.me` — Next.js App Router greenfield overhaul. Lead designer and sole developer: Beni.

## Stack

- Next.js 15 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui
- Cloudflare Pages (deployment) · GitHub Actions (CI/CD)
- Framer Motion / Motion One (animation, Phase B)

## Architecture

### Legacy Layer (temporary, Phase A)

Framer HTML files live at `public/<page>.html` (root). Cloudflare static-file precedence means they serve directly — no `app/` wrapper. Clarity snippet is inlined before `</body>` in each.

Wave-Cutover: delete `public/<page>.html` in the same PR that adds `app/<page>/page.tsx`. Static file gone → Next.js route takes over instantly. Delete `_assets/` + `_modules/` entries only when the last Framer page referencing them is removed.

### Phase B Routes (new builds, Wave-by-Wave)

`app/page.tsx` → root (W1)
`app/about/page.tsx` → (W2), etc.

### Design System

`design.md` (created in M5) is the single source for colors, type, spacing, tokens.
Tailwind config reflects those tokens. shadcn/ui components extend them.

## Conventions

- Commits: `feat:` · `fix:` · `chore:` · `ci:` · `design:`
- Branch per page: `feature/<page>-overhaul`
- PR → Cloudflare Branch Preview → review → merge = live
- `RELEASES.md` entry per page release (date, page, change, expected KPI effect)
- No README needed — IMPLEMENTATION_PLAN.md is the source of truth

## Wave-Cutover Pre-Flight

Run in Cloudflare Branch Preview before merging any Wave PR:

- [ ] Click every nav link → URL updates, no full reload
- [ ] Direct-URL load + reload → correct page, no 404
- [ ] DevTools Network → no 404s for images / fonts / assets
- [ ] Test with extensions enabled (AdBlocker on) → layout intact
- [ ] Lighthouse in incognito → perf ≥90, a11y/seo/bp ≥95 (warn mode during transitional phase)

## Key Files

- `IMPLEMENTATION_PLAN.md` — milestone + wave status
- `design.md` — design system (created M5)
- `RELEASES.md` — release log (created W1)

## Lighthouse CI Gates (enforced per PR)

Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 95 · SEO ≥ 95

## Tracking

Cloudflare Web Analytics (cookieless, no banner). **Microsoft Clarity removed 2026-06-22** (GDPR: no cookie banner) — to be run later only in consciously-gated research-sprints. The 5 custom events (CV-Download, Case-Tiefenklick, Contact-Click, Portfolio-PDF-Click, Scroll-Depth >75%) are deferred with Clarity.
