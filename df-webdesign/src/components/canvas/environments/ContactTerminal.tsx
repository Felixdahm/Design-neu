"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

export function ContactTerminal() {
  const groupRef  = useRef<THREE.Group>(null);
  const cursorRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x020308),
    emissive: new THREE.Color(0x001a0a),
    emissiveIntensity: 1,
    transparent: true,
    opacity: 0.96,
  }), []);

  const borderMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.terminal,
    emissiveIntensity: 0.6,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  }), []);

  const headerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.terminal,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.12,
  }), []);

  const scanlineMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.terminal,
    emissiveIntensity: 2,
    transparent: true,
    opacity: 0.5,
  }), []);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;
    const p = getScrollProgress();
    groupRef.current.visible = Math.abs(p - 0.88) < 0.22;
    if (cursorRef.current) cursorRef.current.visible = Math.sin(time.current * 3) > 0;
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.terminal.z]}>
      <RoundedBox args={[9, 5.5, 0.08]} radius={0.1} smoothness={4} position={[0, 0, -0.5]}>
        <primitive object={bodyMat} attach="material" />
      </RoundedBox>
      <RoundedBox args={[9.1, 5.6, 0.08]} radius={0.1} smoothness={4} position={[0, 0, -0.52]}>
        <primitive object={borderMat} attach="material" />
      </RoundedBox>
      <mesh position={[0, 2.45, -0.44]}>
        <boxGeometry args={[9, 0.4, 0.02]} />
        <primitive object={headerMat} attach="material" />
      </mesh>
      <mesh position={[0, 2.44, -0.43]}>
        <boxGeometry args={[9, 0.003, 0.01]} />
        <primitive object={scanlineMat} attach="material" />
      </mesh>
      <mesh ref={cursorRef} position={[-3.8, -0.3, -0.42]}>
        <boxGeometry args={[0.12, 0.18, 0.01]} />
        <meshStandardMaterial color="#000" emissive={THREE_COLORS.terminal} emissiveIntensity={4} />
      </mesh>
      <pointLight position={[0, 3, 2]}   color={THREE_COLORS.terminal}   intensity={12} distance={20} decay={2} />
      <pointLight position={[0, -3, -1]} color={THREE_COLORS.accentBlue} intensity={4}  distance={15} decay={2} />
    </group>
  );
}
