"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

const SERVICES = [
  { x: -3.5, y: 1.2,  z: 0,    delay: 0   },
  { x: 0,    y: -0.5, z: -2,   delay: 0.1 },
  { x: 3.5,  y: 1.0,  z: 0.5,  delay: 0.2 },
  { x: -2,   y: -2,   z: -3.5, delay: 0.3 },
  { x: 2.5,  y: 2.2,  z: -1.5, delay: 0.4 },
];

function GlassPanel({ x, y, z, delay }: { x: number; y: number; z: number; delay: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  const borderMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.accentBlue,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.15,
    wireframe: true,
  }), []);

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.03,
    roughness: 0,
    metalness: 0,
    transmission: 0.95,
  }), []);

  const lineMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.accentBlue,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.6,
  }), []);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;
    const phase = delay * Math.PI * 2;
    groupRef.current.position.y = y + Math.sin(time.current * 0.28 + phase) * 0.09;
    groupRef.current.rotation.y = Math.sin(time.current * 0.14 + phase) * 0.045;
    groupRef.current.rotation.x = Math.cos(time.current * 0.09 + phase) * 0.022;
  });

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {/* Glass body */}
      <RoundedBox args={[2.8, 1.6, 0.04]} radius={0.06} smoothness={4}>
        <primitive object={glassMat} attach="material" />
      </RoundedBox>
      {/* Wireframe border that glows */}
      <RoundedBox args={[2.82, 1.62, 0.04]} radius={0.06} smoothness={4}>
        <primitive object={borderMat} attach="material" />
      </RoundedBox>
      {/* Accent line at bottom of panel */}
      <mesh position={[0, -0.62, 0.03]}>
        <boxGeometry args={[2.4, 0.0025, 0.01]} />
        <primitive object={lineMat} attach="material" />
      </mesh>
      {/* Top-right corner dot */}
      <mesh position={[1.1, 0.62, 0.03]}>
        <circleGeometry args={[0.022, 16]} />
        <meshStandardMaterial color="#000" emissive={THREE_COLORS.accentBlue} emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

export function ServicesWorld() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = getScrollProgress();
    const center = 0.35;
    const spread = 0.18;
    groupRef.current.visible = Math.abs(p - center) < spread;
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.services.z]}>
      {SERVICES.map((s, i) => (
        <GlassPanel key={i} x={s.x} y={s.y} z={s.z} delay={s.delay} />
      ))}
      <pointLight position={[0, 5, 5]} color={THREE_COLORS.accentBlue} intensity={12} distance={22} decay={2} />
      <pointLight position={[0, -4, 2]} color={THREE_COLORS.glowBlue} intensity={5} distance={18} decay={2} />
    </group>
  );
}
