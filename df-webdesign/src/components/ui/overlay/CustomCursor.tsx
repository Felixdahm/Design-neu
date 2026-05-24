"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide default cursor everywhere
    document.body.style.cursor = "none";

    const raw  = { x: window.innerWidth / 2,  y: window.innerHeight / 2 };
    const ring = { x: raw.x, y: raw.y };
    let   hovered  = false;
    let   rafId    = 0;

    function onMove(e: MouseEvent) {
      raw.x = e.clientX;
      raw.y = e.clientY;
    }

    function onEnter() { hovered = true; }
    function onLeave() { hovered = false; }

    // Track all interactive elements for cursor style change
    function attachHover() {
      document.querySelectorAll<HTMLElement>("a, button, [role=button], input, textarea, select, label")
        .forEach(el => {
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
        });
    }
    attachHover();

    // Observe DOM changes so dynamically added elements are also tracked
    const observer = new MutationObserver(attachHover);
    observer.observe(document.body, { childList: true, subtree: true });

    function tick() {
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${raw.x}px, ${raw.y}px)`;
      }

      // Ring lerps behind for cinematic drag
      ring.x += (raw.x - ring.x) * 0.12;
      ring.y += (raw.y - ring.y) * 0.12;

      if (ringRef.current) {
        const scale  = hovered ? 1.8 : 1;
        const opaque = hovered ? 0.6 : 0.35;
        ringRef.current.style.transform =
          `translate(${ring.x}px, ${ring.y}px) scale(${scale})`;
        ringRef.current.style.opacity = String(opaque);
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);

    return () => {
      document.body.style.cursor = "";
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, []);

  const base: React.CSSProperties = {
    position:      "fixed",
    top:           0,
    left:          0,
    pointerEvents: "none",
    zIndex:        9999,
    willChange:    "transform",
  };

  return (
    <>
      {/* Dot — instant */}
      <div ref={dotRef} style={{
        ...base,
        width:        "5px",
        height:       "5px",
        borderRadius: "50%",
        background:   "#4FC3F7",
        marginLeft:   "-2.5px",
        marginTop:    "-2.5px",
        boxShadow:    "0 0 6px rgba(79,195,247,0.9)",
      }} />

      {/* Ring — lagged */}
      <div ref={ringRef} style={{
        ...base,
        width:        "28px",
        height:       "28px",
        borderRadius: "50%",
        border:       "1px solid rgba(79,195,247,0.7)",
        marginLeft:   "-14px",
        marginTop:    "-14px",
        opacity:      0.35,
        transition:   "opacity 0.2s",
      }} />
    </>
  );
}
