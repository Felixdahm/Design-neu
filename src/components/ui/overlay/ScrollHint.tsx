"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after 3.5s (after intro has finished)
    const show = setTimeout(() => setVisible(true), 3500);

    // Hide on first scroll or touch
    function hide() { setVisible(false); }
    window.addEventListener("wheel",     hide, { once: true, passive: true });
    window.addEventListener("touchmove", hide, { once: true, passive: true });

    return () => {
      clearTimeout(show);
      window.removeEventListener("wheel",     hide);
      window.removeEventListener("touchmove", hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position:      "fixed",
            bottom:        "2.5rem",
            left:          "3rem",
            zIndex:        60,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           "0.6rem",
            pointerEvents: "none",
          }}
        >
          {/* Label */}
          <span style={{
            fontFamily:    "monospace",
            fontSize:      "0.5rem",
            letterSpacing: "0.5em",
            color:         "rgba(255,255,255,0.3)",
          }}>
            SCROLL
          </span>

          {/* Animated line with traveling dot */}
          <div style={{ position: "relative", width: "1px", height: "40px", background: "rgba(255,255,255,0.1)" }}>
            <motion.div
              animate={{ y: [0, 32, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position:     "absolute",
                top:          0,
                left:         "-2px",
                width:        "5px",
                height:       "5px",
                borderRadius: "50%",
                background:   "#4FC3F7",
                boxShadow:    "0 0 6px rgba(79,195,247,0.9)",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
