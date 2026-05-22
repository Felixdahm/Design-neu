"use client";

import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "VOID",      href: "#void" },
  { label: "SERVICES",  href: "#services" },
  { label: "WORK",      href: "#portfolio" },
  { label: "AI LAB",    href: "#ailab" },
  { label: "CONTACT",   href: "#contact" },
];

export function Navigation() {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo wordmark */}
      <motion.div className="text-white font-mono text-sm tracking-[0.3em] opacity-90">
        DF WEBDESIGN
      </motion.div>

      {/* Nav links */}
      <ul className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="text-[10px] tracking-[0.4em] text-white/40 hover:text-white/90 transition-colors duration-500 font-mono"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <motion.a
        href="#contact"
        className="text-[10px] tracking-[0.3em] font-mono border border-white/10 text-white/60 hover:text-white hover:border-white/30 px-5 py-2.5 transition-all duration-500"
        whileHover={{ scale: 1.02 }}
      >
        START PROJECT
      </motion.a>
    </motion.nav>
  );
}
