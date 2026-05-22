"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

// Panel dimensions in world units
const W = 9;
const H = 5.5;

export function ContactTerminal() {
  const groupRef  = useRef<THREE.Group>(null);
  const cursorRef = useRef<THREE.Mesh>(null);
  const time      = useRef(0);
  const tl        = useRef(new THREE.Vector3());
  const br        = useRef(new THREE.Vector3());
  const lerped    = useRef({ left: 200, top: 200, width: 0, height: 0 });
  const captured  = useRef(false);
  const { camera } = useThree();

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x010201),
    emissive: new THREE.Color(0x001a0a),
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.98,
  }), []);

  const borderMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.terminal,
    emissiveIntensity: 0.7,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
  }), []);

  const scanlineMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.terminal,
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 0.6,
  }), []);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;

    const p = getScrollProgress();

    groupRef.current.visible = p > 0.70;
    if (cursorRef.current) cursorRef.current.visible = p > 0.70 && Math.sin(time.current * 3) > 0;

    // Fade in only — stays at 1 once reached
    const opacity = Math.max(0, Math.min(1, (p - 0.76) / 0.11));

    const root = document.documentElement;

    if (p > 0.70) {
      // Camera is clamped at p=0.87 — projection stabilizes automatically
      const z = ENVIRONMENTS.terminal.z;
      tl.current.set(-W / 2,  H / 2, z).project(camera);
      br.current.set( W / 2, -H / 2, z).project(camera);

      const left   = (tl.current.x  + 1) / 2 * 100;
      const top    = (-tl.current.y  + 1) / 2 * 100;
      const width  = (br.current.x  - tl.current.x) / 2 * 100;
      const height = (-br.current.y + tl.current.y) / 2 * 100;

      root.style.setProperty("--term-left",    `${left.toFixed(3)}%`);
      root.style.setProperty("--term-top",     `${top.toFixed(3)}%`);
      root.style.setProperty("--term-width",   `${width.toFixed(3)}%`);
      root.style.setProperty("--term-height",  `${height.toFixed(3)}%`);
      root.style.setProperty("--term-opacity", opacity.toFixed(4));
    } else {
      root.style.setProperty("--term-opacity", "0");
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.terminal.z]}>
      <RoundedBox args={[W, H, 0.06]} radius={0.08} smoothness={4} position={[0, 0, -0.5]}>
        <primitive object={bodyMat} attach="material" />
      </RoundedBox>
      <RoundedBox args={[W + 0.12, H + 0.12, 0.06]} radius={0.08} smoothness={4} position={[0, 0, -0.52]}>
        <primitive object={borderMat} attach="material" />
      </RoundedBox>
      <mesh position={[0,  H / 2 + 0.02, -0.46]}>
        <boxGeometry args={[W, 0.003, 0.01]} />
        <primitive object={scanlineMat} attach="material" />
      </mesh>
      <mesh position={[0, -H / 2 - 0.02, -0.46]}>
        <boxGeometry args={[W, 0.003, 0.01]} />
        <primitive object={scanlineMat} attach="material" />
      </mesh>
      <mesh ref={cursorRef} position={[-3.8, -0.3, -0.46]}>
        <boxGeometry args={[0.12, 0.18, 0.01]} />
        <meshStandardMaterial color="#000" emissive={THREE_COLORS.terminal} emissiveIntensity={4} />
      </mesh>
      <pointLight position={[0, 3, 2]}   color={THREE_COLORS.terminal}   intensity={12} distance={20} decay={2} />
      <pointLight position={[0, -3, -1]} color={THREE_COLORS.accentBlue} intensity={4}  distance={15} decay={2} />
    </group>
  );
}
