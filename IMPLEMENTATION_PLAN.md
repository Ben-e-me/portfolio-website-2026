# Implementation Plan — Portfolio Website 2026

> Master Plan: `../project files/master-plan.md`
> Time horizon: ~4–8 weeks part-time
> Current status: **M0 in progress**

---

## Phase A — Foundation (sequential)

| Milestone | Status | Notes |
|---|---|---|
| **M0** Setup & Fallback | in progress | Old repo tagged `framer-baseline-2026`. New repo + Next.js scaffold + Legacy Layer done. Cloudflare + Tracking pending. |
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

---

## M9 — Polish & Wrap (post all waves)

- `/ultrareview` multi-agent final review
- A11y sweep (WCAG AA full pass)
- Performance audit
- `/design-system` public page
- KPI review (Cloudflare + Clarity, 2-week baseline)
- Workflow retrospective → skill updates

---

## M0 Checklist

- [x] Old repo tagged `framer-baseline-2026`
- [x] New repo `Ben-e-me/portfolio-website-2026` created
- [x] Next.js App Router + shadcn/ui + Tailwind + TypeScript scaffolded
- [x] Legacy Layer: Framer HTML → `public/legacy/`, 11 pages in `app/(legacy)/`
- [x] CLAUDE.md + IMPLEMENTATION_PLAN.md
- [x] GitHub Actions Lighthouse CI skeleton
- [ ] Cloudflare Pages Project connected + DNS `ben-e.me` switched
- [ ] Cloudflare Web Analytics activated
- [ ] Microsoft Clarity activated
- [ ] `_inputs/` populated with Beni's prior Claude-Design outputs
- [ ] Initial commit + push to `main`
