# Portfolio Website 2026

`ben-e.me` — Next.js App Router greenfield overhaul. Lead designer and sole developer: Beni.

## Stack

- Next.js 15 App Router · TypeScript · Tailwind CSS v4 · shadcn/ui
- Cloudflare Pages (deployment) · GitHub Actions (CI/CD)
- Framer Motion / Motion One (animation, Phase B)

## Architecture

### Legacy Layer (temporary, Phase A)

`app/(legacy)/[route]/page.tsx` files embed old Framer HTML via full-viewport iframes.
Static files live in `public/legacy/`. As each page is rebuilt, the `(legacy)` file is deleted and the real route takes over.

### Phase B Routes (new builds, Wave-by-Wave)

`app/page.tsx` → root (W1)
`app/about/page.tsx` → (W2), etc.

### Design System

`MASTER.md` (created in M5) is the single source for colors, type, spacing, tokens.
Tailwind config reflects those tokens. shadcn/ui components extend them.

## Conventions

- Commits: `feat:` · `fix:` · `chore:` · `ci:` · `design:`
- Branch per page: `feature/<page>-overhaul`
- PR → Cloudflare Branch Preview → review → merge = live
- `RELEASES.md` entry per page release (date, page, change, expected KPI effect)
- No README needed — IMPLEMENTATION_PLAN.md is the source of truth

## Key Files

- `IMPLEMENTATION_PLAN.md` — milestone + wave status
- `MASTER.md` — design system (created M5)
- `RELEASES.md` — release log (created W1)
- `public/legacy/` — Framer static HTML + assets (temporary)

## Lighthouse CI Gates (enforced per PR)

Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 95 · SEO ≥ 95

## Tracking (live from M0)

Cloudflare Web Analytics + Microsoft Clarity (5 custom events: CV-Download, Case-Tiefenklick, Contact-Click, Portfolio-PDF-Click, Scroll-Depth >75%)
