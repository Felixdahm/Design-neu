"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Line } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useScrollProgress";

function HUDLine({ start, end, index }: { start: [number, number, number]; end: [number, number, number]; index: number }) {
  const time = useRef(0);
  const opacityRef = useRef(0.4 + index * 0.05);

  const points = useMemo(
    () => [new THREE.Vector3(...start), new THREE.Vector3(...end)],
    [start, end]
  );

  useFrame((_, delta) => {
    time.current += delta;
    opacityRef.current = 0.3 + Math.sin(time.current * 0.8 + index) * 0.2;
  });

  return (
    <Line
      points={points}
      color={THREE_COLORS.hologram}
      lineWidth={1}
      transparent
      opacity={0.4 + index * 0.05}
    />
  );
}

const LINES: { start: [number, number, number]; end: [number, number, number] }[] = [
  { start: [-5, 0, 0],  end: [-2, 0, 0] },
  { start: [2, 0, 0],   end: [5, 0, 0] },
  { start: [-5, 1.5, 0],end: [-1, 1.5, 0] },
  { start: [1, 1.5, 0], end: [5, 1.5, 0] },
  { start: [-5, -1.5, 0],end: [-3, -1.5, 0] },
  { start: [3, -1.5, 0],end: [5, -1.5, 0] },
  { start: [-5, 3, -2], end: [5, 3, -2] },
  { start: [-5, -3, -2],end: [5, -3, -2] },
];

export function AILab() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = getScrollProgress();
    const center = 0.65;
    const spread = 0.15;
    const dist = Math.abs(progress - center);
    groupRef.current.visible = dist < spread;
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.aiLab.z]}>
      {LINES.map((l, i) => (
        <HUDLine key={i} start={l.start} end={l.end} index={i} />
      ))}

      <Text font="/fonts/GeistMono-Bold.woff2" fontSize={0.5} letterSpacing={0.3} color="#00E5FF" anchorX="center" position={[0, 0, 0]}>
        AI LAB
      </Text>
      <Text font="/fonts/GeistMono-Regular.woff2" fontSize={0.1} letterSpacing={0.4} color="#4FC3F7" anchorX="center" position={[0, -0.7, 0]}>
        NEXT GENERATION SYSTEMS
      </Text>

      <pointLight position={[0, 3, 3]} color={THREE_COLORS.hologram} intensity={5} distance={20} />
      <pointLight position={[-4, -2, 0]} color={THREE_COLORS.accentBlue} intensity={2} distance={15} />
    </group>
  );
}
