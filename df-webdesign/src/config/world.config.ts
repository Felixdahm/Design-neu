import * as THREE from "three";

// ─── SCROLL ──────────────────────────────────────────────────────────────────
// Total scroll height in vh units. More = slower, more cinematic.
export const SCROLL_HEIGHT_VH = 700;

// ─── CAMERA PATH ─────────────────────────────────────────────────────────────
// The camera travels through 5 environments along the Z axis.
// These are the world-space positions the camera visits.
// Scroll progress 0→1 maps to these keyframes via cubic bezier.
export const CAMERA_KEYFRAMES = [
  // [x, y, z, lookAt_x, lookAt_y, lookAt_z]
  { progress: 0.0,  pos: [0,     0,    12  ],  target: [0,     0,    0    ] }, // VOID — floating above origin
  { progress: 0.2,  pos: [0,     0,    8   ],  target: [0,     0,    0    ] }, // VOID — drifting in

  // SERVICES — overview shot, then camera follows the helix to each planet
  // Planet world positions = env(-12) + local. Camera 4.5 units in front of each.
  { progress: 0.22, pos: [ 0,    2.5,  -4  ],  target: [ 0,    0,    -18  ] }, // OVERVIEW — full solar system
  { progress: 0.27, pos: [ 2.2,  -0.6, -7.5],  target: [ 2.2,  -0.9, -12  ] }, // P1 SEO       (text below → cam shifted down)
  { progress: 0.32, pos: [ 0.68, 1.6,  -9.5],  target: [ 0.68, 3.1,  -14  ] }, // P2 WEBDESIGN (text above)
  { progress: 0.37, pos: [-1.78, 0.7,  -11.5], target: [-1.78, 2.4,  -16  ] }, // P3 BACKEND   (text above)
  { progress: 0.42, pos: [-1.78,-2.1,  -13.5], target: [-1.78,-2.3,  -18  ] }, // P4 CHATBOT   (text below → cam shifted down)
  { progress: 0.47, pos: [ 0.68,-2.9,  -15.5], target: [ 0.68,-3.1,  -20  ] }, // P5 UI/UX     (text below → cam shifted down)

  { progress: 0.5,  pos: [1,    -0.5,  -20  ], target: [0,     0,    -28  ] }, // PORTFOLIO — sweeping right
  { progress: 0.65, pos: [0,     1,    -35  ], target: [0,     0,    -42  ] }, // AI LAB — rising
  { progress: 0.85, pos: [0,     0,    -50  ], target: [0,     0,    -58  ] }, // TERMINAL — dead center
  { progress: 1.0,  pos: [0,     0,    -55  ], target: [0,     0,    -58  ] }, // TERMINAL — settled
] as const;

// ─── ENVIRONMENTS ────────────────────────────────────────────────────────────
// World-space Z position where each environment is centered.
// Negative Z = forward in Three.js (camera looks toward -Z).
export const ENVIRONMENTS = {
  void:      { z: 0 },
  services:  { z: -12 },
  portfolio: { z: -28 },
  aiLab:     { z: -42 },
  terminal:  { z: -58 },
} as const;

// ─── COLORS ──────────────────────────────────────────────────────────────────
export const COLORS = {
  background:    "#000000",
  fogColor:      "#050508",
  accentBlue:    "#4FC3F7",
  accentGlow:    "#0D47A1",
  glassWhite:    "rgba(255,255,255,0.04)",
  glassBorder:   "rgba(255,255,255,0.08)",
  textPrimary:   "#FFFFFF",
  textSecondary: "#6B7280",
  hologram:      "#00E5FF",
  terminal:      "#00FF88",
} as const;

// ─── THREE.js COLOR OBJECTS ───────────────────────────────────────────────────
export const THREE_COLORS = {
  background:  new THREE.Color("#000000"),
  fog:         new THREE.Color("#050508"),
  accentBlue:  new THREE.Color("#4FC3F7"),
  glowBlue:    new THREE.Color("#0D47A1"),
  hologram:    new THREE.Color("#00E5FF"),
  terminal:    new THREE.Color("#00FF88"),
  particleGlow:new THREE.Color("#4FC3F7"),
} as const;

// ─── PARTICLES ───────────────────────────────────────────────────────────────
export const PARTICLES = {
  count: 8000,
  spread: 80,
  size: 0.015,
  speed: 0.0002,
} as const;

// ─── FOG ─────────────────────────────────────────────────────────────────────
export const FOG = {
  near: 8,
  far: 60,
} as const;

// ─── EASING ──────────────────────────────────────────────────────────────────
// GSAP easing strings used throughout — all cinematic slow ease
export const EASE = {
  cinematic:  "power3.inOut",
  drift:      "power1.inOut",
  snap:       "expo.out",
  enter:      "power4.out",
} as const;

// ─── TYPOGRAPHY ──────────────────────────────────────────────────────────────
export const FONTS = {
  display: "var(--font-display)",   // Large cinematic headings
  mono:    "var(--font-mono)",      // HUD / terminal elements
  body:    "var(--font-body)",      // Body copy
} as const;

// ─── TIMING ──────────────────────────────────────────────────────────────────
export const TIMING = {
  introDelay: 1200,    // ms before intro animation starts
  introFade:  2000,    // ms for loading screen to fade
  hoverLift:  0.3,     // s for hover lift animation
} as const;
