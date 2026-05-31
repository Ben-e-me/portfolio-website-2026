# Implementation Plan — Portfolio Website 2026

> Master Plan: `../project files/master-plan.md`
> Time horizon: ~4–8 weeks part-time
> Current status: **M1 next** (after Hotfix 2026-05-31)

---

## Phase A — Foundation (sequential)

| Milestone | Status | Notes |
|---|---|---|
| **M0** Setup & Fallback | **done** 2026-05-28 | Static export, Cloudflare Pages + DNS, CF Analytics + Clarity live. ⚠️ Original iframe layer broke URL behavior + Framer SPA — replaced 2026-05-31 (see Hotfix below). |
| **Hotfix** Legacy-to-Root | **done** 2026-05-31 | Framer HTMLs moved from `public/legacy/` to `public/` root, iframe wrappers deleted, Clarity inline-injected into Framer HTMLs (PRs #1, #2). |
| **M1** Research | pending | 8–12 competitor sites via Claude in Chrome MCP. 1 subagent per site. |
| **M2** Audience & Positioning | pending | 4 parallel positioning subagents (Defender / Conservative / Bold / Synthesizer). |
| **M3** Status-Quo Assessment | pending | 4-POV review per page (Recruiter / Founder / Freelance-Lead / Design-Leader). |
| **M4-HL** Content & IA High-Level | pending | Sitemap, page-brief logic, layer concept. |
| **M5** Design System | pending | MASTER.md via UI/UX Pro Max. Tailwind tokens. Figma decision. |
| **M6-T** Concept Design Templates | pending | Pencil.dev for 2 hero page archetypes. 4-POV review. |

---

## Phase B — Wave Iteration (per page)

| Wave | Page | Branch | Status |
|---|---|---|---|
| W1 | Index / Landing | `feature/index-overhaul` | pending |
| W2 | About | `feature/about-overhaul` | pending |
| W3 | Portfolio Index | `feature/portfolio-overhaul` | pending |
| W4 | SafetyWing Case (new) | `feature/cs-safetywing-overhaul` | pending |
| W5 | Cara Care Case | `feature/cs-caracare-overhaul` | pending |
| W6 | Zack.ai Case | `feature/cs-zack-overhaul` | pending |
| W7 | Wefox Case | `feature/cs-wefox-overhaul` | pending |
| W8 | Contact | `feature/contact-overhaul` | pending |
| W9 | Legal (Imprint / Privacy / TOS) | `feature/legal-overhaul` | pending |

### Wave-Cutover Convention (post-Hotfix)
Each Wave PR is atomic: **delete** the corresponding `public/<page>.html` AND **add** the new `app/<page>/page.tsx` (+ components) in one commit. Cloudflare Pages' static-file precedence makes the switchover instant — as long as the Framer HTML exists at root, it wins; the moment it's gone, Next.js takes over. The inline Clarity snippet in that HTML is also removed; tracking continues via `app/layout.tsx`.

After W9: cleanup pass — delete any `_assets/`, `_modules/`, `safari-fixes.css` files no longer referenced by remaining Framer pages.

---

## M9 — Polish & Wrap (post all waves)

- `/ultrareview` multi-agent final review
- A11y sweep (WCAG AA full pass)
- Performance audit
- `/design-system` public page
- KPI review (Cloudflare + Clarity, 2-week baseline)
- Workflow retrospective → skill updates
- Re-tighten Lighthouse CI gates from `warn` to `error` (was relaxed during Framer phase)

---

## M0 Checklist

- [x] Old repo tagged `framer-baseline-2026`
- [x] New repo `Ben-e-me/portfolio-website-2026` created
- [x] Next.js App Router + shadcn/ui + Tailwind + TypeScript scaffolded
- [x] Legacy Layer: Framer HTML → `public/legacy/`, 11 pages in `app/(legacy)/` *(replaced by Hotfix — see below)*
- [x] CLAUDE.md + IMPLEMENTATION_PLAN.md
- [x] GitHub Actions Lighthouse CI skeleton
- [x] Cloudflare Pages Project connected + DNS `ben-e.me` switched
- [x] Cloudflare Web Analytics activated (Token: `ec3112e86b694a0caad3132122a0514`) — **0 pageviews in 21d, AdBlocker-blocked, kept dormant**
- [x] Microsoft Clarity activated (Project ID: `wy3zkc51c4`)
- [ ] `_inputs/` populated with Beni's prior Claude-Design outputs
- [x] Initial commit + push to `main`

---

## Hotfix Checklist (2026-05-31)

- [x] Diagnosed root cause: iframe wrappers broke URL behavior + Framer SPA constructed `/_assets/...` URLs without subpath → 404s after click navigation
- [x] Confirmed via live Clarity baseline (10 sessions, 30% dead clicks, 1 page/session avg)
- [x] PR #1 `fix/legacy-to-root`: moved Framer HTMLs + `_assets/` + `_modules/` + `safari-fixes.css` from `public/legacy/` to `public/` root
- [x] PR #1: deleted `app/page.tsx` + all `app/(legacy)/*/page.tsx` + useless `public/legacy/_headers`
- [x] PR #1: moved dev-helper scrape scripts to repo-root `scripts/legacy/`
- [x] PR #1: relaxed Lighthouse CI gates from `error` to `warn` for transitional phase, fixed `staticDistDir` from `.next` to `out`
- [x] PR #2 `chore/inline-clarity-tracking`: injected Clarity snippet inline before `</body>` in all 11 Framer HTMLs (since Next layout no longer renders for these routes)
- [x] Verified live `ben-e.me`: no iframe, all images load, click navigation updates URL, reload preserves page
- [x] Baseline snapshot saved: `../research/baseline-pre-fix-2026-05-31/cloudflare-snapshot.md`

### Hotfix follow-ups for next session
- [ ] Update `master-plan.md` with the Hotfix learning + revised Pre-Flight checklist for Wave-cutover
- [ ] Add Wave-Cutover Pre-Flight checklist to `CLAUDE.md`: click-flow test, direct-URL + reload test, asset-404 audit, extensions-on test, before-merge Lighthouse manual check
