"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/* One bar that slides between items, the way the live site behaves.
   Figma: the rule sits 12px inside each edge of the active item. */
const EDGE_INSET = 12;

export function useSlidingUnderline<T extends HTMLElement>(activeIndex: number) {
  const trackRef = useRef<T>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = track.querySelectorAll<HTMLElement>("[data-underline-item]");
    const el = items[activeIndex];
    if (!el) return setBar(null);
    const t = track.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setBar({
      left: r.left - t.left + EDGE_INSET,
      width: Math.max(0, r.width - EDGE_INSET * 2),
    });
  }, [activeIndex]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    // Re-measure once webfonts land, otherwise the bar is sized to the fallback.
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [measure]);

  return { trackRef, bar };
}

export function UnderlineBar({ bar }: { bar: { left: number; width: number } | null }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-0 h-[1.5px] rounded-full bg-white transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      style={{
        left: bar?.left ?? 0,
        width: bar?.width ?? 0,
        opacity: bar ? 1 : 0,
      }}
    />
  );
}
