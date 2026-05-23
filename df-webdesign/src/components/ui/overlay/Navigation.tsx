"use client";

import { motion } from "framer-motion";
import { scrollToProgress } from "@/hooks/useLenis";

const NAV_ITEMS = [
  { label: "VOID",     progress: 0.0  },
  { label: "SERVICES", progress: 0.35 },
  { label: "WORK",     progress: 0.5  },
  { label: "PROZESS",  progress: 0.65 },
  { label: "CONTACT",  progress: 0.85 },
];

export function Navigation() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <motion.button
        onClick={() => scrollToProgress(0)}
        className="flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0 group"
      >
        <img
          src="/df-logo.jpg"
          alt="DF Webdesign"
          style={{
            height: "52px",
            width: "auto",
            objectFit: "contain",
            filter: "invert(1) hue-rotate(180deg)",
            mixBlendMode: "screen",
          }}
          className="opacity-90 group-hover:opacity-100 transition-opacity duration-500"
        />
      </motion.button>

      {/* Nav links */}
      <ul className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <button
              onClick={() => scrollToProgress(item.progress)}
              className="text-[10px] tracking-[0.4em] text-white/40 hover:text-white/90 transition-colors duration-500 font-mono cursor-pointer bg-transparent border-0 p-0"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <motion.button
        onClick={() => scrollToProgress(0.85)}
        className="text-[10px] tracking-[0.3em] font-mono border border-white/10 text-white/60 hover:text-white hover:border-white/30 px-5 py-2.5 transition-all duration-500 cursor-pointer bg-transparent"
        whileHover={{ scale: 1.02 }}
      >
        START PROJECT
      </motion.button>
    </motion.nav>
  );
}
