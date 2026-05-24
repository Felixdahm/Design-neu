"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "black" | "reveal" | "hold" | "exit";

export function LoadingScreen() {
  const [visible,  setVisible]  = useState(true);
  const [phase,    setPhase]    = useState<Phase>("black");
  const [loaded,   setLoaded]   = useState(false);

  // ── Silent loading progress in background ───────────────────────────────
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += p < 85 ? Math.random() * 12 + 4 : Math.random() * 2 + 0.5;
      if (p >= 100) { clearInterval(iv); setLoaded(true); }
    }, 60);
    return () => clearInterval(iv);
  }, []);

  // ── Cinematic sequence (starts once loaded) ──────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    // 0.6s black → logo reveal → 1.8s hold → exit
    const t1 = setTimeout(() => setPhase("reveal"), 200);
    const t2 = setTimeout(() => {
      setPhase("hold");
      window.dispatchEvent(new Event("intro-hold"));
    }, 200 + 900);
    const t3 = setTimeout(() => setPhase("exit"),   200 + 900 + 700);
    const t4 = setTimeout(() => setVisible(false),  200 + 900 + 700 + 800);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [loaded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         200,
            background:     "#000",
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "1.8rem",
          }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* ── Logo ── */}
          <motion.img
            src="/logo/df-logo.jpg"
            alt="DF Webdesign"
            initial={{ opacity: 0, scale: 0.94, filter: "blur(12px) invert(1) hue-rotate(180deg)" }}
            animate={phase === "black" ? {} : {
              opacity: 1,
              scale:   1,
              filter:  "blur(0px) invert(1) hue-rotate(180deg)",
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "72px", width: "auto", objectFit: "contain" }}
          />

          {/* ── Tagline — fades in slightly after logo ── */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={phase === "black" ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily:    "monospace",
              fontSize:      "0.58rem",
              letterSpacing: "0.55em",
              color:         "rgba(255,255,255,0.28)",
              userSelect:    "none",
            }}
          >
            WEBDESIGN
          </motion.div>

          {/* ── Thin accent line under tagline ── */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={phase === "black" ? {} : { scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width:          "40px",
              height:         "1px",
              background:     "#4FC3F7",
              transformOrigin:"center",
              boxShadow:      "0 0 8px rgba(79,195,247,0.8)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
