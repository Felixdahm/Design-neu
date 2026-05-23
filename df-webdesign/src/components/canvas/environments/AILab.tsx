"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

// 4 process steps — floating in a flowing diagonal layout
const STEPS = [
  {
    pos:   [-3.2,  2.2, 0]  as [number, number, number],
    num:   "01",
    title: "ERSTGESPRÄCH",
    desc:  "Kostenloses 20-min\nGespräch — unverbindlich",
    delay: 0,
  },
  {
    pos:   [ 2.4,  0.5, -1] as [number, number, number],
    num:   "02",
    title: "PROTOTYP",
    desc:  "Klickbares Design\nvorab — kostenlos",
    delay: 0.25,
  },
  {
    pos:   [-2.8, -1.4, -1] as [number, number, number],
    num:   "03",
    title: "ENTWICKLUNG",
    desc:  "100% Custom Code\nmit regelmäßigen Updates",
    delay: 0.5,
  },
  {
    pos:   [ 3.0, -2.8,  0] as [number, number, number],
    num:   "04",
    title: "LAUNCH",
    desc:  "Live-Schaltung &\npersönlicher Support",
    delay: 0.75,
  },
] as const;

// Connecting path between step centers
const PATH_POINTS: [number,number,number][] = STEPS.map(s => s.pos);

function StepNode({ pos, num, title, desc, delay }: typeof STEPS[number]) {
  const groupRef = useRef<THREE.Group>(null);
  const time     = useRef(Math.random() * Math.PI * 2);

  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.28, 0.006, 16, 60), []);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;
    const phase = delay * Math.PI * 2;
    groupRef.current.position.y = pos[1] + Math.sin(time.current * 0.22 + phase) * 0.08;
    groupRef.current.rotation.z = Math.sin(time.current * 0.1 + phase) * 0.04;
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* Glowing orbit ring */}
      <mesh geometry={ringGeo}>
        <meshStandardMaterial
          color="#000"
          emissive={THREE_COLORS.hologram}
          emissiveIntensity={1.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Step number — inside ring */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.17}
        color="#00E5FF"
        fillOpacity={0.9}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        font={undefined}
      >
        {num}
      </Text>

      {/* Title — to the right of the ring */}
      <Text
        position={[0.45, 0.08, 0.01]}
        fontSize={0.19}
        color="#ffffff"
        fillOpacity={0.9}
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.08}
        font={undefined}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        position={[0.45, -0.19, 0.01]}
        fontSize={0.09}
        color="#ffffff"
        fillOpacity={0.28}
        anchorX="left"
        anchorY="top"
        lineHeight={1.6}
        letterSpacing={0.04}
        font={undefined}
      >
        {desc}
      </Text>

      {/* Dot at ring center for path connector */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.035, 16]} />
        <meshStandardMaterial
          color="#000"
          emissive={THREE_COLORS.hologram}
          emissiveIntensity={4}
        />
      </mesh>
    </group>
  );
}

export function AILab() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = getScrollProgress();
    groupRef.current.visible = Math.abs(p - 0.65) < 0.18;
  });

  const pathVectors = useMemo(
    () => PATH_POINTS.map(p => new THREE.Vector3(...p)),
    []
  );

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.aiLab.z]}>
      {/* Dashed connecting path between all steps */}
      <Line
        points={pathVectors}
        color={THREE_COLORS.hologram}
        lineWidth={1}
        transparent
        opacity={0.22}
        dashed
        dashSize={0.18}
        gapSize={0.1}
      />

      {/* Process steps */}
      {STEPS.map((s, i) => (
        <StepNode key={i} {...s} />
      ))}

      {/* Atmospheric background ring */}
      <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[5.5, 0.004, 16, 100]} />
        <meshStandardMaterial
          color="#000"
          emissive={THREE_COLORS.hologram}
          emissiveIntensity={0.4}
          transparent
          opacity={0.25}
        />
      </mesh>

      <pointLight position={[0, 4, 3]}  color={THREE_COLORS.hologram}   intensity={14} distance={22} decay={2} />
      <pointLight position={[-4,-2, 0]} color={THREE_COLORS.accentBlue} intensity={5}  distance={15} decay={2} />
    </group>
  );
}
