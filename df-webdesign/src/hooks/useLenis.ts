import { useEffect, useRef } from "react";
import Lenis from "lenis";

let _lenis: Lenis | null = null;
let _progress = 0;
let _lastInputTime = 0;

if (typeof window !== "undefined") {
  window.addEventListener("wheel",     () => { _lastInputTime = Date.now(); }, { passive: true });
  window.addEventListener("touchmove", () => { _lastInputTime = Date.now(); }, { passive: true });
}

export function getScrollProgress(): number { return _progress; }
export function getIsScrolling():    boolean { return Date.now() - _lastInputTime < 300; }

export function scrollToProgress(progress: number) {
  if (!_lenis) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  _lenis.scrollTo(progress * max, { duration: 2.0 });
}

// ── Snap zones ────────────────────────────────────────────────────────────────
const PLANET_SNAPS    = [0.27, 0.32, 0.37, 0.42, 0.47] as const;
const SNAP_ZONE_IN    = 0.22;
const SNAP_ZONE_OUT   = 0.50;
const PROZESS_ZONE_IN = 0.70;
const PROZESS_ZONE_OUT= 0.88;

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

    // ── Shared snap state ─────────────────────────────────────────────────────
    let snapIdx  = -1;
    let snapping = false;

    function doSnap(targetProgress: number, duration = 1.2) {
      snapping = true;
      lenis.stop();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      (lenis.scrollTo as Function)(targetProgress * max, {
        duration,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
        force: true,
      });
      setTimeout(() => { lenis.start(); snapping = false; }, duration * 1000 + 300);
    }

    // Returns {target, nextIdx, duration} if a snap should fire, null if scroll is free
    function resolveSnap(p: number, dir: number): { target: number; nextIdx: number; duration: number } | null {
      if (dir < 0) return null;

      // Hero → Services overview
      if (p < SNAP_ZONE_IN) return { target: SNAP_ZONE_IN, nextIdx: -1, duration: 1.4 };

      // Prozess → Contact
      if (p >= PROZESS_ZONE_IN && p < PROZESS_ZONE_OUT) return { target: 1.0, nextIdx: -1, duration: 2.0 };

      // Planet zone
      const inZone = p > SNAP_ZONE_IN - 0.03 && p < SNAP_ZONE_OUT + 0.01;
      if (!inZone) return null;

      if (snapIdx === -1) {
        let found = -1;
        for (let i = 0; i < PLANET_SNAPS.length; i++) {
          if (PLANET_SNAPS[i] > p + 0.005) { found = i; break; }
        }
        if (found === -1) return null;
        return { target: PLANET_SNAPS[found], nextIdx: found, duration: 1.2 };
      } else {
        const next = snapIdx + 1;
        if (next >= PLANET_SNAPS.length) return { target: SNAP_ZONE_OUT, nextIdx: -1, duration: 1.2 };
        return { target: PLANET_SNAPS[next], nextIdx: next, duration: 1.2 };
      }
    }

    // ── Wheel handler ─────────────────────────────────────────────────────────
    function onWheel(e: WheelEvent) {
      const dir = e.deltaY > 0 ? 1 : -1;
      const p   = _progress;

      if (dir < 0) {
        if (snapping) { lenis.start(); snapping = false; }
        snapIdx = -1;
        return;
      }

      if (snapping) { e.preventDefault(); return; }

      const snap = resolveSnap(p, dir);
      if (!snap) { snapIdx = -1; return; }

      e.preventDefault();
      snapIdx = snap.nextIdx;
      doSnap(snap.target, snap.duration);
    }

    // ── Touch handler ─────────────────────────────────────────────────────────
    let touchStartY  = 0;
    let touchHandled = false;

    function onTouchStart(e: TouchEvent) {
      touchStartY  = e.touches[0].clientY;
      touchHandled = false;
    }

    function onTouchMove(e: TouchEvent) {
      // Keep blocking scroll for the rest of a handled gesture
      if (touchHandled) { e.preventDefault(); return; }

      const deltaY = touchStartY - e.touches[0].clientY;
      if (Math.abs(deltaY) < 12) return; // wait for intent to be clear

      const dir = deltaY > 0 ? 1 : -1;
      const p   = _progress;

      if (dir < 0) {
        if (snapping) { lenis.start(); snapping = false; }
        snapIdx = -1;
        return;
      }

      if (snapping) { e.preventDefault(); touchHandled = true; return; }

      const snap = resolveSnap(p, dir);
      if (!snap) { snapIdx = -1; return; }

      e.preventDefault();
      touchHandled = true;
      snapIdx = snap.nextIdx;
      doSnap(snap.target, snap.duration);
    }

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchmove",  onTouchMove,  { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove",  onTouchMove);
      lenis.destroy();
      _lenis    = null;
      _progress = 0;
    };
  }, []);
}
