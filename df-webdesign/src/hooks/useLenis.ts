import { useEffect, useRef } from "react";
import Lenis from "lenis";

// Global singleton — one Lenis instance for the whole app
let _lenis: Lenis | null = null;
let _progress = 0;

export function getScrollProgress(): number {
  return _progress;
}

export function useLenis() {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 2.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.7,
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
