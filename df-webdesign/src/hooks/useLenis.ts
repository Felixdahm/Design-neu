import { useEffect, useRef } from "react";
import Lenis from "lenis";

// Global singleton — one Lenis instance for the whole app
let _lenis: Lenis | null = null;
let _progress = 0;
// Track actual wheel/touch input — NOT Lenis scroll events which fire during easing too
let _lastInputTime = 0;

if (typeof window !== "undefined") {
  window.addEventListener("wheel",      () => { _lastInputTime = Date.now(); }, { passive: true });
  window.addEventListener("touchmove",  () => { _lastInputTime = Date.now(); }, { passive: true });
}

export function getScrollProgress(): number {
  return _progress;
}

// True only within 300ms of actual user wheel/touch input
export function getIsScrolling(): boolean {
  return Date.now() - _lastInputTime < 300;
}

export function scrollToProgress(progress: number) {
  if (!_lenis) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  _lenis.scrollTo(progress * maxScroll, { duration: 2.0 });
}

export function useLenis() {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
    });

    _lenis = lenis;

    lenis.on("scroll", ({ progress }: { progress: number }) => {
      _progress = progress;
    });

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      _lenis = null;
      _progress = 0;
    };
  }, []);
}
