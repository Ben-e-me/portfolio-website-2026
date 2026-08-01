"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotGrid, DotGridTuner, DOT_GRID_DEFAULTS, type DotGridConfig } from "@/components/dot-grid";
import { useSlidingUnderline, UnderlineBar } from "@/components/sliding-underline";
import { COPY_VARIANTS } from "@/components/copy-variants";

/* Values read off the Figma artboard "Landing / Home" (117:82) via figma-cli.
   Design width 1200, content column 1136, hero auto-layout pad 64/0/40/80. */

const NAV = [
  { label: "Home", href: "#" },
  { label: "Portfolio", href: "#work" },
  { label: "AI", href: "#ai" },
];

const STATS = [
  { value: "20", quant: "yrs", label: "Design Experience" },
  { value: "2", quant: "", label: "Degrees" },
  { value: "20", quant: "+", label: "Clients" },
  { value: "60", quant: "+", label: "Projects" },
];

const CLIENTS = [
  "Sparkasse", "Teufel", "AOK", "Dominos", "SonyMusic", "ERGO",
  "Payback", "BerlinChemie", "CaraCare", "DojoMadness", "Wefox",
];

const AUDIENCES = [
  { key: "recruiters", label: "For Recruiters" },
  { key: "businesses", label: "For Businesses" },
] as const;

/* Panel overlap: how far the trust panel pokes into the first viewport. */
const PANEL_PEEK = 120;

/* Fade a hero element out as the panel edge approaches it: full opacity while
   the panel top is still 40px below the element, gone by 20px. */
function useScrollFade() {
  const panelRef = useRef<HTMLDivElement>(null);
  const items = useRef<HTMLElement[]>([]);

  const register = useCallback((el: HTMLElement | null) => {
    if (el && !items.current.includes(el)) items.current.push(el);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const panel = panelRef.current;
      if (!panel) return;
      const panelTop = panel.getBoundingClientRect().top;
      for (const el of items.current) {
        const t = el.getBoundingClientRect().top;
        const gap = panelTop - t;
        const o = Math.min(1, Math.max(0, (gap - 20) / 20));
        el.style.opacity = String(o);
        el.style.visibility = o === 0 ? "hidden" : "visible";
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { panelRef, register };
}

export function HeroV2() {
  const [config, setConfig] = useState<DotGridConfig>(DOT_GRID_DEFAULTS);
  const [tuning, setTuning] = useState(false);
  const [audience, setAudience] = useState(0);
  const [variant, setVariant] = useState(0);
  const [showSwitch, setShowSwitch] = useState(true);

  const nav = useSlidingUnderline<HTMLElement>(0);
  const aud = useSlidingUnderline<HTMLDivElement>(audience);
  const { panelRef, register } = useScrollFade();

  useEffect(() => {
    setTuning(new URLSearchParams(window.location.search).has("tune"));
  }, []);

  const copy = COPY_VARIANTS[variant];
  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

  const renderSubline = () => {
    const { text, bold } = copy.subline;
    const parts = text.split(new RegExp(`(${bold.map(escapeRe).join("|")})`, "g"));
    return parts.map((p, i) =>
      bold.includes(p) ? (
        <strong key={i} className="font-semibold">{p}</strong>
      ) : (
        <span key={i}>{p}</span>
      ),
    );
  };

  return (
    <>
      <section className="sticky top-0 h-svh overflow-hidden text-white">
        <div className="absolute inset-0" style={{ background: "var(--grad-hero)" }} />
        <DotGrid config={config} />

        {/* Accents live in the 1200 container, not the full-bleed layer, so they
            stay behind the elements they belong to on any viewport width. */}
        <div className="pointer-events-none absolute inset-0 flex justify-center">
          <div className="relative w-full max-w-[1200px] px-8">
            {/* behind the LinkedIn tile, nudged up and right of its centre */}
            <div
              className="absolute right-[-6%] top-[-14%] h-[54vh] w-[42%]"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(12,208,150,0.85) 0%, rgba(12,208,150,0.34) 45%, transparent 78%)",
              }}
            />
            {/* behind the competence row, sized to it */}
            <div
              className="absolute bottom-[calc(120px-6vh)] left-20 h-[26vh] w-[440px] max-w-[46%]"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(9,222,159,0.93) 0%, rgba(9,222,159,0.4) 48%, transparent 80%)",
              }}
            />
          </div>
        </div>

        {/* Portrait — height is coupled to the viewport so the hair keeps the
            same 64px gap to the nav that the audience selector has. */}
        <div
          className="pointer-events-none absolute inset-x-0 hidden justify-center lg:flex"
          style={{ top: `${32 + 66 + 64}px`, bottom: `${PANEL_PEEK}px` }}
        >
          <div className="flex w-full max-w-[1200px] items-stretch justify-end px-8">
            {/* Figma crops the 802x582 source into a 407x483 frame; mirror that
                ratio and crop rather than letterboxing the landscape PNG. */}
            {/* Height tracks the viewport; width is capped at the Figma frame so
                the portrait can never cross into the 626px copy column. */}
            <div className="h-full w-[clamp(260px,32%,420px)] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/portrait.png"
                alt="Benjamin Erxleben"
                className="h-full w-full select-none object-cover object-top"
              />
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col px-8 pt-8">
          <header
            className="relative flex h-[66px] shrink-0 items-center justify-between rounded-[16px] border border-white/20 px-[17px] backdrop-blur-[50px]"
            style={{
              background: "rgba(19, 7, 56, 0.10)",
              boxShadow: "0 0 24px rgba(19, 7, 56, 0.20)",
            }}
          >
            <a href="#" className={`flex items-center gap-[18px] pl-0.5 ${focus}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" aria-hidden className="h-8 w-[46px] brightness-0 invert" />
              <span className="hidden flex-col gap-1.5 leading-none sm:flex">
                <span className="text-[17px] font-medium leading-none">Benjamin Erxleben</span>
                <span className="text-[16px] font-normal leading-none text-white/50">
                  Senior Product Designer
                </span>
              </span>
            </a>

            <nav
              ref={nav.trackRef}
              className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 pb-2 md:flex"
            >
              {NAV.map((item, i) => (
                <a
                  key={item.label}
                  data-underline-item
                  href={item.href}
                  className={`text-[18px] uppercase leading-none tracking-[0.16em] transition-colors ${focus} ${
                    i === 0 ? "text-white" : "text-white/35 hover:text-white/70"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <UnderlineBar bar={nav.bar} />
            </nav>

            <a
              href="https://www.linkedin.com/in/benjaminerxleben/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className={`shrink-0 transition-transform duration-200 hover:scale-110 active:scale-95 ${focus}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo_linked-in.svg" alt="" aria-hidden className="h-8 w-8" />
            </a>
          </header>

          <div className="flex min-h-0 flex-1 flex-col justify-between pb-[160px] pt-16 lg:pl-20">
            {/* Audience selector — same sliding rule, no separator dot */}
            <div ref={register} className="shrink-0">
            <div
              ref={aud.trackRef}
              className="relative flex w-fit items-center gap-8 pb-2 text-[20px] leading-none"
            >
              {AUDIENCES.map((a, i) => (
                <button
                  key={a.key}
                  data-underline-item
                  type="button"
                  onClick={() => setAudience(i)}
                  aria-pressed={audience === i}
                  className={`transition-colors ${focus} ${
                    audience === i ? "text-white" : "text-white/35 hover:text-white/70"
                  }`}
                >
                  {a.label}
                </button>
              ))}
              <UnderlineBar bar={aud.bar} />
            </div>
            </div>

            <div className="flex max-w-[626px] flex-col gap-10">
              {/* Darkener is bound to the copy box itself, so it covers the text
                  at any viewport ratio instead of being squeezed on mobile. */}
              <div className="relative flex flex-col gap-8" ref={register}>
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-[18%] -inset-y-[42%] -z-10"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(19,7,56,0.6) 0%, rgba(19,7,56,0.36) 52%, transparent 82%)",
                  }}
                />
                <h1 className="flex items-center gap-1.5 text-[clamp(2.25rem,4.6vw,3.5rem)] font-medium leading-none tracking-[-0.01em] text-white/[0.45] text-balance">
                  {copy.headline.lead}
                  {copy.headline.arrow && (
                    <svg viewBox="0 0 23 22" fill="none" className="h-[0.4em] w-auto shrink-0" aria-hidden>
                      <path
                        d="M1 11h20M13 3l8 8-8 8"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {copy.headline.arrow && <span className="sr-only">to</span>}
                  {copy.headline.rest}
                </h1>

                <p className="text-[clamp(1.0625rem,1.7vw,1.5rem)] leading-[1.4]">
                  {renderSubline()}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4" ref={register}>
                {/* Primary — Figma "Frame 7": purple + 70% green radial */}
                <a
                  href="#cv"
                  className={`group relative inline-flex h-[46px] items-center gap-3 overflow-hidden rounded-[8px] bg-bene-purple px-5 text-[20px] font-medium text-white transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#5a2fe8] active:translate-y-0 active:bg-[#4d26d0] ${focus}`}
                  style={{ boxShadow: "0 8px 50px rgba(19, 7, 56, 0.20)" }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      opacity: 0.85,
                      background:
                        "radial-gradient(100% 120% at 100% 133%, rgba(12,208,150,0.7) 0%, rgba(12,208,150,0) 100%)",
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/Icon_Download_Page.svg" alt="" aria-hidden className="relative h-5 w-auto brightness-0 invert" />
                  <span className="relative">
                    {audience === 0 ? "Download CV" : "See the work"}
                  </span>
                </a>

                {/* Secondary — Figma "Frame 4": white @1%, 1.5px stroke, background blur 14 */}
                <a
                  href="#contact"
                  className={`group relative inline-flex h-[46px] items-center gap-2.5 overflow-hidden rounded-[8px] border-[1.5px] border-white bg-white/[0.01] px-5 text-[20px] font-medium text-white backdrop-blur-[14px] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0 active:bg-white/25 ${focus}`}
                  style={{ boxShadow: "0 8px 50px rgba(19, 7, 56, 0.20)" }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(100% 130% at 50% 140%, rgba(9,222,159,0.45) 0%, rgba(9,222,159,0) 100%)",
                    }}
                  />
                  <span className="relative">Book a Call</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/Icon_Call.svg" alt="" aria-hidden className="relative h-5 w-auto brightness-0 invert" />
                </a>
              </div>
            </div>

            <ul className="flex shrink-0 items-center gap-[26px]" ref={register}>
              {STATS.map((s, i) => (
                <li key={s.label} className="flex items-center gap-[26px]">
                  {i > 0 && <span aria-hidden className="h-[31px] w-px bg-white/40" />}
                  <span className="flex flex-col items-center gap-2">
                    <span className="flex items-start leading-none">
                      <span className="text-[35px] font-semibold leading-none">{s.value}</span>
                      {s.quant && <span className="text-[20px] font-semibold leading-none">{s.quant}</span>}
                    </span>
                    <span className="text-[12px] font-normal leading-none">{s.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Trust panel — Figma "Content": r40, #E6EDF2, pt 24 */}
      <div
        ref={panelRef}
        className="relative z-10 rounded-t-[40px] bg-background text-ink shadow-[0_-24px_60px_-24px_rgba(19,7,56,0.35)]"
        style={{ marginTop: -PANEL_PEEK }}
      >
        <div className="pt-6">
          <p className="text-center text-[14px] text-ink/40">Trusted by</p>

          <div
            className="mt-5 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
            }}
          >
            <ul
              className="flex w-max items-center gap-9 motion-reduce:animate-none"
              style={{ animation: "marquee-x 59s linear infinite" }}
            >
              {[...CLIENTS, ...CLIENTS].map((name, i) => (
                <li key={`${name}-${i}`} className="shrink-0">
                  {/* Masked so the mark takes the ink colour rather than staying black */}
                  <span
                    role={i < CLIENTS.length ? "img" : undefined}
                    aria-label={i < CLIENTS.length ? name : undefined}
                    aria-hidden={i >= CLIENTS.length}
                    className="block h-10 w-[120px] bg-ink/70"
                    style={{
                      maskImage: `url(/logos/${name}.svg)`,
                      WebkitMaskImage: `url(/logos/${name}.svg)`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Long enough that the whole hero fade sequence can play out */}
          <div className="mx-auto mt-20 grid max-w-[1200px] gap-6 px-8 pb-[120vh] md:grid-cols-3">
            {["Selected Work", "Approach", "Get in touch"].map((t) => (
              <div key={t} className="rounded-card bg-card p-8 shadow-card">
                <h2 className="text-h4 font-semibold">{t}</h2>
                <p className="mt-3 text-body text-ink-muted">
                  Section placeholder — length so the panel can scroll over the pinned hero.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copy version switch */}
      {showSwitch && (
        <div className="fixed bottom-4 left-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[#130738]/90 p-4 text-white shadow-lift backdrop-blur-md">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
              Headline version
            </p>
            <button
              type="button"
              onClick={() => setShowSwitch(false)}
              className="rounded-full px-2 py-1 font-mono text-[11px] text-white/70 hover:bg-white/10"
            >
              hide
            </button>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {COPY_VARIANTS.map((v, i) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setVariant(i)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                    variant === i ? "bg-[#683bff]" : "hover:bg-white/10"
                  }`}
                >
                  <span className="block text-[13px] font-semibold">
                    {i + 1}. {v.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-white/60">
                    {v.note}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tuning && <DotGridTuner config={config} onChange={setConfig} />}
    </>
  );
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
