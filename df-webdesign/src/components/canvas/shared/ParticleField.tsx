"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { THREE_COLORS } from "@/config/world.config";
import { getPerformanceTier } from "@/lib/performanceTier";

const tier   = getPerformanceTier();
const COUNTS = tier === "low"
  ? { bg: 1800, mid: 500, fg: 80 }
  : { bg: 6000, mid: 2000, fg: 300 };

// ─── PARTICLE PHILOSOPHY ──────────────────────────────────────────────────────
// Three distinct particle layers at different depths:
//
//   LAYER 1 — DEEP BACKGROUND (8000 particles)
//     Very small, slow drift, low opacity. Creates the "infinite universe" feel.
//     The majority of particles. Establishes scale.
//
//   LAYER 2 — MID FIELD (2000 particles)
//     Medium size, moderate motion, blue-tinted.
//     These are the ones you notice. The "atmosphere."
//
//   LAYER 3 — FOREGROUND DUST (400 particles)
//     Large, very slow, high opacity. Floats in front of objects.
//     Creates depth separation. Like dust motes in a beam of light.
//
// All layers use additive blending — they glow, they don't cover.
// All layers use the render loop for animation — no React re-renders.

function useParticleLayer(config: {
  count: number;
  spread: [number, number, number];  // [x, y, z]
  sizeRange: [number, number];
  driftSpeed: number;
  driftAmount: number;
  color: THREE.Color;
  opacityRange: [number, number];
  zOffset: number;                   // Center Z of the distribution
}) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, sizes, phases } = useMemo(() => {
    const c = config.count;
    const positions = new Float32Array(c * 3);
    const sizes = new Float32Array(c);
    const phases = new Float32Array(c);

    for (let i = 0; i < c; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * config.spread[0];
      positions[i3 + 1] = (Math.random() - 0.5) * config.spread[1];
      positions[i3 + 2] = (Math.random() - 0.5) * config.spread[2] + config.zOffset;
      sizes[i]  = config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]);
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, sizes, phases };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    g.setAttribute("size",     new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("phase",    new THREE.BufferAttribute(phases, 1));
    return g;
  }, [positions, sizes, phases]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:     { value: 0 },
      uColor:    { value: config.color.clone() },
      uOpacityMin: { value: config.opacityRange[0] },
      uOpacityMax: { value: config.opacityRange[1] },
      uDriftAmt:   { value: config.driftAmount },
      uDriftSpeed: { value: config.driftSpeed },
    },
    vertexShader: `
      attribute float size;
      attribute float phase;
      uniform float uTime;
      uniform float uDriftAmt;
      uniform float uDriftSpeed;
      varying float vSize;
      varying float vPhase;

      void main() {
        vSize  = size;
        vPhase = phase;

        vec3 pos = position;
        // Organic 3D drift using offset sine waves per axis
        pos.x += sin(uTime * uDriftSpeed + phase) * uDriftAmt;
        pos.y += cos(uTime * uDriftSpeed * 0.7 + phase * 1.3) * uDriftAmt * 0.6;
        pos.z += sin(uTime * uDriftSpeed * 0.4 + phase * 0.8) * uDriftAmt * 0.3;

        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (250.0 / -mvPos.z);
        gl_Position  = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3  uColor;
      uniform float uOpacityMin;
      uniform float uOpacityMax;
      varying float vSize;
      varying float vPhase;

      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;

        // Soft glow: bright center, transparent edge
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha *= mix(uOpacityMin, uOpacityMax, vSize * 15.0);
        alpha  = clamp(alpha, 0.0, 1.0);

        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent:  true,
    depthWrite:   false,
    blending:     THREE.AdditiveBlending,
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  return { meshRef, geo, mat };
}

// ─── LAYER 1 — DEEP BACKGROUND ────────────────────────────────────────────────
function BackgroundParticles() {
  const { meshRef, geo, mat } = useParticleLayer({
    count:        COUNTS.bg,
    spread:       [90, 30, 80],
    sizeRange:    [0.008, 0.025],
    driftSpeed:   0.08,
    driftAmount:  0.04,
    color:        new THREE.Color("#1a2a3a"),
    opacityRange: [0.1, 0.4],
    zOffset:      -30,
  });

  useFrame(({ clock }) => {
    (mat.uniforms.uTime as THREE.IUniform<number>).value = clock.getElapsedTime();
  });

  return <points ref={meshRef} geometry={geo} material={mat} />;
}

// ─── LAYER 2 — MID FIELD ──────────────────────────────────────────────────────
function MidFieldParticles() {
  const { meshRef, geo, mat } = useParticleLayer({
    count:        COUNTS.mid,
    spread:       [60, 20, 70],
    sizeRange:    [0.015, 0.045],
    driftSpeed:   0.12,
    driftAmount:  0.07,
    color:        THREE_COLORS.particleGlow,
    opacityRange: [0.15, 0.55],
    zOffset:      -25,
  });

  useFrame(({ clock }) => {
    (mat.uniforms.uTime as THREE.IUniform<number>).value = clock.getElapsedTime();
  });

  return <points ref={meshRef} geometry={geo} material={mat} />;
}

// ─── LAYER 3 — FOREGROUND DUST ────────────────────────────────────────────────
function ForegroundDust() {
  const { meshRef, geo, mat } = useParticleLayer({
    count:        COUNTS.fg,
    spread:       [25, 10, 30],
    sizeRange:    [0.04, 0.1],
    driftSpeed:   0.06,
    driftAmount:  0.12,
    color:        new THREE.Color("#4FC3F7"),
    opacityRange: [0.05, 0.25],
    zOffset:      -28,
  });

  useFrame(({ clock }) => {
    (mat.uniforms.uTime as THREE.IUniform<number>).value = clock.getElapsedTime();
  });

  return <points ref={meshRef} geometry={geo} material={mat} />;
}

// ─── COMPOSED PARTICLE UNIVERSE ────────────────────────────────────────────────
export function ParticleField() {
  return (
    <>
      <BackgroundParticles />
      <MidFieldParticles />
      <ForegroundDust />
    </>
  );
}
