"use client";

import { useEffect, useState } from "react";
import { DotGrid, DotGridTuner, DOT_GRID_DEFAULTS, type DotGridConfig } from "@/components/dot-grid";

/* Values below are read off the Figma artboard "Landing / Home" (117:82) via figma-cli.
   Design width is 1200 with a 1136 content column (32px gutters). */

const NAV = [
  { label: "Home", href: "#" },
  { label: "Portfolio", href: "#work" },
  { label: "AI", href: "#ai" },
];

const STATS = [
  { value: "20", sup: "yrs", label: "Design Experience" },
  { value: "2", sup: "", label: "Design Degrees" },
  { value: "20", sup: "+", label: "Happy Clients" },
  { value: "60", sup: "+", label: "successful Projects" },
];

const CLIENTS = [
  { name: "Sparkasse", src: "/logos/Sparkasse.svg" },
  { name: "Teufel", src: "/logos/Teufel.svg" },
  { name: "AOK", src: "/logos/AOK.svg" },
  { name: "Domino's", src: "/logos/Dominos.svg" },
  { name: "Sony Music", src: "/logos/SonyMusic.svg" },
  { name: "ERGO", src: "/logos/ERGO.svg" },
  { name: "Payback", src: "/logos/Payback.svg" },
];

type Audience = "recruiters" | "businesses";

export function HeroV2() {
  const [config, setConfig] = useState<DotGridConfig>(DOT_GRID_DEFAULTS);
  const [tuning, setTuning] = useState(false);
  const [audience, setAudience] = useState<Audience>("recruiters");

  useEffect(() => {
    setTuning(new URLSearchParams(window.location.search).has("tune"));
  }, []);

  return (
    <>
      {/* Hero is pinned; the content panel below scrolls up over it. */}
      <section className="sticky top-0 h-svh overflow-hidden text-white">
        <div className="absolute inset-0" style={{ background: "var(--grad-hero)" }} />
        <DotGrid config={config} />

        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col px-8 pt-8">
          {/* Top nav — Figma: 1136x66, r16, #130738 @10%, 1px stroke, glass blur, soft shadow */}
          <header
            className="flex h-[66px] shrink-0 items-center justify-between gap-6 rounded-[16px] border border-white/20 px-[17px] backdrop-blur-[50px]"
            style={{
              background: "rgba(19, 7, 56, 0.10)",
              boxShadow: "0 0 24px rgba(19, 7, 56, 0.20)",
            }}
          >
            <a
              href="#"
              className="flex items-center gap-[18px] pl-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" aria-hidden className="h-8 w-[46px] brightness-0 invert" />
              <span className="hidden leading-tight sm:block">
                <span className="block text-[15px] font-semibold">Benjamin Erxleben</span>
                <span className="block pt-1.5 text-[13px] text-white/70">Senior Product Designer</span>
              </span>
            </a>

            <nav className="hidden items-center gap-8 md:flex">
              {NAV.map((item, i) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-[18px] uppercase leading-none tracking-[0.16em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                    i === 0
                      ? "font-medium underline underline-offset-[10px]"
                      : "text-white/75 hover:text-white"
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
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-white text-ink transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05a4.2 4.2 0 0 1 3.75-2c4 0 4.75 2.5 4.75 5.8V21h-4v-5.6c0-1.35-.03-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.7h-4V9Z" />
              </svg>
            </a>
          </header>

          {/* Hero body */}
          {/* Figma indents the hero body 80px inside the 1136 column */}
          <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,637px)_minmax(0,1fr)] lg:pl-20">
            <div className="flex flex-col gap-10 pb-8">
              {/* Audience selector — Figma: 20px, active SemiBold + 2px rule, 4px dot divider */}
              <div className="flex items-center gap-3 text-[20px] leading-[1.4]">
                <button
                  type="button"
                  onClick={() => setAudience("recruiters")}
                  aria-pressed={audience === "recruiters"}
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span className={audience === "recruiters" ? "font-semibold" : "text-white/70"}>
                    For Recruiters
                  </span>
                  <span
                    className={`mt-1 block h-0.5 rounded-full bg-white transition-opacity ${
                      audience === "recruiters" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>

                <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-white" />

                <button
                  type="button"
                  onClick={() => setAudience("businesses")}
                  aria-pressed={audience === "businesses"}
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span className={audience === "businesses" ? "font-semibold" : "text-white/70"}>
                    For Businesses
                  </span>
                  <span
                    className={`mt-1 block h-0.5 rounded-full bg-white transition-opacity ${
                      audience === "businesses" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                {/* H1 — Figma: 56px Medium, white at 45% opacity, arrow is a 5.5px stroked vector */}
                <h1 className="flex items-center gap-1.5 text-[clamp(2.25rem,4.6vw,3.5rem)] font-medium leading-none tracking-[-0.01em] text-white/[0.45]">
                  0
                  <svg
                    viewBox="0 0 23 22"
                    fill="none"
                    className="h-[0.4em] w-auto shrink-0"
                    aria-hidden
                  >
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

                {/* Subline — Figma: 24px / 140%, dark glow behind for legibility */}
                <p
                  className="max-w-[626px] text-[clamp(1.0625rem,1.7vw,1.5rem)] leading-[1.4]"
                  style={{ textShadow: "0 0 120px rgba(19, 7, 56, 1)" }}
                >
                  I&rsquo;m <strong className="font-semibold">Benjamin</strong>. End-to-end hands-on
                  IC, <strong className="font-semibold">AI-native</strong>, at home in{" "}
                  <strong className="font-semibold">B2C SaaS</strong> and regulated,{" "}
                  <strong className="font-semibold">high-complexity markets</strong>
                </p>
              </div>

              {/* Buttons — Figma: h46, r8, pad 9/20, 20px Medium */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#cv"
                  className="inline-flex h-[46px] items-center gap-2 rounded-[8px] bg-bene-purple px-5 text-[20px] font-medium text-white transition-colors hover:bg-[#5a2fe8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  style={{ boxShadow: "0 0 50px rgba(19, 7, 56, 0.45)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
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
                  className="inline-flex h-[46px] items-center gap-2.5 rounded-[8px] border-[1.5px] border-white bg-white/[0.01] px-5 text-[20px] font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Book a Call
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden>
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

              {/* Competence cards — Figma: 144x82, r11, white @10%, label 10px @40% */}
              <ul className="flex gap-5">
                {STATS.map((s) => (
                  <li
                    key={s.label}
                    className="flex h-[82px] w-[144px] flex-col justify-between rounded-[11px] bg-white/10 p-[13px]"
                  >
                    <span className="text-[28px] font-semibold leading-none">
                      {s.value}
                      {s.sup && <sup className="ml-0.5 text-[14px] font-medium">{s.sup}</sup>}
                    </span>
                    <span className="text-[10px] leading-none text-white/40">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portrait — Figma: 407x483, bottom-anchored right */}
            <div className="relative hidden h-full items-end justify-end lg:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/portrait.png"
                alt="Benjamin Erxleben"
                className="pointer-events-none block h-auto w-full max-w-[30rem] translate-x-8 select-none object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content panel — full-bleed, rides up over the pinned hero on scroll */}
      <div className="relative z-10 rounded-t-section bg-background text-ink shadow-[0_-24px_60px_-24px_rgba(19,7,56,0.35)]">
        <div className="mx-auto max-w-[1200px] px-8 py-14">
          <p className="text-center text-small text-ink-subtle">Trusted by</p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-7 opacity-70 grayscale">
            {CLIENTS.map((c) => (
              <li key={c.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.src} alt={c.name} className="h-7 w-auto object-contain" />
              </li>
            ))}
          </ul>

          {/* Placeholder length so the scroll-over behaviour is testable. */}
          <div className="mt-20 grid gap-6 pb-40 md:grid-cols-3">
            {["Selected Work", "Approach", "Get in touch"].map((t) => (
              <div key={t} className="rounded-card bg-card p-8 shadow-card">
                <h2 className="text-h4 font-semibold">{t}</h2>
                <p className="mt-3 text-body text-ink-muted">
                  Section placeholder — here so the panel has enough length to scroll over the
                  pinned hero.
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
