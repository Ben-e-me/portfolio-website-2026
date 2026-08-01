"use client";

import { useEffect, useState } from "react";
import { DotGrid, DotGridTuner, DOT_GRID_DEFAULTS, type DotGridConfig } from "@/components/dot-grid";

const NAV = [
  { label: "Home", href: "#" },
  { label: "Work", href: "#work" },
  { label: "AI", href: "#ai" },
];

/* Drop real SVGs into /public/logos/<file>.svg and add `src` — the wordmark
   fallback keeps the composition readable until then. */
const CLIENTS: { name: string; src?: string }[] = [
  { name: "Sparkasse", src: "/logos/Sparkasse.svg" },
  { name: "Teufel", src: "/logos/Teufel.svg" },
  { name: "AOK", src: "/logos/AOK.svg" },
  { name: "Domino's", src: "/logos/Dominos.svg" },
  { name: "Sony Music", src: "/logos/SonyMusic.svg" },
  { name: "ERGO", src: "/logos/ERGO.svg" },
  { name: "Payback", src: "/logos/Payback.svg" },
];

type Audience = "recruiters" | "businesses";

const PORTRAIT_SRC: string | null = "/portrait.png";

export function HeroV2() {
  const [config, setConfig] = useState<DotGridConfig>(DOT_GRID_DEFAULTS);
  const [tuning, setTuning] = useState(false);
  const [audience, setAudience] = useState<Audience>("recruiters");

  useEffect(() => {
    setTuning(new URLSearchParams(window.location.search).has("tune"));
  }, []);

  return (
    <>
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden text-white">
        {/* gradient ground + dot layer */}
        <div className="absolute inset-0 -z-10" style={{ background: "var(--grad-hero)" }} />
        <DotGrid config={config} />

        <div className="relative mx-auto flex w-full max-w-[88rem] flex-1 flex-col px-5 pb-0 pt-5 sm:px-8">
          {/* glass nav */}
          <header className="flex items-center justify-between gap-6 rounded-pill border border-white/25 bg-white/10 px-5 py-3 backdrop-blur-md sm:px-7">
            <a href="#" className="flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt=""
                className="h-8 w-auto brightness-0 invert"
                aria-hidden
              />
              <span className="hidden leading-tight sm:block">
                <span className="block text-[15px] font-semibold">Benjamin Erxleben</span>
                <span className="block text-[13px] text-white/70">Senior Product Designer</span>
              </span>
            </a>

            <div className="flex items-center gap-5 sm:gap-8">
              <nav className="flex items-center gap-5 sm:gap-8">
                {NAV.map((item, i) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`text-[13px] uppercase tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                      i === 0 ? "font-semibold underline underline-offset-8" : "text-white/75 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <a
                href="https://www.linkedin.com/in/benjaminerxleben/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="grid h-9 w-9 place-items-center rounded-lg bg-white text-ink transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05a4.2 4.2 0 0 1 3.75-2c4 0 4.75 2.5 4.75 5.8V21h-4v-5.6c0-1.35-.03-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.7h-4V9Z" />
                </svg>
              </a>
            </div>
          </header>

          {/* content + portrait */}
          <div className="grid flex-1 items-end gap-8 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-4 lg:pt-0">
            <div className="flex flex-col gap-7 pb-16 lg:pb-24">
              {/* audience switch */}
              <div className="flex items-center gap-3 text-[15px]">
                {(["recruiters", "businesses"] as const).map((key, i) => (
                  <span key={key} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden className="text-white/40">·</span>}
                    <button
                      type="button"
                      onClick={() => setAudience(key)}
                      aria-pressed={audience === key}
                      className={`rounded-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                        audience === key
                          ? "font-semibold text-white underline underline-offset-8"
                          : "text-white/60 hover:text-white/90"
                      }`}
                    >
                      {key === "recruiters" ? "For Recruiters" : "For Businesses"}
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-5">
                <h1 className="max-w-[16ch] font-heading text-[clamp(2.75rem,7vw,5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-white/55 text-balance">
                  0<span aria-hidden>→</span>
                  <span className="sr-only">to</span>1 Product Design
                </h1>

                {/* Proposal: "20 years" folded into the sentence (julius.fm pattern) so the
                    hero carries one strong number without a competing stats row. */}
                <p className="max-w-[46ch] text-[clamp(1.0625rem,1.9vw,1.375rem)] leading-[1.45] text-white/90">
                  I&apos;m <strong className="font-semibold text-white">Benjamin</strong>. End-to-end
                  hands-on IC with <strong className="font-semibold text-white">20 years</strong> in
                  design, AI-native, at home in B2C SaaS and regulated, high-complexity markets.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#cv"
                  className="group inline-flex items-center gap-2.5 rounded-pill bg-bene-purple py-4 pl-5 pr-6 text-[15px] font-semibold text-white shadow-lift transition-all hover:bg-[#5a2fe8] hover:shadow-hero focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
                    <path
                      d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
                      fill="currentColor"
                      opacity=".25"
                    />
                    <path
                      d="M14 3v3a2 2 0 0 0 2 2h3M12 11v6m0 0 2.5-2.5M12 17l-2.5-2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {audience === "recruiters" ? "Download CV" : "See the work"}
                </a>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-2.5 rounded-pill border border-white/45 py-4 pl-6 pr-5 text-[15px] font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Book a Call
                  <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
                    <path
                      d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.1A8.38 8.38 0 0 1 4 12a8.5 8.5 0 0 1 8.5-8.5 8.38 8.38 0 0 1 8.5 8Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="8.75" cy="12" r="1" fill="currentColor" />
                    <circle cx="12.25" cy="12" r="1" fill="currentColor" />
                    <circle cx="15.75" cy="12" r="1" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="relative hidden self-end lg:block">
              {PORTRAIT_SRC ? (
                /* Sized to run past the section edge so the trust panel crops it,
                   the way the Figma header does. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={PORTRAIT_SRC}
                  alt="Benjamin Erxleben"
                  className="pointer-events-none ml-auto -mb-6 block h-auto w-full max-w-[34rem] select-none object-contain"
                />
              ) : (
                <div className="ml-auto flex h-[26rem] w-full max-w-[30rem] items-end justify-center rounded-t-shell border border-dashed border-white/30 bg-white/5 pb-6 text-small text-white/50">
                  portrait cutout → /public/portrait.png
                </div>
              )}
            </div>
          </div>
        </div>

        {/* trust panel peeking in from the bottom of the first viewport */}
        <div className="relative mx-auto w-full max-w-[88rem] px-5 sm:px-8">
          <div className="rounded-t-section bg-background px-6 pb-10 pt-8 text-ink sm:px-12">
            <p className="text-center text-small text-ink-subtle">Trusted by</p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70 grayscale sm:gap-x-14">
              {CLIENTS.map((c) => (
                <li key={c.name}>
                  {c.src ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={c.src} alt={c.name} className="h-7 w-auto object-contain" />
                  ) : (
                    <span className="font-heading text-[1.05rem] font-semibold tracking-tight text-ink">
                      {c.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {tuning && <DotGridTuner config={config} onChange={setConfig} />}
    </>
  );
}
