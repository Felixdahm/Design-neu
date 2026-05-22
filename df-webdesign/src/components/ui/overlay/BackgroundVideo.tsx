"use client";

import { useEffect, useRef } from "react";

// The cosmic nebula video sits BEHIND the Three.js canvas.
// The canvas is transparent — 3D objects float IN the nebula world.
// This creates the "you are inside a living universe" feeling.

export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      document.addEventListener("click", () => v.play(), { once: true });
    });
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: "#000",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.75, // Subtle — let 3D elements dominate
        }}
      >
        <source src="/bg-nebula.mp4" type="video/mp4" />
      </video>

      {/* Dark vignette overlay — frames the center, cinematic */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
