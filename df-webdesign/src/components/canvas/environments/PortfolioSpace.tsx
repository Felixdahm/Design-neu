"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useScrollProgress";

function FloatingScreen({
  position,
  rotation,
  index,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (!meshRef.current) return;
    const phase = index * 1.2;
    meshRef.current.position.y =
      position[1] + Math.sin(time.current * 0.2 + phase) * 0.12;
    meshRef.current.rotation.y =
      rotation[1] + Math.sin(time.current * 0.12 + phase) * 0.06;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[3.5, 2.2]} />
      <meshStandardMaterial
        color={new THREE.Color(0x050510)}
        emissive={THREE_COLORS.glowBlue}
        emissiveIntensity={0.3}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

const SCREENS = [
  { pos: [-4, 0.5, 0] as [number, number, number], rot: [0, 0.3, 0] as [number, number, number] },
  { pos: [0, 1, -3] as [number, number, number],   rot: [0, 0, 0] as [number, number, number] },
  { pos: [4, 0, -1] as [number, number, number],   rot: [0, -0.3, 0] as [number, number, number] },
  { pos: [-2, -1.5, -5] as [number, number, number], rot: [0, 0.2, 0.05] as [number, number, number] },
  { pos: [2.5, 2, -4] as [number, number, number],  rot: [0.05, -0.15, 0] as [number, number, number] },
];

export function PortfolioSpace() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = getScrollProgress();
    const center = 0.5;
    const spread = 0.15;
    const dist = Math.abs(progress - center);
    groupRef.current.visible = dist < spread;
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.portfolio.z]}>
      {SCREENS.map((s, i) => (
        <FloatingScreen key={i} position={s.pos} rotation={s.rot} index={i} />
      ))}
      <Text
        font="/fonts/GeistMono-Regular.woff2"
        fontSize={0.08}
        letterSpacing={0.6}
        color="#4FC3F7"
        anchorX="center"
        position={[0, -4, 0]}
      >
        PORTFOLIO
      </Text>
      <pointLight position={[0, 4, 4]} color={THREE_COLORS.accentBlue} intensity={4} distance={22} />
    </group>
  );
}
