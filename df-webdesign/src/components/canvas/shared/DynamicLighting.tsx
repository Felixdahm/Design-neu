"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getScrollProgress } from "@/hooks/useScrollProgress";

// ─── LIGHTING PHILOSOPHY ──────────────────────────────────────────────────────
// Each environment has its own lighting signature.
// The lights don't teleport — they lerp between configurations as the camera
// travels. This creates organic light transitions that feel like real cinematography.
//
// Standard 3-point cinematic rig per environment:
//   KEY LIGHT   — primary, directional, sets mood (brightest, often from upper-right)
//   FILL LIGHT  — secondary, opposing side, prevents pure black
//   RIM LIGHT   — back light, adds depth separation (thin highlight on edges)
//   FLOOR LIGHT — subtle bounce from below (like light reflecting off a surface)

type LightConfig = {
  key:   { pos: [number, number, number]; color: string; intensity: number };
  fill:  { pos: [number, number, number]; color: string; intensity: number };
  rim:   { pos: [number, number, number]; color: string; intensity: number };
  floor: { pos: [number, number, number]; color: string; intensity: number };
};

// Each environment gets a lighting preset
// Z positions are world-space, matching ENVIRONMENTS config
const LIGHT_CONFIGS: { progress: number; z: number; config: LightConfig }[] = [
  {
    progress: 0.0,
    z: 0,
    config: {
      key:   { pos: [4, 6, 4],    color: "#4FC3F7", intensity: 8  },
      fill:  { pos: [-5, 2, 2],   color: "#0D47A1", intensity: 2  },
      rim:   { pos: [0, -3, -3],  color: "#1565C0", intensity: 1.5 },
      floor: { pos: [0, -5, 0],   color: "#050510", intensity: 0.5 },
    },
  },
  {
    progress: 0.35,
    z: -12,
    config: {
      key:   { pos: [3, 8, -8],   color: "#4FC3F7", intensity: 6  },
      fill:  { pos: [-6, 1, -16], color: "#29B6F6", intensity: 3  },
      rim:   { pos: [0, -2, -6],  color: "#0288D1", intensity: 2  },
      floor: { pos: [0, -6, -12], color: "#001122", intensity: 1  },
    },
  },
  {
    progress: 0.5,
    z: -28,
    config: {
      key:   { pos: [6, 5, -24],  color: "#29B6F6", intensity: 5  },
      fill:  { pos: [-4, 2, -32], color: "#0D47A1", intensity: 2.5 },
      rim:   { pos: [0, -2, -22], color: "#1A237E", intensity: 1.5 },
      floor: { pos: [0, -7, -28], color: "#000814", intensity: 0.8 },
    },
  },
  {
    progress: 0.65,
    z: -42,
    config: {
      key:   { pos: [0, 8, -38],  color: "#00E5FF", intensity: 10 },
      fill:  { pos: [-6, 0, -46], color: "#006064", intensity: 4  },
      rim:   { pos: [6, -2, -40], color: "#00BCD4", intensity: 3  },
      floor: { pos: [0, -5, -42], color: "#00111A", intensity: 1.5 },
    },
  },
  {
    progress: 0.88,
    z: -58,
    config: {
      key:   { pos: [0, 6, -54],  color: "#00FF88", intensity: 6  },
      fill:  { pos: [-5, 1, -62], color: "#004D40", intensity: 2  },
      rim:   { pos: [5, -2, -56], color: "#1B5E20", intensity: 2  },
      floor: { pos: [0, -6, -58], color: "#001A0A", intensity: 1  },
    },
  },
];

function lerpConfig(a: LightConfig, b: LightConfig, t: number): LightConfig {
  const lp = (pa: [number,number,number], pb: [number,number,number]): [number,number,number] => [
    pa[0] + (pb[0] - pa[0]) * t,
    pa[1] + (pb[1] - pa[1]) * t,
    pa[2] + (pb[2] - pa[2]) * t,
  ];
  const lc = (ca: string, cb: string): string => {
    const a = new THREE.Color(ca);
    const b = new THREE.Color(cb);
    return a.lerp(b, t).getStyle();
  };
  const ln = (a: number, b: number) => a + (b - a) * t;
  return {
    key:   { pos: lp(a.key.pos,   b.key.pos),   color: lc(a.key.color,   b.key.color),   intensity: ln(a.key.intensity,   b.key.intensity)   },
    fill:  { pos: lp(a.fill.pos,  b.fill.pos),  color: lc(a.fill.color,  b.fill.color),  intensity: ln(a.fill.intensity,  b.fill.intensity)  },
    rim:   { pos: lp(a.rim.pos,   b.rim.pos),   color: lc(a.rim.color,   b.rim.color),   intensity: ln(a.rim.intensity,   b.rim.intensity)   },
    floor: { pos: lp(a.floor.pos, b.floor.pos), color: lc(a.floor.color, b.floor.color), intensity: ln(a.floor.intensity, b.floor.intensity) },
  };
}

export function DynamicLighting() {
  const keyRef   = useRef<THREE.PointLight>(null);
  const fillRef  = useRef<THREE.PointLight>(null);
  const rimRef   = useRef<THREE.PointLight>(null);
  const floorRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const progress = getScrollProgress();
    const configs = LIGHT_CONFIGS;

    // Find surrounding keyframes
    let i0 = 0;
    for (let i = 0; i < configs.length - 1; i++) {
      if (progress >= configs[i].progress) i0 = i;
    }
    const i1 = Math.min(i0 + 1, configs.length - 1);
    const segLen = configs[i1].progress - configs[i0].progress;
    const localT = segLen === 0 ? 0 : (progress - configs[i0].progress) / segLen;
    const smoothT = localT * localT * (3 - 2 * localT); // smoothstep

    const cfg = lerpConfig(configs[i0].config, configs[i1].config, smoothT);

    const applyToLight = (
      ref: React.RefObject<THREE.PointLight | null>,
      data: { pos: [number, number, number]; color: string; intensity: number }
    ) => {
      if (!ref.current) return;
      ref.current.position.lerp(new THREE.Vector3(...data.pos), 0.03);
      ref.current.color.lerp(new THREE.Color(data.color), 0.03);
      ref.current.intensity += (data.intensity - ref.current.intensity) * 0.03;
    };

    applyToLight(keyRef,   cfg.key);
    applyToLight(fillRef,  cfg.fill);
    applyToLight(rimRef,   cfg.rim);
    applyToLight(floorRef, cfg.floor);
  });

  return (
    <group>
      {/* KEY LIGHT — primary mood light */}
      <pointLight
        ref={keyRef}
        position={[4, 6, 4]}
        color="#4FC3F7"
        intensity={8}
        distance={60}
        decay={2}
        castShadow={false}
      />

      {/* FILL LIGHT — prevents pure black, adds color complexity */}
      <pointLight
        ref={fillRef}
        position={[-5, 2, 2]}
        color="#0D47A1"
        intensity={2}
        distance={50}
        decay={2}
      />

      {/* RIM LIGHT — back separation, depth */}
      <pointLight
        ref={rimRef}
        position={[0, -3, -3]}
        color="#1565C0"
        intensity={1.5}
        distance={40}
        decay={2}
      />

      {/* FLOOR LIGHT — subtle bounce, prevents floating-in-void feel */}
      <pointLight
        ref={floorRef}
        position={[0, -5, 0]}
        color="#050510"
        intensity={0.5}
        distance={30}
        decay={2}
      />
    </group>
  );
}
