# BenE Design System — design.md

> Single source for colour, type, spacing, radii, shadows, motion. Mirrors `app/globals.css` (`@theme` + `:root`). Components reference **semantic tokens**, never raw hex.
> Baseline reconstructed from `_input/BenE Design System.zip` (Claude-Design export of the current site) + Figma-confirmed corrections (2026-06-22). M5 scope: anchor-heavy on base tokens, evolve motion/layering/composition in the waves.

---

## Token-change policy (read first)

- **Values are cheap.** Changing a token *value* (a purple tick warmer, a shadow depth, a radius) = one line in `globals.css`, propagates to every page instantly. Fine to fine-tune anytime, including live against the real landing in W1.
- **Structure is the locked part.** The *scale*, *semantic naming*, and *dark-ready indirection* are what's expensive to change later. That's what M5 nails down.
- **The discipline that keeps it cheap:** components consume semantic tokens (`bg-primary`, `text-foreground`, `text-ink-muted`, `rounded-card`) — never hardcoded hex. Break that and the one-line-rollout promise breaks with it.

---

## Architecture

BenE brand is **married into the shadcn semantic token system** (`--primary`, `--background`, `--card`, `--foreground`, `--border`, `--muted`, `--accent`, `--ring`, sidebar, chart) so shadcn/ui components inherit the brand automatically. BenE-specific tokens (iceberg accents, big radii, purple shadows, type scale, motion, hero gradient) sit alongside.

**Dark mode:** light-first for iteration 1. The `.dark` block is scaffolded (so a toggle works structurally) but **provisional / untuned** — tune post-baseline. Architecture is dark-ready because everything routes through semantic vars.

---

## Colour

### Brand
| Token | Value | Role |
|---|---|---|
| `--bene-purple` / `--primary` | `#683BFF` | primary accent — headlines (on white), links, primary buttons, icon strokes, focus ring |
| `--bene-purple-hover` | `#5A2FE8` | hover |
| `--bene-purple-press` | `#4D26D0` | press |
| `--bene-purple-soft` | `rgba(104,59,255,0.08)` | accent surface / hover bg |
| `--bene-indigo-deep` / `--foreground` | `#130738` | primary ink (Figma truth) |
| `--bene-indigo-shadow` | `#0A15AB` | deep hero backdrop fill |

### Ink steps (text)
| Utility | Value | Use |
|---|---|---|
| `text-foreground` / `text-ink` | `#130738` | body, primary headings |
| `text-ink-muted` | indigo 70% | secondary copy |
| `text-ink-subtle` | indigo 40% | kickers, captions, muted labels |

### Iceberg accents — gradients + small accents, NOT primary surfaces
Golden-ratio discipline: limited, focused saturated bursts. These live as `bg-bene-*` / `text-bene-*` and feed gradients.
| Utility | Value |
|---|---|
| `bene-blue` | `#257AF2` |
| `bene-blue-light` | `#269DF2` |
| `bene-cyan` | `#02C1DB` |
| `bene-green` | `#0CD096` (Figma truth) |
| `bene-green-glow` | `#09DE9F` |

### Surfaces
| Token | Value | Role |
|---|---|---|
| `--background` | `#E6EDF2` | page bg — every major section sits on this |
| `--card` | `#FFFFFF` | content cards (on the section bg) |
| `--secondary` / `--muted` | `#EBEDF5` | cool neutral / inactive |
| `--border` | indigo 10% | hairlines (tags use a stronger 1.5px hairline locally) |

### Headline-colour convention (contextual — decided per layout, NOT a fixed token)
Type tokens are colour-agnostic. Headline colour depends on the background it sits on:
- **On white cards → purple accent** (`text-primary`) so it pops.
- **On the page background → indigo** (`text-foreground`).
Finalised per page in the waves once layout + background composition exist.

---

## Type — Outfit

Self-hosted variable font via `next/font/google` (build-time self-host → GDPR-clean, no runtime Google call). Full axis 100–900. Headlines Bold 700, body Regular 400, bold pulls for emphasis. Colour-agnostic scale:

| Utility | Size | Line-height | Notes |
|---|---|---|---|
| `text-display` | 80px | 1.0 | hero, -0.01em tracking |
| `text-h1` | 56px | 1.05 | -0.005em |
| `text-h2` | 36px | 1.2 | |
| `text-h3` | 30px | 1.2 | |
| `text-h4` | 22px | 1.25 | |
| `text-body-lg` | 22px | 1.5 | |
| `text-body` | 18px | 1.5 | default copy |
| `text-small` | 14px | 1.35 | kickers (often 40% ink) |
| `text-micro` | 12px | 1.35 | |

---

## Radii — rounding is a signature

Two regimes:
- **Small (shadcn UI primitives):** `--radius` = 8px base → `rounded-sm/md/lg/xl`. Buttons & inputs ≈ 8px.
- **Big (BenE signature):** `rounded-card` 24px · `rounded-shell` 40px · `rounded-section` 80px · `rounded-pill` 9999px.

Full source scale (reference): 8 · 16 · 24 · 32 · 40 · 64 · 80 · pill.

---

## Spacing

Maps onto the default Tailwind 4px scale — no custom tokens needed. The 10-step source scale → utilities:
`4→p-1 · 8→p-2 · 12→p-3 · 16→p-4 · 24→p-6 · 32→p-8 · 48→p-12 · 64→p-16 · 96→p-24 · 128→p-32`. Sections use generous vertical rhythm (96–128px).

---

## Shadows — purple-tinted, never grey

| Utility | Value | Use |
|---|---|---|
| `shadow-card` | `0 8px 32px -12px rgba(13,7,38,0.10)` | resting card |
| `shadow-lift` | `0 12px 48px -12px rgba(104,59,255,0.20)` | card hover (lift 2–4px) |
| `shadow-hero` | purple + green halo stack | hero portrait / key visual |

---

## Motion — explains or invites, never just impresses

Easings: `--ease-out` `cubic-bezier(0.22,1,0.36,1)` (default), `--ease-in`, `--ease-in-out`.
Durations: `--dur-fast` 150ms · `--dur-base` 240ms · `--dur-slow` 380ms.
Patterns: card lift, arrow slide (+4px), section reveal as 12px fade-up. No bounces, no spring wiggle. Calm and confident.

> Motion/layering/composition is where the system *evolves* (vs. the anchored base tokens). Reference analysis feeds this per wave: marco.fyi/.os (primary), briidge.app, agentur-consulting.de (glass nav, scroll-storytelling, mouse-reactive bg, 3D cards), jonahhalldesign.com (case-study depth × quick-grasp).

---

## Gradients

`--grad-hero` — indigo → purple → aurora-green radial stack + diagonal linear base. Hero backdrops / key visuals only.

---

## Components (primitives)

All reference semantic tokens. Buttons: primary (purple fill, white text, soft purple glow) · secondary (outline; on-dark = white outline, on-light = indigo outline) · tertiary (text-only purple). Card: white, `rounded-card`, `shadow-card`, lift on hover. Tag: pill, 1.5px hairline. Icon-ring: 48px circle, 1.5px purple stroke. Lucide via `lucide-react` (already in deps) as the icon set.

---

## Not carried over from the export

The Claude-Design export's **voice / positioning / content fundamentals** ("Seasoned Design Chameleon", "I take products & brands to the next level", "my Clients") are **superseded by M2** (Product anchor / Brand USP / AI cherry, Senior PD). Voice lives in the content waves + `professional-voice.md`, not here. This doc is the *visual* system only.
