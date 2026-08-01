"use client";

import { useEffect, useState } from "react";
import { DotGrid, DotGridTuner, DOT_GRID_DEFAULTS, type DotGridConfig } from "@/components/dot-grid";

/* Every value below is read off the Figma artboard "Landing / Home" (117:82)
   via figma-cli. Design width 1200, content column 1136 (32px gutters).
   Hero auto-layout: padding 64 / 0 / 40 / 80, space-between. */

const NAV = [
  { label: "Home", href: "#" },
  { label: "Portfolio", href: "#work" },
  { label: "AI", href: "#ai" },
];

/* Figma "Frame 362" — no card backgrounds, hairline dividers between entries. */
const STATS = [
  { value: "20", quant: "yrs", label: "Design Experience" },
  { value: "2", quant: "", label: "Degrees" },
  { value: "20", quant: "+", label: "Clients" },
  { value: "60", quant: "+", label: "Projects" },
];

/* Order taken from the Figma "Client Logos" row. */
const CLIENTS = [
  "Sparkasse",
  "Teufel",
  "AOK",
  "Dominos",
  "SonyMusic",
  "ERGO",
  "Payback",
  "BerlinChemie",
  "CaraCare",
  "DojoMadness",
  "Wefox",
];

type Audience = "recruiters" | "businesses";

const AUDIENCES: { key: Audience; label: string }[] = [
  { key: "recruiters", label: "For Recruiters" },
  { key: "businesses", label: "For Businesses" },
];

/* Figma: underline sits 12px inside each edge, radius 20. Thickness raised from
   the file's 1px to 2px on Beni's note that it reads too weak on screen. */
function Underlined({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="flex flex-col items-stretch">
      <span className={active ? "font-medium" : ""}>{children}</span>
      <span className="flex px-3 pt-2">
        <span
          className={`h-0.5 w-full rounded-full bg-white transition-opacity duration-200 ${
            active ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </span>
  );
}

export function HeroV2() {
  const [config, setConfig] = useState<DotGridConfig>(DOT_GRID_DEFAULTS);
  const [tuning, setTuning] = useState(false);
  const [audience, setAudience] = useState<Audience>("recruiters");

  useEffect(() => {
    setTuning(new URLSearchParams(window.location.search).has("tune"));
  }, []);

  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

  return (
    <>
      <section className="sticky top-0 h-svh overflow-hidden text-white">
        <div className="absolute inset-0" style={{ background: "var(--grad-hero)" }} />
        <DotGrid config={config} />

        {/* Portrait — Figma frame is 407x483 in a 694-tall hero (70%), bottom-anchored. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[120px] hidden justify-center lg:flex">
          <div className="flex w-full max-w-[1200px] justify-end px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portrait.png"
              alt="Benjamin Erxleben"
              className="h-auto w-[min(34vw,430px)] max-w-none select-none object-contain"
            />
          </div>
        </div>

        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col px-8 pt-8">
          {/* Top nav — Figma: 1136x66, r16, #130738 @10%, 1px stroke, glass, 24px shadow */}
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

            {/* Absolutely centred in the bar, not balanced between logo and icon */}
            <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex">
              {NAV.map((item, i) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-[18px] uppercase leading-none tracking-[0.16em] transition-colors ${focus} ${
                    i === 0 ? "" : "text-white/75 hover:text-white"
                  }`}
                >
                  <Underlined active={i === 0}>{item.label}</Underlined>
                </a>
              ))}
            </nav>

            <a
              href="https://www.linkedin.com/in/benjaminerxleben/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className={`shrink-0 transition-transform hover:scale-105 ${focus}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/logo_linked-in.svg" alt="" aria-hidden className="h-8 w-8" />
            </a>
          </header>

          {/* Hero body — Figma auto-layout: pt 64, pb 40, pl 80, space-between.
              Extra 120px bottom keeps the competence row clear of the panel. */}
          <div className="flex min-h-0 flex-1 flex-col justify-between pb-[160px] pt-16 lg:pl-20">
            {/* Audience selector — 20px, active SemiBold, 4px dot divider */}
            <div className="flex shrink-0 items-center gap-3 text-[20px] leading-none">
              {AUDIENCES.map((a, i) => (
                <span key={a.key} className="flex items-center gap-3">
                  {i > 0 && <span aria-hidden className="h-1 w-1 rounded-full bg-white" />}
                  <button
                    type="button"
                    onClick={() => setAudience(a.key)}
                    aria-pressed={audience === a.key}
                    className={`${focus} ${audience === a.key ? "" : "text-white/70"}`}
                  >
                    <Underlined active={audience === a.key}>{a.label}</Underlined>
                  </button>
                </span>
              ))}
            </div>

            {/* Copy & CTA — Figma gap 40, inner copy gap 32 */}
            <div className="flex max-w-[626px] flex-col gap-10">
              <div className="flex flex-col gap-8">
                <h1 className="flex items-center gap-1.5 text-[clamp(2.25rem,4.6vw,3.5rem)] font-medium leading-none tracking-[-0.01em] text-white/[0.45]">
                  0
                  <svg viewBox="0 0 23 22" fill="none" className="h-[0.4em] w-auto shrink-0" aria-hidden>
                    <path
                      d="M1 11h20M13 3l8 8-8 8"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="sr-only">to</span>1 Product Design
                </h1>

                <p className="text-[clamp(1.0625rem,1.7vw,1.5rem)] leading-[1.4]">
                  I&rsquo;m <strong className="font-semibold">Benjamin</strong>. End-to-end hands-on
                  IC, <strong className="font-semibold">AI-native</strong>, at home in{" "}
                  <strong className="font-semibold">B2C SaaS</strong> and regulated,{" "}
                  <strong className="font-semibold">high-complexity markets</strong>
                </p>
              </div>

              {/* CTAs — Figma "Frame 7": purple + 70% green radial fill, r8, h46, pad 9/20 */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#cv"
                  className={`relative inline-flex h-[46px] items-center gap-3 overflow-hidden rounded-[8px] bg-bene-purple px-5 text-[20px] font-medium text-white ${focus}`}
                  style={{ boxShadow: "0 8px 50px rgba(19, 7, 56, 0.20)" }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(100% 120% at 100% 133%, rgba(12,208,150,0.7) 0%, rgba(12,208,150,0) 100%)",
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/Icon_Download_Page.svg"
                    alt=""
                    aria-hidden
                    className="relative h-5 w-auto brightness-0 invert"
                  />
                  <span className="relative">
                    {audience === "recruiters" ? "Download CV" : "See the work"}
                  </span>
                </a>

                <a
                  href="#contact"
                  className={`inline-flex h-[46px] items-center gap-2.5 rounded-[8px] border-[1.5px] border-white bg-white/[0.01] px-5 text-[20px] font-medium text-white transition-colors hover:bg-white/10 ${focus}`}
                >
                  Book a Call
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/Icon_Call.svg"
                    alt=""
                    aria-hidden
                    className="h-5 w-auto brightness-0 invert"
                  />
                </a>
              </div>
            </div>

            {/* Competence row — Figma "Frame 362": no boxes, 1x31 dividers at 40% */}
            <ul className="flex shrink-0 items-center gap-[26px]">
              {STATS.map((s, i) => (
                <li key={s.label} className="flex items-center gap-[26px]">
                  {i > 0 && <span aria-hidden className="h-[31px] w-px bg-white/40" />}
                  <span className="flex flex-col items-center gap-2">
                    <span className="flex items-start leading-none">
                      <span className="text-[35px] font-semibold leading-none">{s.value}</span>
                      {s.quant && (
                        <span className="text-[20px] font-semibold leading-none">{s.quant}</span>
                      )}
                    </span>
                    <span className="text-[12px] font-normal leading-none">{s.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Trust panel — full-bleed, already peeking at load, rides up over the pinned hero */}
      <div className="relative z-10 -mt-[120px] rounded-t-section bg-background text-ink shadow-[0_-24px_60px_-24px_rgba(19,7,56,0.35)]">
        <div className="py-14">
          <p className="text-center text-small text-ink-subtle">Trusted by</p>

          {/* Marquee — duplicated track, translated 50% for a seamless loop */}
          <div
            className="group mt-8 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            }}
          >
            <ul
              className="flex w-max items-center gap-16 opacity-70 grayscale motion-reduce:animate-none"
              style={{ animation: "marquee-x 45s linear infinite" }}
            >
              {[...CLIENTS, ...CLIENTS].map((name, i) => (
                <li key={`${name}-${i}`} className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/logos/${name}.svg`}
                    alt={i < CLIENTS.length ? name : ""}
                    aria-hidden={i >= CLIENTS.length}
                    className="h-7 w-auto object-contain"
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Placeholder length so the scroll-over is testable */}
          <div className="mx-auto mt-20 grid max-w-[1200px] gap-6 px-8 pb-40 md:grid-cols-3">
            {["Selected Work", "Approach", "Get in touch"].map((t) => (
              <div key={t} className="rounded-card bg-card p-8 shadow-card">
                <h2 className="text-h4 font-semibold">{t}</h2>
                <p className="mt-3 text-body text-ink-muted">
                  Section placeholder — here so the panel has length to scroll over the pinned hero.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tuning && <DotGridTuner config={config} onChange={setConfig} />}
    </>
  );
}
