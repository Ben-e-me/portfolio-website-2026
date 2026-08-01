"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type DotGridConfig = {
  dotSize: number;
  gap: number;
  rotation: number;
  baseColor: string;
  baseOpacity: number;
  activeColor: string;
  activeOpacity: number;
  proximity: number;
  speedTrigger: number;
  maxSpeed: number;
  shockRadius: number;
  shockStrength: number;
  resistance: number;
  returnDuration: number;
};

/* Beni's tuned pass, 2026-08-01 (second round). */
export const DOT_GRID_DEFAULTS: DotGridConfig = {
  dotSize: 2.5,
  gap: 12,
  rotation: -30,
  baseColor: "#ffffff",
  baseOpacity: 0.12,
  activeColor: "#09de9f",
  activeOpacity: 1,
  proximity: 40,
  speedTrigger: 250,
  maxSpeed: 5000,
  shockRadius: 200,
  shockStrength: 2,
  resistance: 2000,
  returnDuration: 1,
};

type Dot = { cx: number; cy: number; ox: number; oy: number; vx: number; vy: number };

function hexToRgb(hex: string) {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 255, g: 255, b: 255 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

export function DotGrid({
  config = DOT_GRID_DEFAULTS,
  className = "",
}: {
  config?: DotGridConfig;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, speed: 0, t: 0, lx: 0, ly: 0 });
  const cfgRef = useRef(config);
  cfgRef.current = config;

  const { dotSize, gap, rotation } = config;

  const buildGrid = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    // Hexagonal (triangular) packing: every other row is offset by half a cell
    // and row height is cell * sin(60°). Oversized so rotation still covers the corners.
    const diag = Math.hypot(width, height);
    const cell = dotSize + gap;
    const rowH = cell * (Math.sqrt(3) / 2);
    const cols = Math.ceil(diag / cell) + 3;
    const rows = Math.ceil(diag / rowH) + 3;

    const originX = width / 2 - ((cols - 1) * cell) / 2;
    const originY = height / 2 - ((rows - 1) * rowH) / 2;

    const dots: Dot[] = [];
    for (let y = 0; y < rows; y++) {
      const stagger = (y % 2) * (cell / 2);
      for (let x = 0; x < cols; x++) {
        dots.push({
          cx: originX + x * cell + stagger,
          cy: originY + y * rowH,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
        });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    buildGrid();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(buildGrid);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [buildGrid]);

  // Draw + physics loop. No GSAP: impulse sets velocity, a damped spring returns it.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        raf = requestAnimationFrame(frame);
        return;
      }

      const c = cfgRef.current;
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const base = hexToRgb(c.baseColor);
      const active = hexToRgb(c.activeColor);
      const rad = (c.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const cxm = w / 2;
      const cym = h / 2;

      // Pointer in lattice space (inverse rotation about the centre).
      const p = pointerRef.current;
      const rx = p.x - cxm;
      const ry = p.y - cym;
      const plx = rx * cos + ry * sin + cxm;
      const ply = -rx * sin + ry * cos + cym;

      const omega = (2 * Math.PI) / Math.max(0.15, c.returnDuration);
      const zeta = Math.min(1, Math.max(0.08, c.resistance / 4000));
      const proxSq = c.proximity * c.proximity;

      ctx.save();
      ctx.translate(cxm, cym);
      ctx.rotate(rad);
      ctx.translate(-cxm, -cym);

      for (const d of dotsRef.current) {
        if (!reduced) {
          const ax = -omega * omega * d.ox - 2 * zeta * omega * d.vx;
          const ay = -omega * omega * d.oy - 2 * zeta * omega * d.vy;
          d.vx += ax * dt;
          d.vy += ay * dt;
          d.ox += d.vx * dt;
          d.oy += d.vy * dt;
        }

        const dx = d.cx - plx;
        const dy = d.cy - ply;
        const dsq = dx * dx + dy * dy;

        let r = base.r;
        let g = base.g;
        let b = base.b;
        let a = c.baseOpacity;
        if (dsq <= proxSq) {
          const t = 1 - Math.sqrt(dsq) / c.proximity;
          r = Math.round(base.r + (active.r - base.r) * t);
          g = Math.round(base.g + (active.g - base.g) * t);
          b = Math.round(base.b + (active.b - base.b) * t);
          a = c.baseOpacity + (c.activeOpacity - c.baseOpacity) * t;
        }

        ctx.beginPath();
        ctx.arc(d.cx + d.ox, d.cy + d.oy, c.dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fill();
      }

      ctx.restore();
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pointer impulses.
  useEffect(() => {
    const toLattice = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top, rect };
    };

    const onMove = (e: PointerEvent) => {
      const c = cfgRef.current;
      const pos = toLattice(e.clientX, e.clientY);
      if (!pos) return;

      const p = pointerRef.current;
      const now = performance.now();
      const dt = p.t ? now - p.t : 16;
      let vx = ((e.clientX - p.lx) / dt) * 1000;
      let vy = ((e.clientY - p.ly) / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > c.maxSpeed) {
        const s = c.maxSpeed / speed;
        vx *= s;
        vy *= s;
        speed = c.maxSpeed;
      }
      p.t = now;
      p.lx = e.clientX;
      p.ly = e.clientY;
      p.vx = vx;
      p.vy = vy;
      p.speed = speed;
      p.x = pos.x;
      p.y = pos.y;

      if (speed <= c.speedTrigger) return;

      const rad = (c.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const cxm = pos.rect.width / 2;
      const cym = pos.rect.height / 2;
      const rx = pos.x - cxm;
      const ry = pos.y - cym;
      const plx = rx * cos + ry * sin + cxm;
      const ply = -rx * sin + ry * cos + cym;

      for (const d of dotsRef.current) {
        const dist = Math.hypot(d.cx - plx, d.cy - ply);
        if (dist >= c.proximity) continue;
        const falloff = 1 - dist / c.proximity;
        d.vx += (d.cx - plx + vx * 0.005) * falloff * 2;
        d.vy += (d.cy - ply + vy * 0.005) * falloff * 2;
      }
    };

    const onClick = (e: PointerEvent) => {
      const c = cfgRef.current;
      const pos = toLattice(e.clientX, e.clientY);
      if (!pos) return;

      const rad = (c.rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const cxm = pos.rect.width / 2;
      const cym = pos.rect.height / 2;
      const rx = pos.x - cxm;
      const ry = pos.y - cym;
      const plx = rx * cos + ry * sin + cxm;
      const ply = -rx * sin + ry * cos + cym;

      for (const d of dotsRef.current) {
        const dist = Math.hypot(d.cx - plx, d.cy - ply);
        if (dist >= c.shockRadius) continue;
        const falloff = Math.max(0, 1 - dist / c.shockRadius);
        d.vx += (d.cx - plx) * c.shockStrength * falloff;
        d.vy += (d.cy - ply) * c.shockStrength * falloff;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

/* ---------------------------------------------------------------- tuning ---- */

const SLIDERS: { key: keyof DotGridConfig; min: number; max: number; step: number }[] = [
  { key: "dotSize", min: 1, max: 24, step: 0.5 },
  { key: "gap", min: 8, max: 120, step: 1 },
  { key: "rotation", min: -90, max: 90, step: 1 },
  { key: "baseOpacity", min: 0, max: 1, step: 0.01 },
  { key: "activeOpacity", min: 0, max: 1, step: 0.01 },
  { key: "proximity", min: 20, max: 400, step: 5 },
  { key: "speedTrigger", min: 0, max: 2000, step: 25 },
  { key: "shockRadius", min: 20, max: 500, step: 10 },
  { key: "shockStrength", min: 0, max: 30, step: 0.5 },
  { key: "resistance", min: 100, max: 6000, step: 50 },
  { key: "returnDuration", min: 0.2, max: 6, step: 0.1 },
];

export function DotGridTuner({
  config,
  onChange,
}: {
  config: DotGridConfig;
  onChange: (c: DotGridConfig) => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Open by default on desktop only — on phones the panel would cover the design.
  useEffect(() => {
    if (window.innerWidth >= 1024) setOpen(true);
  }, []);

  const snippet = useMemo(() => JSON.stringify(config, null, 2), [config]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[#130738]/90 p-4 text-white shadow-lift backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
          Dot grid
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full px-2 py-1 font-mono text-[11px] text-white/70 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
        >
          {open ? "hide" : "show"}
        </button>
      </div>

      {open && (
        <>
          <div className="mt-3 max-h-[52vh] space-y-2.5 overflow-y-auto pr-1">
            {SLIDERS.map(({ key, min, max, step }) => (
              <label key={key} className="block">
                <span className="flex items-baseline justify-between font-mono text-[11px] text-white/70">
                  {key}
                  <span className="tabular-nums text-white">{config[key] as number}</span>
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={config[key] as number}
                  onChange={(e) => onChange({ ...config, [key]: Number(e.target.value) })}
                  className="mt-1 w-full accent-[#09de9f]"
                />
              </label>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-1">
              {(["baseColor", "activeColor"] as const).map((key) => (
                <label key={key} className="block">
                  <span className="block font-mono text-[11px] text-white/70">{key}</span>
                  <input
                    type="color"
                    value={config[key]}
                    onChange={(e) => onChange({ ...config, [key]: e.target.value })}
                    className="mt-1 h-8 w-full cursor-pointer rounded-md border border-white/20 bg-transparent"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={copy}
              className="flex-1 rounded-full bg-[#683bff] px-3 py-2 text-[13px] font-semibold hover:bg-[#5a2fe8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {copied ? "Copied" : "Copy values"}
            </button>
            <button
              type="button"
              onClick={() => onChange(DOT_GRID_DEFAULTS)}
              className="rounded-full border border-white/25 px-3 py-2 text-[13px] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
}
