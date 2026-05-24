"use client";

import { useEffect, useRef } from "react";

// Must match ringColor in ServicesWorld SERVICES array
const PLANET_COLORS = ["#00FF88", "#4FC3F7", "#1565C0", "#00BCD4", "#AB47BC"] as const;

export function PlanetArrival() {
  const burstRef   = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);

  useEffect(() => {
    function onSnap(e: Event) {
      const idx   = (e as CustomEvent<{ planetIdx: number }>).detail.planetIdx;
      const color = PLANET_COLORS[idx] ?? "#4FC3F7";

      const burst   = burstRef.current;
      const vignette = vignetteRef.current;
      if (!burst || !vignette) return;

      cancelAnimationFrame(rafRef.current);

      // Central burst: radial glow expanding from center
      burst.style.background =
        `radial-gradient(ellipse at center, ${color}50 0%, ${color}18 35%, transparent 65%)`;
      burst.style.opacity = "1";
      burst.style.transform = "scale(0.7)";

      // Edge vignette in planet color
      vignette.style.boxShadow = `inset 0 0 120px ${color}28`;
      vignette.style.opacity   = "1";

      let start: number | null = null;
      const DURATION = 1000;

      function animate(ts: number) {
        if (!start) start = ts;
        const t  = Math.min((ts - start) / DURATION, 1);
        // Ease-out cubic
        const e2 = 1 - Math.pow(1 - t, 3);

        if (burst) {
          burst.style.opacity   = String(1 - e2);
          burst.style.transform = `scale(${0.7 + e2 * 0.7})`;
        }
        if (vignette) {
          vignette.style.opacity = String((1 - e2) * 0.9);
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener("planet-snap", onSnap);
    return () => {
      window.removeEventListener("planet-snap", onSnap);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const fixed: React.CSSProperties = {
    position:      "fixed",
    inset:         0,
    pointerEvents: "none",
    zIndex:        40,
    opacity:       0,
  };

  return (
    <>
      {/* Expanding radial burst from center */}
      <div ref={burstRef} style={{ ...fixed, transform: "scale(0.7)" }} />
      {/* Colored edge vignette */}
      <div ref={vignetteRef} style={fixed} />
    </>
  );
}
