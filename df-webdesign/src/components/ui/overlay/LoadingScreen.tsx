"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [progress, setProgress]   = useState(0);
  const [visible,  setVisible]    = useState(true);
  const [phase,    setPhase]      = useState<"loading" | "ready" | "exit">("loading");

  useEffect(() => {
    // Fast ramp to 85%, then slow down for dramatic effect
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        const increment = p < 85 ? Math.random() * 12 + 4 : Math.random() * 2 + 0.5;
        return Math.min(p + increment, 100);
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setPhase("ready"), 300);
      setTimeout(() => setPhase("exit"),  1000);
      setTimeout(() => setVisible(false), 2400);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* DF Logo */}
          <motion.div
            className="font-mono tracking-[0.6em] text-white mb-10 text-lg select-none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            DF
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="w-24 h-px bg-white/8 relative overflow-hidden"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 bg-[#4FC3F7]"
              style={{ width: `${Math.min(progress, 100)}%`, transition: "width 80ms linear" }}
            />
          </motion.div>

          {/* Counter */}
          <motion.div
            className="font-mono text-[9px] tracking-[0.5em] text-white/20 mt-4 tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {String(Math.min(Math.floor(progress), 100)).padStart(3, "0")}
          </motion.div>

          {/* "ENTERING" on ready */}
          <AnimatePresence>
            {phase === "ready" && (
              <motion.div
                className="absolute bottom-12 font-mono text-[8px] tracking-[0.8em] text-white/30"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                ENTERING UNIVERSE
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
