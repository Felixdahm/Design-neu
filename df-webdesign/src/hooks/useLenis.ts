import { useEffect, useRef } from "react";
import Lenis from "lenis";

// Global singleton — one Lenis instance for the whole app
let _lenis: Lenis | null = null;
let _progress = 0;
let _lastInputTime = 0;

if (typeof window !== "undefined") {
  window.addEventListener("wheel",      () => { _lastInputTime = Date.now(); }, { passive: true });
  window.addEventListener("touchmove",  () => { _lastInputTime = Date.now(); }, { passive: true });
}

export function getScrollProgress(): number  { return _progress; }
export function getIsScrolling():    boolean  { return Date.now() - _lastInputTime < 300; }

export function scrollToProgress(progress: number) {
  if (!_lenis) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  _lenis.scrollTo(progress * max, { duration: 2.0 });
}

// ── Snap zones ────────────────────────────────────────────────────────────────
const PLANET_SNAPS    = [0.27, 0.32, 0.37, 0.42, 0.47] as const;
const SNAP_ZONE_IN    = 0.22;  // planet zone entry
const SNAP_ZONE_OUT   = 0.50;  // planet zone exit
const PROZESS_ZONE_IN = 0.60;  // from here a single scroll down jumps to contact
const PROZESS_ZONE_OUT= 0.88;  // above this = already in/past terminal, free scroll

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

    // ── Snap system ─────────────────────────────────────────────────────────
    let snapIdx  = -1;   // which planet we're currently stopped at (-1 = not snapped)
    let snapping = false; // true while a snap animation is in progress

    function doSnap(targetProgress: number, duration = 1.2) {
      snapping = true;
      lenis.stop();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      (lenis.scrollTo as Function)(targetProgress * max, {
        duration,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        force: true,
      });
      setTimeout(() => {
        lenis.start();
        snapping = false;
      }, duration * 1000 + 300);
    }

    function onSnapWheel(e: WheelEvent) {
      const p   = _progress;
      const dir = e.deltaY > 0 ? 1 : -1;

      // Scrolling up → always free, cancel any running snap
      if (dir < 0) {
        if (snapping) { lenis.start(); snapping = false; }
        snapIdx = -1;
        return;
      }

      // ── Prozess → Contact jump ───────────────────────────────────────────
      if (p >= PROZESS_ZONE_IN && p < PROZESS_ZONE_OUT) {
        e.preventDefault();
        if (!snapping) doSnap(1.0, 2.0);  // cinematic long jump
        return;
      }

      const inZone = p > SNAP_ZONE_IN - 0.03 && p < SNAP_ZONE_OUT + 0.01;
      if (!inZone) { snapIdx = -1; return; }

      // Block further input while a snap is animating
      if (snapping) { e.preventDefault(); return; }

      // Determine the next snap target BEFORE calling preventDefault.
      // If there is nothing left to snap to, let Lenis scroll freely.
      let target: number;
      let nextIdx: number;

      if (snapIdx === -1) {
        // Re-entering the zone: find the first planet strictly ahead of current position
        let found = -1;
        for (let i = 0; i < PLANET_SNAPS.length; i++) {
          if (PLANET_SNAPS[i] > p + 0.005) { found = i; break; }
        }
        if (found === -1) {
          // Past all planets — release scroll, no preventDefault
          snapIdx = -1;
          return;
        }
        nextIdx = found;
        target  = PLANET_SNAPS[found];
      } else {
        const next = snapIdx + 1;
        if (next >= PLANET_SNAPS.length) {
          nextIdx = -1;
          target  = SNAP_ZONE_OUT;
        } else {
          nextIdx = next;
          target  = PLANET_SNAPS[next];
        }
      }

      // We have a target — take over the scroll
      e.preventDefault();
      snapIdx = nextIdx;
      doSnap(target);
    }

    window.addEventListener("wheel", onSnapWheel, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("wheel", onSnapWheel);
      lenis.destroy();
      _lenis = null;
      _progress = 0;
    };
  }, []);
}
