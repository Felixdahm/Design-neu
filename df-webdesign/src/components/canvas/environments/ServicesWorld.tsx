"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useScrollProgress";

const SERVICES = [
  { title: "WEB DESIGN",    subtitle: "Premium digital experiences", x: -3.5, y: 1.2,  z: 0,    delay: 0 },
  { title: "DEVELOPMENT",   subtitle: "Full-stack engineering",      x: 0,    y: -0.5, z: -2,   delay: 0.1 },
  { title: "BRANDING",      subtitle: "Identity & visual systems",   x: 3.5,  y: 1.0,  z: 0.5,  delay: 0.2 },
  { title: "UI/UX",         subtitle: "Human-centered design",       x: -2,   y: -2,   z: -3.5, delay: 0.3 },
  { title: "3D & MOTION",   subtitle: "Immersive media",             x: 2.5,  y: 2.2,  z: -1.5, delay: 0.4 },
];

function ServicePanel({
  title,
  subtitle,
  position,
  delay,
}: {
  title: string;
  subtitle: string;
  position: [number, number, number];
  delay: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  // Glass panel material
  const glassMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xffffff),
        transparent: true,
        opacity: 0.04,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.9,
      }),
    []
  );

  const borderMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: THREE_COLORS.accentBlue,
        transparent: true,
        opacity: 0.2,
        wireframe: false,
      }),
    []
  );

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;

    // Each panel floats independently with its own phase offset
    const phase = delay * Math.PI * 2;
    groupRef.current.position.y =
      position[1] + Math.sin(time.current * 0.3 + phase) * 0.08;
    groupRef.current.rotation.y =
      Math.sin(time.current * 0.15 + phase) * 0.04;
    groupRef.current.rotation.x =
      Math.cos(time.current * 0.1 + phase) * 0.02;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Glass panel body */}
      <RoundedBox args={[2.8, 1.6, 0.05]} radius={0.08} smoothness={4}>
        <primitive object={glassMat} />
      </RoundedBox>

      {/* Border glow — thin box slightly larger */}
      <RoundedBox args={[2.82, 1.62, 0.04]} radius={0.08} smoothness={4}>
        <meshBasicMaterial
          color={THREE_COLORS.accentBlue}
          transparent
          opacity={0.15}
          wireframe
        />
      </RoundedBox>

      {/* Service title */}
      <Text
        font="/fonts/GeistMono-Bold.woff2"
        fontSize={0.22}
        letterSpacing={0.2}
        color="#FFFFFF"
        anchorX="left"
        anchorY="top"
        position={[-1.2, 0.55, 0.05]}
      >
        {title}
      </Text>

      {/* Subtitle */}
      <Text
        font="/fonts/GeistMono-Regular.woff2"
        fontSize={0.1}
        letterSpacing={0.1}
        color="#4FC3F7"
        anchorX="left"
        anchorY="top"
        position={[-1.2, 0.25, 0.05]}
      >
        {subtitle}
      </Text>

      {/* Accent line */}
      <mesh position={[-1.2 + 0.6, 0.05, 0.05]}>
        <boxGeometry args={[1.2, 0.002, 0.01]} />
        <meshBasicMaterial color={THREE_COLORS.accentBlue} transparent opacity={0.5} />
      </mesh>

      {/* Corner accent dot */}
      <mesh position={[1.1, 0.6, 0.05]}>
        <circleGeometry args={[0.025, 16]} />
        <meshBasicMaterial color={THREE_COLORS.accentBlue} />
      </mesh>
    </group>
  );
}

export function ServicesWorld() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const progress = getScrollProgress();

    // Fade in when approaching, fade out when leaving
    const center = 0.35;
    const spread = 0.15;
    const dist = Math.abs(progress - center);
    const opacity = Math.max(0, 1 - dist / spread);
    groupRef.current.visible = opacity > 0.01;
  });

  const z = ENVIRONMENTS.services.z;

  return (
    <group ref={groupRef} position={[0, 0, z]}>
      {SERVICES.map((s) => (
        <ServicePanel
          key={s.title}
          title={s.title}
          subtitle={s.subtitle}
          position={[s.x, s.y, s.z]}
          delay={s.delay}
        />
      ))}

      {/* Section label */}
      <Text
        font="/fonts/GeistMono-Regular.woff2"
        fontSize={0.08}
        letterSpacing={0.6}
        color="#4FC3F7"
        anchorX="center"
        position={[0, -3.5, 0]}
      >
        SERVICES
      </Text>

      {/* Ambient light for this zone */}
      <pointLight
        position={[0, 5, 5]}
        color={THREE_COLORS.accentBlue}
        intensity={3}
        distance={20}
      />
    </group>
  );
}
