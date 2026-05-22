"use client";

import { useRef, useEffect } from "react";
import { getScrollProgress } from "@/hooks/useLenis";

const WAYPOINTS = [
  { label: "VOID",     at: 0.05 },
  { label: "SERVICES", at: 0.30 },
  { label: "WORK",     at: 0.50 },
  { label: "AI LAB",   at: 0.65 },
  { label: "TERMINAL", at: 0.85 },
];

export function ScrollProgress() {
  const lineRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const rafRef   = useRef<number>(0);
  const lastLabel = useRef("VOID");

  useEffect(() => {
    function tick() {
      const p = getScrollProgress();

      if (lineRef.current) {
        lineRef.current.style.height = `${p * 100}%`;
      }

      let active = WAYPOINTS[0].label;
      for (const wp of WAYPOINTS) {
        if (p >= wp.at - 0.04) active = wp.label;
      }
      if (active !== lastLabel.current && labelRef.current) {
        lastLabel.current = active;
        labelRef.current.textContent = active;
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      <div className="w-px h-32 bg-white/10 relative overflow-hidden">
        <div
          ref={lineRef}
          className="absolute top-0 left-0 w-full bg-[#4FC3F7]"
          style={{ height: "0%", transition: "none" }}
        />
      </div>
      <span
        ref={labelRef}
        className="text-[8px] tracking-[0.5em] text-white/30 font-mono rotate-90 origin-center mt-6"
      >
        VOID
      </span>
    </div>
  );
}
