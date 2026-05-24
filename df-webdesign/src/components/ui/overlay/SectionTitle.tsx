"use client";

import { useEffect, useRef, useState } from "react";
import { getScrollProgress } from "@/hooks/useLenis";

const SECTIONS = [
  { min: 0.22, max: 0.45, num: "02", title: "SERVICES",  sub: "Cinematic digital experiences" },
  { min: 0.42, max: 0.60, num: "03", title: "PORTFOLIO", sub: "Our work in the world" },
  { min: 0.56, max: 0.72, num: "04", title: "PROZESS",   sub: "Von der Idee zum Launch" },
] as const;

type Section = typeof SECTIONS[number] | null;

export function SectionTitle() {
  const [section, setSection]   = useState<Section>(null);
  const [visible, setVisible]   = useState(false);
  const [animKey, setAnimKey]   = useState(0);
  const prevIdx = useRef(-1);
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    function tick() {
      const p = getScrollProgress();

      let idx = -1;
      for (let i = 0; i < SECTIONS.length; i++) {
        const s = SECTIONS[i];
        const center = (s.min + s.max) / 2;
        const dist   = Math.abs(p - center);
        const half   = (s.max - s.min) / 2;
        if (dist < half) {
          // Prefer the section whose center is closest
          if (idx === -1) idx = i;
          else {
            const prevCenter = (SECTIONS[idx].min + SECTIONS[idx].max) / 2;
            if (Math.abs(p - center) < Math.abs(p - prevCenter)) idx = i;
          }
        }
      }

      if (idx !== prevIdx.current) {
        prevIdx.current = idx;
        if (idx === -1) {
          setVisible(false);
        } else {
          setSection(SECTIONS[idx]);
          setVisible(true);
          setAnimKey(k => k + 1);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!section) return null;

  return (
    <div
      key={animKey}
      style={{
        position: "fixed",
        left:     "5.5%",
        bottom:   "8%",
        zIndex:   40,
        fontFamily: "monospace",
        pointerEvents: "none",
        animation: visible
          ? "sectionIn 0.9s cubic-bezier(0.16,1,0.3,1) forwards"
          : "sectionOut 0.5s ease forwards",
      }}
    >
      {/* Chapter tag */}
      <div style={{
        fontSize: "0.55vw",
        letterSpacing: "0.55em",
        color: "rgba(0,255,136,0.55)",
        marginBottom: "0.6vw",
        display: "flex",
        alignItems: "center",
        gap: "0.5vw",
      }}>
        <span style={{ opacity: 0.5 }}>—</span>
        <span>{section.num}</span>
        <span style={{
          display: "inline-block",
          width: "4vw",
          height: "1px",
          background: "rgba(0,255,136,0.25)",
          verticalAlign: "middle",
        }} />
      </div>

      {/* Section title */}
      <div style={{
        fontSize: "3.2vw",
        color: "#ffffff",
        fontWeight: 200,
        letterSpacing: "0.12em",
        lineHeight: 1,
        marginBottom: "0.8vw",
        textShadow: "0 0 40px rgba(79,195,247,0.12)",
      }}>
        {section.title}
      </div>

      {/* Tagline */}
      <div style={{
        fontSize: "0.65vw",
        color: "rgba(255,255,255,0.22)",
        letterSpacing: "0.28em",
      }}>
        {section.sub}
      </div>
    </div>
  );
}
