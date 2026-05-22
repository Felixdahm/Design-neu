"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

const SCREENS = [
  { pos: [-4.5, 0.5, 0]   as [number,number,number], rot: [0, 0.35, 0] as [number,number,number] },
  { pos: [0,    1.2, -2]  as [number,number,number], rot: [0, 0,    0] as [number,number,number] },
  { pos: [4.5,  0,  -0.5] as [number,number,number], rot: [0,-0.35, 0] as [number,number,number] },
  { pos: [-2.5,-1.8, -5]  as [number,number,number], rot: [0, 0.2,  0.04] as [number,number,number] },
  { pos: [2.5,  2.2, -4]  as [number,number,number], rot: [0.04,-0.2, 0] as [number,number,number] },
];

function Screen({ pos, rot, index }: { pos: [number,number,number]; rot: [number,number,number]; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(Math.random() * Math.PI * 2);

  const screenMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x020210),
    emissive: THREE_COLORS.glowBlue,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.92,
  }), []);

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.accentBlue,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.7,
  }), []);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;
    groupRef.current.position.y = pos[1] + Math.sin(time.current * 0.2) * 0.1;
    groupRef.current.rotation.y = rot[1] + Math.sin(time.current * 0.12) * 0.04;
  });

  return (
    <group ref={groupRef} position={pos} rotation={rot}>
      {/* Screen surface */}
      <mesh>
        <planeGeometry args={[3.8, 2.3]} />
        <primitive object={screenMat} attach="material" />
      </mesh>
      {/* Frame border */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[4.0, 2.45, 0.04]} />
        <primitive object={frameMat} attach="material" />
      </mesh>
      {/* Screen glow line at bottom */}
      <mesh position={[0, -1.12, 0.01]}>
        <boxGeometry args={[3.8, 0.003, 0.01]} />
        <meshStandardMaterial color="#000" emissive={THREE_COLORS.accentBlue} emissiveIntensity={4} />
      </mesh>
    </group>
  );
}

export function PortfolioSpace() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = getScrollProgress();
    groupRef.current.visible = Math.abs(p - 0.5) < 0.18;
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.portfolio.z]}>
      {SCREENS.map((s, i) => (
        <Screen key={i} pos={s.pos} rot={s.rot} index={i} />
      ))}
      <pointLight position={[0, 4, 4]}  color={THREE_COLORS.accentBlue} intensity={10} distance={25} decay={2} />
      <pointLight position={[0, -3, 2]} color={THREE_COLORS.glowBlue}   intensity={4}  distance={18} decay={2} />
    </group>
  );
}
