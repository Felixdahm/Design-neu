"use client";

import { useEffect, useRef } from "react";
import { getScrollProgress } from "@/hooks/useLenis";

export function BackgroundVideo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const smoothTime = useRef(0);
  const isSeeking = useRef(false);
  const lastSeekTime = useRef(-1);

  useEffect(() => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function drawFrame() {
      ctx.drawImage(v!, 0, 0, window.innerWidth, window.innerHeight);
    }

    function seekTo(time: number) {
      if (isSeeking.current) return;
      isSeeking.current = true;
      lastSeekTime.current = time;
      v!.currentTime = time;

      if ("requestVideoFrameCallback" in v!) {
        // Chrome/Edge: fires exactly when new frame is decoded and ready
        (v as any).requestVideoFrameCallback(() => {
          drawFrame();
          isSeeking.current = false;
        });
      } else {
        // Safari fallback
        v!.addEventListener("seeked", () => {
          drawFrame();
          isSeeking.current = false;
        }, { once: true });
      }
    }

    let lastTimestamp = 0;

    function tick(timestamp: number) {
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      if (v!.readyState >= 2 && v!.duration && delta > 0) {
        const targetTime = getScrollProgress() * v!.duration;
        smoothTime.current += (targetTime - smoothTime.current) * Math.min(delta * 5, 1);

        const diff = Math.abs(smoothTime.current - lastSeekTime.current);
        if (diff > 0.033 && !isSeeking.current) {
          seekTo(smoothTime.current);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    function start() {
      drawFrame();
      rafRef.current = requestAnimationFrame(tick);
    }

    if (v.readyState >= 2) {
      start();
    } else {
      v.addEventListener("canplay", start, { once: true });
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#000005" }}>
      {/* Hidden — only used for decoding, canvas renders the frames */}
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
        src="/bg-space-journey-seekable.mp4"
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.8,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
