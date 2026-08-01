"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DotGrid, DotGridTuner, DOT_GRID_DEFAULTS, type DotGridConfig } from "@/components/dot-grid";
import { useSlidingUnderline, UnderlineBar } from "@/components/sliding-underline";
import { COPY_VARIANTS } from "@/components/copy-variants";
import { DevOverlayStack, DevOverlay } from "@/components/dev-overlays";

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

/* Per-logo optical sizes straight from the Figma client row — they are
   deliberately uneven so the marks read as the same visual weight. */
const CLIENT_LOGOS = [
  { n: "Sparkasse", w: 110, h: 37.5 },
  { n: "Teufel", w: 72.5, h: 31.7 },
  { n: "AOK", w: 105.7, h: 33.3 },
  { n: "Dominos", w: 124.9, h: 30 },
  { n: "SonyMusic", w: 150, h: 33.3 },
  { n: "ERGO", w: 82.4, h: 23.3 },
  { n: "Payback", w: 81.3, h: 25 },
  { n: "BerlinChemie", w: 166.5, h: 26.7 },
  { n: "CaraCare", w: 131.7, h: 30 },
  { n: "DojoMadness", w: 84, h: 30.8 },
  { n: "Wefox", w: 93, h: 25 },
];

const LOGO_GAP = 64;

const AUDIENCES = [
  { key: "recruiters", label: "For Recruiters" },
  { key: "businesses", label: "For Businesses" },
] as const;

const PANEL_PEEK = 120;

/* The hero is pinned, so only the panel moves. Fading off an absolute gap would
   start the lowest element already faded at rest, because it sits close to the
   panel edge. So it runs off how far the panel has travelled from its resting
   position instead, staggered bottom-to-top. */
const FADE_DURATION = 260;
const FADE_STAGGER = 90;

function useScrollFade() {
  const panelRef = useRef<HTMLDivElement>(null);
  const items = useRef<HTMLElement[]>([]);

  const register = useCallback((el: HTMLElement | null) => {
    if (el && !items.current.includes(el)) items.current.push(el);
  }, []);

  useEffect(() => {
    let raf = 0;
    let baselines: { el: HTMLElement; gap: number; order: number }[] = [];

    /* The pinned hero doesn't move, and the panel tracks scroll 1:1, so the
       resting gap is simply the current gap plus how far we've scrolled. No
       need to jump the page to measure it. */
    const calibrate = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const panelTop = panel.getBoundingClientRect().top;
      const y = window.scrollY;
      baselines = items.current
        .map((el) => {
          const top = el.getBoundingClientRect().top;
          return { el, gap: panelTop - top + y, top };
        })
        .sort((a, b) => b.top - a.top) // bottom-most first
        .map((b, order) => ({ el: b.el, gap: b.gap, order }));
    };

    const update = () => {
      raf = 0;
      const panel = panelRef.current;
      if (!panel) return;
      const panelTop = panel.getBoundingClientRect().top;
      for (const { el, gap, order } of baselines) {
        const travel = gap - (panelTop - el.getBoundingClientRect().top);
        const t = Math.min(1, Math.max(0, (travel - order * FADE_STAGGER) / FADE_DURATION));
        const eased = 1 - t * t * (3 - 2 * t); // inverted smoothstep
        el.style.opacity = String(eased);
        el.style.visibility = eased < 0.01 ? "hidden" : "visible";
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onResize = () => {
      calibrate();
      onScroll();
    };

    calibrate();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return { panelRef, register };
}

export function HeroV2() {
  const [config, setConfig] = useState<DotGridConfig>(DOT_GRID_DEFAULTS);
  const [audience, setAudience] = useState(0);
  const [navActive, setNavActive] = useState(0);
  const [variant, setVariant] = useState(0);

  const nav = useSlidingUnderline<HTMLElement>(navActive);
  const aud = useSlidingUnderline<HTMLDivElement>(audience);
  const { panelRef, register } = useScrollFade();

  const copy = COPY_VARIANTS[variant];
  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

  const renderSubline = () => {
    const { text, bold } = copy.subline;
    const parts = text.split(new RegExp(`(${bold.map(escapeRe).join("|")})`, "g"));
    return parts.map((p, i) =>
      bold.includes(p) ? <strong key={i} className="font-semibold">{p}</strong> : <span key={i}>{p}</span>,
    );
  };

  return (
    <>
      <section className="sticky top-0 h-svh overflow-hidden text-white">
        <div className="absolute inset-0" style={{ background: "var(--grad-hero)" }} />

        {/* Content-tracked accents. Blurred ellipses like the Figma layer stack,
            positioned inside the 1200 column so they stay behind the elements
            they belong to at any aspect ratio. Sits before the dot grid in the
            DOM, so the grid draws on top — including over the darkener. */}
        <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
          <div className="relative h-full w-full max-w-[1200px] px-8">
            {/* Figma "Accent Linkedin" — a circle, not an ellipse, so it keeps
                its shape at any ratio. Up and right of the tile. */}
            <div
              className="absolute right-[-3%] top-[-16%] aspect-square w-[34%] -translate-y-[60px] translate-x-[60px] rounded-full"
              style={{ background: "rgba(12,208,150,0.70)", filter: "blur(120px)" }}
            />
            {/* Figma "Accent KPIs" — carries the width of the competence row */}
            <div
              className="absolute bottom-[10px] left-10 h-[24vh] w-[680px] max-w-[62%] rounded-full"
              style={{ background: "rgba(9,222,159,0.75)", filter: "blur(110px)" }}
            />
            {/* Content darkener. Lives here rather than inside the copy block so
                it never takes part in the scroll fade — the background must stay
                constant while only the content recedes. */}
            <div
              className="absolute left-10 top-1/2 h-[62%] w-[72%] -translate-y-1/2 rounded-full"
              style={{ background: "rgba(19,7,56,0.8)", filter: "blur(90px)" }}
            />
          </div>
        </div>

        <DotGrid config={config} />

        {/* Portrait — sized off the Figma render by head height, not frame
            height: the Figma source is a 16:9 photo cropped to 77.5% width,
            this PNG is a tight crop, so matching the frame would oversize the
            face. Head reads ~32% of the hero there, which puts this image at
            ~60% of hero height with the hair starting ~27% down. Full aspect,
            no side crop; bleeds right and is cut at the bottom by the panel. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[17%] hidden justify-center lg:flex">
          <div className="relative w-full max-w-[1200px] px-8">
            {/* Runs to the bottom of the hero so the shoulders stay visible in
                the gaps beside the panel's rounded top corners. Rotated 3.5deg
                like the Figma, which pulls more of the shoulder in on the right
                and keeps the neckline out from under the panel. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portrait.png"
              alt="Benjamin Erxleben"
              className="absolute right-[-22%] top-0 h-full w-auto max-w-none select-none object-contain"
              style={{ transform: "rotate(3.5deg)", transformOrigin: "bottom right" }}
            />
          </div>
        </div>

        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col px-8 pt-8">
          <header
            className="relative flex h-[66px] shrink-0 items-center justify-between rounded-[16px] border border-white/20 px-[17px] backdrop-blur-[50px]"
            style={{
              background: "rgba(19, 7, 56, 0.18)",
              boxShadow: "0 2px 32px rgba(19, 7, 56, 0.30)",
            }}
          >
            <a href="#" className={`flex items-center gap-[18px] pl-0.5 ${focus}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" aria-hidden className="h-8 w-[46px] brightness-0 invert" />
              <span className="hidden flex-col gap-0.5 leading-none sm:flex">
                <span className="text-[17px] font-[520] leading-none">Benjamin Erxleben</span>
                <span className="text-[16px] font-[380] leading-none text-white/50">
                  Digital Product Designer
                </span>
              </span>
            </a>

            {/* Figma builds each item as a 32px box with an invisible 1px rule on
                top mirroring the underline, so the label sits optically centred.
                Same result here: fixed 32px track, label centred, bar pinned to
                its bottom edge so it never shifts the text. */}
            <nav
              ref={nav.trackRef}
              className="absolute left-1/2 top-1/2 hidden h-8 -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex"
            >
              {NAV.map((item, i) => (
                <a
                  key={item.label}
                  data-underline-item
                  href={item.href}
                  onClick={() => setNavActive(i)}
                  aria-current={navActive === i ? "page" : undefined}
                  className={`flex h-full items-center text-[18px] uppercase leading-none tracking-[0.16em] transition-colors ${focus} ${
                    navActive === i ? "font-[520] text-white" : "text-white/35 hover:text-white/70"
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
            <div ref={register} className="shrink-0">
              <div
                ref={aud.trackRef}
                className="relative flex h-8 w-fit items-center gap-8 text-[20px] leading-none"
              >
                {AUDIENCES.map((a, i) => (
                  <button
                    key={a.key}
                    data-underline-item
                    type="button"
                    onClick={() => setAudience(i)}
                    aria-pressed={audience === i}
                    className={`flex h-full items-center transition-colors ${focus} ${
                      audience === i
                        ? "font-[560] text-white"
                        : "font-[430] text-white/35 hover:text-white/70"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
                <UnderlineBar bar={aud.bar} />
              </div>
            </div>

            {/* Headline, subline and CTAs fade as one group */}
            <div ref={register} className="relative flex max-w-[626px] flex-col gap-10">
              <div className="flex flex-col gap-8">
                <h1 className="flex items-center gap-1.5 text-[clamp(2.25rem,4.6vw,3.5rem)] font-medium leading-none tracking-[-0.01em] text-white/[0.45] text-balance">
                  {copy.headline.lead}
                  {copy.headline.arrow && (
                    <svg viewBox="0 0 23 22" fill="none" className="h-[0.4em] w-auto shrink-0" aria-hidden>
                      <path d="M1 11h20M13 3l8 8-8 8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {copy.headline.arrow && <span className="sr-only">to</span>}
                  {copy.headline.rest}
                </h1>

                <p className="text-[clamp(1.0625rem,1.7vw,1.5rem)] leading-[1.4]">{renderSubline()}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#cv"
                  className={`group relative inline-flex h-[46px] items-center gap-3 overflow-hidden rounded-[8px] bg-bene-purple px-5 text-[20px] font-medium text-white transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#5a2fe8] active:translate-y-0 active:bg-[#4d26d0] ${focus}`}
                  style={{ boxShadow: "0 8px 50px rgba(19, 7, 56, 0.20)" }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-85 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(100% 120% at 100% 133%, rgba(12,208,150,0.7) 0%, rgba(12,208,150,0) 100%)",
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/Icon_Download_Page.svg" alt="" aria-hidden className="relative h-5 w-auto brightness-0 invert" />
                  <span className="relative">{audience === 0 ? "Download CV" : "See the work"}</span>
                </a>

                <a
                  href="#contact"
                  className={`group relative inline-flex h-[46px] items-center gap-2.5 overflow-hidden rounded-[8px] border border-white/45 bg-white/[0.01] px-5 text-[20px] font-medium text-white backdrop-blur-[14px] transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/15 active:translate-y-0 active:bg-white/25 ${focus}`}
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

            <ul ref={register} className="flex shrink-0 items-center gap-[26px]">
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
            {/* Two identical sets, spacing carried as per-item margin so the
                track width is exactly 2x one set and -50% loops seamlessly. */}
            <div
              className="flex w-max items-center motion-reduce:animate-none"
              style={{ animation: "marquee-x 59s linear infinite" }}
            >
              {[0, 1].map((set) => (
                <ul key={set} className="flex items-center" aria-hidden={set === 1}>
                  {CLIENT_LOGOS.map((l) => (
                    <li key={l.n} style={{ marginRight: LOGO_GAP }} className="shrink-0">
                      <span
                        role={set === 0 ? "img" : undefined}
                        aria-label={set === 0 ? l.n : undefined}
                        className="block bg-[#130738]"
                        style={{
                          width: l.w,
                          height: l.h,
                          maskImage: `url(/logos/${l.n}.svg)`,
                          WebkitMaskImage: `url(/logos/${l.n}.svg)`,
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
              ))}
            </div>
          </div>

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

      <DevOverlayStack>
        <DevOverlay id="copy" title="Headline version">
          <ul className="flex flex-col gap-1.5">
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
                  <span className="mt-0.5 block text-[11px] leading-snug text-white/60">{v.note}</span>
                </button>
              </li>
            ))}
          </ul>
        </DevOverlay>

        <DevOverlay id="grid" title="Dot grid">
          <DotGridTuner config={config} onChange={setConfig} />
        </DevOverlay>
      </DevOverlayStack>
    </>
  );
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
