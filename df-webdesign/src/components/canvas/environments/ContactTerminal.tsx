"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

const W = 9;
const H = 5.5;

export function ContactTerminal() {
  const groupRef = useRef<THREE.Group>(null);
  const tl       = useRef(new THREE.Vector3());
  const br       = useRef(new THREE.Vector3());
  const { camera } = useThree();

  // White glowing panel — the "light at the end"
  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:             new THREE.Color(1, 1, 1),
    emissive:          new THREE.Color(0.95, 0.97, 1.0),
    emissiveIntensity: 1.6,
    transparent:       false,
  }), []);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = getScrollProgress();
    groupRef.current.visible = p > 0.70;

    const opacity = Math.max(0, Math.min(1, (p - 0.76) / 0.11));
    const root    = document.documentElement;

    if (p > 0.70) {
      const z = ENVIRONMENTS.terminal.z;
      tl.current.set(-W / 2,  H / 2, z).project(camera);
      br.current.set( W / 2, -H / 2, z).project(camera);

      root.style.setProperty("--term-left",    `${((tl.current.x  + 1) / 2 * 100).toFixed(3)}%`);
      root.style.setProperty("--term-top",     `${((-tl.current.y + 1) / 2 * 100).toFixed(3)}%`);
      root.style.setProperty("--term-width",   `${((br.current.x  - tl.current.x) / 2 * 100).toFixed(3)}%`);
      root.style.setProperty("--term-height",  `${((-br.current.y + tl.current.y) / 2 * 100).toFixed(3)}%`);
      root.style.setProperty("--term-opacity", opacity.toFixed(4));
    } else {
      root.style.setProperty("--term-opacity", "0");
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.terminal.z]}>
      {/* The bright panel — blooms into a glowing white light */}
      <RoundedBox args={[W, H, 0.04]} radius={0.06} smoothness={4} position={[0, 0, -0.3]}>
        <primitive object={bodyMat} attach="material" />
      </RoundedBox>

      {/* Flood the space with warm white light */}
      <pointLight position={[0,  2, 3]}  color="#ffffff" intensity={20} distance={28} decay={2} />
      <pointLight position={[0, -2, 1]}  color="#e8f0ff" intensity={10} distance={20} decay={2} />
      <pointLight position={[-4, 0, 2]}  color="#ffffff" intensity={6}  distance={16} decay={2} />
      <pointLight position={[ 4, 0, 2]}  color="#ffffff" intensity={6}  distance={16} decay={2} />
    </group>
  );
}
