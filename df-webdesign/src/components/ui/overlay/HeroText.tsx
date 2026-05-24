"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getScrollProgress } from "@/hooks/useLenis";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.16, delayChildren: 0.05 } },
};

const line = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

export function HeroText() {
  const [mounted, setMounted] = useState(false);
  const wrapRef  = useRef<HTMLDivElement>(null);

  // Mount when LoadingScreen enters "hold" — text hides behind curtain and is revealed as it lifts
  useEffect(() => {
    function onHold() { setMounted(true); }
    window.addEventListener("intro-hold", onHold, { once: true });
    return () => window.removeEventListener("intro-hold", onHold);
  }, []);

  // Scroll-driven fade — kicks in after stagger animation finishes (~1.2s)
  useEffect(() => {
    if (!mounted) return;
    let rafId: number;
    const tid = setTimeout(() => {
      const run = () => {
        const p = getScrollProgress();
        const o = p < 0.06 ? 1 : p > 0.17 ? 0 : 1 - (p - 0.06) / 0.11;
        if (wrapRef.current) wrapRef.current.style.opacity = String(o);
        rafId = requestAnimationFrame(run);
      };
      rafId = requestAnimationFrame(run);
    }, 1200);
    return () => { clearTimeout(tid); cancelAnimationFrame(rafId); };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <motion.div
      ref={wrapRef}
      variants={container}
      initial="hidden"
      animate="visible"
      style={{
        position:      "fixed",
        bottom:        "10%",
        left:          "50%",
        transform:     "translateX(-50%)",
        zIndex:        30,
        textAlign:     "center",
        pointerEvents: "none",
        fontFamily:    "monospace",
        whiteSpace:    "nowrap",
      }}
    >
      {/* Chapter tag */}
      <motion.div variants={line} style={{
        fontSize:       "0.55vw",
        letterSpacing:  "0.55em",
        color:          "rgba(79,195,247,0.55)",
        marginBottom:   "1.1vw",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "0.6vw",
      }}>
        <span style={{ opacity: 0.4 }}>—</span>
        <span>01</span>
        <span style={{
          display:       "inline-block",
          width:         "3.5vw",
          height:        "1px",
          background:    "rgba(79,195,247,0.22)",
          verticalAlign: "middle",
        }} />
      </motion.div>

      {/* Line 1 */}
      <motion.div variants={line} style={{
        fontSize:      "3.6vw",
        color:         "#ffffff",
        fontWeight:    200,
        letterSpacing: "0.10em",
        lineHeight:    1.05,
        textShadow:    "0 0 60px rgba(79,195,247,0.10)",
      }}>
        WEBSEITEN DIE
      </motion.div>

      {/* Line 2 */}
      <motion.div variants={line} style={{
        fontSize:      "3.6vw",
        color:         "#ffffff",
        fontWeight:    200,
        letterSpacing: "0.10em",
        lineHeight:    1.05,
        marginBottom:  "1.4vw",
        textShadow:    "0 0 60px rgba(79,195,247,0.10)",
      }}>
        WIRKEN.
      </motion.div>

      {/* Accent line */}
      <motion.div variants={line} style={{
        width:     "36px",
        height:    "1px",
        background:"#4FC3F7",
        margin:    "0 auto 1.2vw",
        boxShadow: "0 0 8px rgba(79,195,247,0.7)",
      }} />

      {/* Subline */}
      <motion.div variants={line} style={{
        fontSize:      "0.58vw",
        color:         "rgba(255,255,255,0.20)",
        letterSpacing: "0.38em",
      }}>
        LEADS GENERIEREN&nbsp;&nbsp;·&nbsp;&nbsp;KUNDEN BEEINDRUCKEN
      </motion.div>
    </motion.div>
  );
}
