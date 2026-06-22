# Implementation Plan — Portfolio Website 2026

> Master Plan: `../project files/master-plan.md`
> Time horizon: ~4–8 weeks part-time
> Current status: **M4-HL done (2026-06-22)** · quickfix dev-sprint → M5 next
> Approach (2026-06-22): **Option C + 80/20.** Foundation-Prozess wie geplant, aber jedes Milestone als "good enough für Iteration 1" gescoped — live bei W1 lernen, Learnings in Folge-Schleifen einarbeiten.

---

## Working Principle — 80/20 Milestone Scoping

Vor jeder Milestone-Session: kurze Scoping-Abstimmung. Claude schlägt proaktiv einen 80/20-Cut vor, der
- **lockt jetzt** nur die global gekoppelten, schwer reversiblen Decisions (URLs/Sitemap, Nav, Titel/SEO, Wave-Reihenfolge),
- **defert** alles iterierbare (Per-Page-Content, Detail-Mechaniken) in den jeweiligen Wave-Brief,
- **nimmt Shortcuts** da, wo Beni (Design: Hierarchie, Komposition, live in der Wave) oder Claude (Code: Next.js-Refactors von Nav/Routing sind billig) sie später günstig abfangen.

Ziel: aus dem Research-Heavy-Teil raus, schnell eine Live-Baseline, dann datengetrieben verfeinern.

---

## Phase A — Foundation (sequential)

| Milestone | Status | Notes |
|---|---|---|
| **M0** Setup & Fallback | **done** 2026-05-28 | Static export, Cloudflare Pages + DNS, CF Analytics + Clarity live. ⚠️ Original iframe layer broke URL behavior + Framer SPA — replaced 2026-05-31 (see Hotfix below). |
| **Hotfix** Legacy-to-Root | **done** 2026-05-31 | Framer HTMLs moved from `public/legacy/` to `public/` root, iframe wrappers deleted, Clarity inline-injected into Framer HTMLs (PRs #1, #2). |
| **M1** Research | **done** 2026-05-31 | 24 sites (18 Beni + 6 new). Beni-selected references: marco.fyi ⭐⭐, benshih.design ⭐. Outputs: `research/competitors.md` + `knowledge/projects/professional/portfolio-website/research-insights.md`. |
| **M2** Audience & Positioning | **done** 2026-05-31 | 4-perspective sparring (inline) + Beni alignment. Synthesis: Product anchor / Brand USP / AI cherry. 3-URL audience model (landing-only). Trust-via-coherence = business anchor. Output: `strategy.md`. Final wording deferred to messaging iteration. |
| **M3** Status-Quo Assessment | **done** 2026-06-02 | Scope erweitert auf **alle 8 existierenden Seiten deep** (Beni-Entscheidung), gescort durch 4-POV-Audience-Raster (Recruiter+Design-Lead primär). Output: `research/assessment.md` (Raster → 8 Seiten-Assessments → Case-Roster + Inventar → Wefox-Teaser → M3-Synthese). Key: Sitemap-Move (About slimmt + neue Approach/Behind-the-Build-Page), Case-Roster 4→3, Titel-Vereinheitlichung, Quick-Read-Layer als Hebel, GDPR-Fix. |
| **M4-HL** Content & IA High-Level | **done** 2026-06-22 | Output: `../content/sitemap.md`. Locked: Sitemap+URLs · Nav (Home→Approach/AI→About→Cases) · Titel-Architektur (Need-USP-H1 + "Senior" als ATS-Tag in Subline/meta; empirisch via Competitor-Check) · 3-URL-Audience-Model · Landing Source-of-Truth (6 Sektionen) · Per-Page-Spines · Brief-Template. Capability=Teaser, Roster 3, Philosophy re-destilliert, `/build` routet auf Approach. GDPR: no banner, Clarity removed. Tentativer W2↔W3-Swap. Finale Copy → W1. |
| **M5** Design System | **next** | **Starts with `_input/` intake → design.md baseline** (styleguide, DS zip, inspiration + M1/M2 insights: Iceberg palette, type, spacing, tokens, marco.fyi card hover), THEN sharpen tokens against the real landing. Tailwind theme. Figma decision. ⚑ **Additional reference to analyze before/during M5:** [briidge.app](https://www.briidge.app/) — layout + design approach, spotted 2026-06-01. Interview Beni on what works/doesn't, or do a dedicated analysis. |
| **M6-T** Concept Design Templates | pending | Pencil.dev for 2 hero page archetypes. 4-POV review. |

---

## Phase B — Wave Iteration (per page)

> **Revised post-M3 (2026-06-02).** Roster 4→3 Cases; SafetyWing + Wefox als Cases gedroppt (Wefox → Teaser-Card in Portfolio, kein Detail); NEUE Approach/Behind-the-Build-Page (Philosophy + Workflow + Services-Essenz + AI). Exakte Wave-Reihenfolge (v.a. Approach-Page-Platzierung) wird in M4-HL final bestätigt.

| Wave | Page | Branch | Status |
|---|---|---|---|
| W1 | Index / Landing | `feature/index-overhaul` | pending |
| W2 | About (slimmed: Hero → Career + Clients → Backstory → CTA) | `feature/about-overhaul` | pending |
| W3 | **Approach / Behind the Build** (NEU — Philosophy + Workflow + Services-Essenz + AI-Proof / `/build`) | `feature/approach-overhaul` | pending |
| W4 | Portfolio Index (+ Wefox-Teaser-Card, kein Detail) | `feature/portfolio-overhaul` | pending |
| W5 | Case: Cara Care | `feature/cs-caracare-overhaul` | pending |
| W6 | Case: SUMO Family | `feature/cs-sumo-overhaul` | pending |
| W7 | Case: Zack.ai | `feature/cs-zack-overhaul` | pending |
| W8 | Contact | `feature/contact-overhaul` | pending |
| W9 | Legal (Imprint / Privacy / ToS) | `feature/legal-overhaul` | pending |

**Dropped als Cases:** SafetyWing (Trust-Risiko: Live-Design ersetzt + Prozess-Albtraum) · Wefox als Detail-Case (→ Teaser-Card für Founder/Interim-Schiene). BA-Thesis raus.

### Wave-Cutover Convention (post-Hotfix)
Each Wave PR is atomic: **delete** the corresponding `public/<page>.html` AND **add** the new `app/<page>/page.tsx` (+ components) in one commit. Cloudflare Pages' static-file precedence makes the switchover instant — as long as the Framer HTML exists at root, it wins; the moment it's gone, Next.js takes over. The inline Clarity snippet in that HTML is also removed; tracking continues via `app/layout.tsx`.

Before merging: run the **Wave-Cutover Pre-Flight** checklist in `CLAUDE.md` against the CF Branch Preview.

After W9: cleanup pass — delete any `_assets/`, `_modules/`, `safari-fixes.css` files no longer referenced by remaining Framer pages.

---

---

## Pending Resources (2026-06-09) — einordnen bei M4-HL Session-Start

### "9 Fixes That Will Change Your Portfolio Forever" (LinkedIn-Snippet)

| # | Fix | Relevanz für ben-e.me | Status |
|---|---|---|---|
| 1 | Keywords im Hero (B2B/B2C/0→1/Healthcare/Fintech) | ✅ Passt zu Layer 1 (Senior PD Anchor) — Domain-Keywords in Hero-Subline? | → M4-HL |
| 2 | Perfect first frame — nothing cut off | ✅ Direkt: M3-Finding "Hero needs tight first viewport" | → W1 |
| 3 | Case Studies zuerst in Nav | ⚡ Contra aktuelle Nav-Reihenfolge — Diskussion: Work / About / Approach? | → M4-HL |
| 4 | Clean research visuals only (no sticky notes/workshops) | ✅ M3-Finding: Case-Visuals cleanen; SUMO/Zack-Verbesserungen | → W5–W7 |
| 5 | One insight per visual | ✅ Kern des Quick-Read-Layers (Research Insight #1) | → M4-HL |
| 6 | Reverse storytelling: Context → Impact → Approach | ⚡ Direkt relevant für Case-Struktur — M3 offener Punkt | → M4-HL |
| 7 | Impact highlighten — can't scroll past | ✅ Outcome-Box WOW-Factor (M3 Cara Care Finding) | → W5 |
| 8 | Reflections at the end | ✅ Offen in M3 (kein Case hat Reflections bisher) | → W5–W7 |
| 9 | Copy-able email button | 🟡 Quick-Win — Contact-Page + möglicherweise CTA-Bereich | → W8 |

### Inspiration-Sites — Next Iteration (PARKED)

> ⏸ **Framing (2026-06-22):** Diese Sites bleiben bewusst **unangefasst bis die erste neue Iteration der wichtigsten Pages (Landing + ggf. AI-Page) released ist.** Sie sind Material für die **zweite Iterationsstufe** (Verfeinern, nicht Erst-Bau) — nicht in M4-HL/W1 reinmischen, sonst Scope-Creep. Erst nach Baseline-Release wieder rausholen.

| Site | Beni's Note | Was könnte nützlich sein |
|---|---|---|
| [hrtln.de](https://www.hrtln.de/) | Leadership-fokussiert, gute Typo, visuell bland | Typo-Ansatz, Leadership-Framing für About/Approach |
| [carmen-elena.space](https://www.carmen-elena.space/) | UI-heavy/too much, aber interessante Details | Process-Visualisierung, animated signature on About, Experience-Dropdowns, Case-Detail-Struktur |
| [trevornielsen.com](https://www.trevornielsen.com/) | Freelance, minimalistic "ways I can help" intro | Actionable Intro-Format, minimale Work-Samples-Präsentation |
| [agentur-consulting.de](https://agentur-consulting.de/) | Design-Inspiration (2026-06-22) | Layout-/Visual-Ansatz — bei Next-Iteration analysieren |

> LinkedIn-Präsenz aller Kandidaten → später Comparison-Point für Marketing-Phase (post-launch).

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
- [x] Update `master-plan.md` with the Hotfix learning + revised Pre-Flight checklist for Wave-cutover
- [x] Add Wave-Cutover Pre-Flight checklist to `CLAUDE.md`
