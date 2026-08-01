"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/* All dev overlays stack on the right edge. Only one can be expanded; opening
   one collapses the other. */

type PanelId = string;
const Ctx = createContext<{ open: PanelId | null; setOpen: (id: PanelId | null) => void }>({
  open: null,
  setOpen: () => {},
});

export function DevOverlayStack({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<PanelId | null>(null);
  return (
    <Ctx.Provider value={{ open, setOpen }}>
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(21rem,calc(100vw-2rem))] flex-col items-stretch gap-2">
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function DevOverlay({
  id,
  title,
  children,
}: {
  id: PanelId;
  title: string;
  children: ReactNode;
}) {
  const { open, setOpen } = useContext(Ctx);
  const expanded = open === id;

  return (
    <section className="pointer-events-auto rounded-2xl border border-white/15 bg-[#130738]/90 text-white shadow-lift backdrop-blur-md">
      <button
        type="button"
        onClick={() => setOpen(expanded ? null : id)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
          {title}
        </span>
        <span aria-hidden className="font-mono text-[11px] text-white/70">
          {expanded ? "hide" : "show"}
        </span>
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}
