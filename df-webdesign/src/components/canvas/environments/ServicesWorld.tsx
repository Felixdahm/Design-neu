"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

const SERVICES = [
  {
    x: -3.5, y: 1.2,  z: 0,    delay: 0,
    num: "01",
    title: "WEBDESIGN",
    desc: "100% Custom Code —\nkein Template, kein Limit",
  },
  {
    x: 0,    y: -0.5, z: -2,   delay: 0.1,
    num: "02",
    title: "UI / UX",
    desc: "Design das Vertrauen\naufbaut und konvertiert",
  },
  {
    x: 3.5,  y: 1.0,  z: 0.5,  delay: 0.2,
    num: "03",
    title: "SEO",
    desc: "Schnell, sichtbar\nund gefunden bei Google",
  },
  {
    x: -2,   y: -2,   z: -3.5, delay: 0.3,
    num: "04",
    title: "BACKEND",
    desc: "Datenbanken, APIs\nund volle Integration",
  },
  {
    x: 2.5,  y: 2.2,  z: -1.5, delay: 0.4,
    num: "05",
    title: "CHATBOT",
    desc: "KI-Chatbots die Kunden\nbetreuen rund um die Uhr",
  },
];

type ServiceDef = typeof SERVICES[number];

function ServicePanel({ x, y, z, delay, num, title, desc }: ServiceDef) {
  const groupRef = useRef<THREE.Group>(null);
  const time     = useRef(0);

  const borderMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.accentBlue,
    emissiveIntensity: 0.45,
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
    emissiveIntensity: 1.8,
    transparent: true,
    opacity: 0.7,
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

      {/* Wireframe border */}
      <RoundedBox args={[2.82, 1.62, 0.04]} radius={0.06} smoothness={4}>
        <primitive object={borderMat} attach="material" />
      </RoundedBox>

      {/* Service number — top left, terminal green */}
      <Text
        position={[-1.18, 0.58, 0.03]}
        fontSize={0.105}
        color="#00FF88"
        fillOpacity={0.55}
        anchorX="left"
        anchorY="top"
        font={undefined}
        letterSpacing={0.12}
      >
        {num}
      </Text>

      {/* Service title — large, white */}
      <Text
        position={[-1.18, 0.28, 0.03]}
        fontSize={0.21}
        color="#ffffff"
        fillOpacity={0.92}
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.06}
        font={undefined}
      >
        {title}
      </Text>

      {/* Service description — small, dim */}
      <Text
        position={[-1.18, -0.16, 0.03]}
        fontSize={0.095}
        color="#ffffff"
        fillOpacity={0.3}
        anchorX="left"
        anchorY="top"
        lineHeight={1.55}
        letterSpacing={0.04}
        font={undefined}
      >
        {desc}
      </Text>

      {/* Bottom accent line */}
      <mesh position={[0, -0.62, 0.03]}>
        <boxGeometry args={[2.4, 0.0025, 0.01]} />
        <primitive object={lineMat} attach="material" />
      </mesh>

      {/* Top-right corner dot */}
      <mesh position={[1.1, 0.62, 0.03]}>
        <circleGeometry args={[0.022, 16]} />
        <meshStandardMaterial color="#000" emissive={THREE_COLORS.accentBlue} emissiveIntensity={3} />
      </mesh>

      {/* Bottom-left corner dot */}
      <mesh position={[-1.1, -0.62, 0.03]}>
        <circleGeometry args={[0.018, 16]} />
        <meshStandardMaterial color="#000" emissive={THREE_COLORS.accentBlue} emissiveIntensity={2} />
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
        <ServicePanel key={i} {...s} />
      ))}
      <pointLight position={[0, 5, 5]}  color={THREE_COLORS.accentBlue} intensity={14} distance={22} decay={2} />
      <pointLight position={[0, -4, 2]} color={THREE_COLORS.glowBlue}   intensity={5}  distance={18} decay={2} />
    </group>
  );
}
