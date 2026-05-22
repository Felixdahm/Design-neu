"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

const HUD_LINES: { a: [number,number,number]; b: [number,number,number] }[] = [
  { a: [-5, 0, 0],   b: [-1.5, 0, 0] },
  { a: [1.5, 0, 0],  b: [5, 0, 0] },
  { a: [-5, 1.8, 0], b: [-1, 1.8, 0] },
  { a: [1, 1.8, 0],  b: [5, 1.8, 0] },
  { a: [-5,-1.8, 0], b: [-2,-1.8, 0] },
  { a: [2,-1.8, 0],  b: [5,-1.8, 0] },
  { a: [-5, 3, -2],  b: [5, 3, -2] },
  { a: [-5,-3, -2],  b: [5,-3, -2] },
];

function HolographicRing({ radius, tilt, speed, color }: {
  radius: number; tilt: [number,number,number]; speed: number; color: THREE.Color;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(Math.random() * Math.PI * 2);
  const geo = useMemo(() => new THREE.TorusGeometry(radius, 0.005, 16, 80), [radius]);

  useFrame((_, delta) => {
    time.current += delta;
    if (ref.current) ref.current.rotation.z += delta * speed;
    if (mat.current) mat.current.emissiveIntensity = 1.2 + Math.sin(time.current * 1.2) * 0.6;
  });

  return (
    <mesh ref={ref} geometry={geo} rotation={tilt}>
      <meshStandardMaterial ref={mat} color="#000" emissive={color} emissiveIntensity={1.5} transparent opacity={0.7} />
    </mesh>
  );
}

export function AILab() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = getScrollProgress();
    groupRef.current.visible = Math.abs(p - 0.65) < 0.18;
  });

  const linePoints = useMemo(() =>
    HUD_LINES.map(l => [new THREE.Vector3(...l.a), new THREE.Vector3(...l.b)]),
  []);

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.aiLab.z]}>
      {linePoints.map((pts, i) => (
        <Line key={i} points={pts} color={THREE_COLORS.hologram} lineWidth={1} transparent opacity={0.35 + (i % 3) * 0.1} />
      ))}

      <HolographicRing radius={2}   tilt={[Math.PI/2, 0, 0]}        speed={0.12}  color={THREE_COLORS.hologram} />
      <HolographicRing radius={3.2} tilt={[Math.PI/3, 0.4, 0]}      speed={-0.07} color={THREE_COLORS.accentBlue} />
      <HolographicRing radius={4.5} tilt={[Math.PI/2.2, 0.2, 0.1]}  speed={0.04}  color={THREE_COLORS.hologram} />

      <pointLight position={[0, 4, 3]}  color={THREE_COLORS.hologram}   intensity={15} distance={22} decay={2} />
      <pointLight position={[-4,-2, 0]} color={THREE_COLORS.accentBlue} intensity={6}  distance={15} decay={2} />
    </group>
  );
}
