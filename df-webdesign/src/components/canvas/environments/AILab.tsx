"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Text } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

const STEPS = [
  {
    pos:   [-3.6,  1.2, 0] as [number, number, number],
    num:   "01",
    title: "ERSTGESPRÄCH",
    desc:  "Kostenloses 20-min\nGespräch — unverbindlich",
    delay: 0,
  },
  {
    pos:   [-1.2, -1.0, 0] as [number, number, number],
    num:   "02",
    title: "PROTOTYP",
    desc:  "Klickbares Design\nvorab — kostenlos",
    delay: 0.25,
  },
  {
    pos:   [ 1.2,  1.2, 0] as [number, number, number],
    num:   "03",
    title: "ENTWICKLUNG",
    desc:  "100% Custom Code\nmit regelmäßigen Updates",
    delay: 0.5,
  },
  {
    pos:   [ 3.6, -1.0, 0] as [number, number, number],
    num:   "04",
    title: "LAUNCH",
    desc:  "Live-Schaltung &\npersönlicher Support",
    delay: 0.75,
  },
] as const;

// Smooth CatmullRom curve through all step positions
const CURVE = new THREE.CatmullRomCurve3(
  STEPS.map(s => new THREE.Vector3(...s.pos)),
  false,
  "catmullrom",
  0.5,
);
const CURVE_LINE_POINTS = CURVE.getPoints(100);

// Particles flowing along the curve 01 → 04
function FlowParticles() {
  const COUNT  = 32;
  const posArr = useMemo(() => new Float32Array(COUNT * 3), []);
  const t      = useRef(0);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    return g;
  }, [posArr]);

  useFrame((_, delta) => {
    t.current = (t.current + delta * 0.13) % 1;
    for (let i = 0; i < COUNT; i++) {
      const progress = (t.current + i / COUNT) % 1;
      const pt = CURVE.getPoint(progress);
      posArr[i * 3]     = pt.x;
      posArr[i * 3 + 1] = pt.y;
      posArr[i * 3 + 2] = pt.z;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points geometry={geo}>
      <pointsMaterial
        color={THREE_COLORS.hologram}
        size={0.055}
        transparent
        opacity={0.92}
        sizeAttenuation
      />
    </points>
  );
}

function StepNode({ pos, num, title, desc, delay }: typeof STEPS[number]) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const time     = useRef(Math.random() * Math.PI * 2);

  const pulseMat = useRef(new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.hologram,
    emissiveIntensity: 1.6,
    transparent: true,
    opacity: 0.4,
  }));

  const ringGeo  = useMemo(() => new THREE.TorusGeometry(0.30, 0.007, 16, 64), []);
  const pulseGeo = useMemo(() => new THREE.TorusGeometry(0.46, 0.004, 16, 64), []);

  useFrame((_, delta) => {
    time.current += delta;
    const phase = delay * Math.PI * 2;

    // Subtle floating
    if (groupRef.current) {
      groupRef.current.position.y = pos[1] + Math.sin(time.current * 0.22 + phase) * 0.09;
      groupRef.current.rotation.z = Math.sin(time.current * 0.10 + phase) * 0.025;
    }

    // Sonar pulse — ring expands and fades out
    if (pulseRef.current && pulseMat.current) {
      const pulse = (Math.sin(time.current * 1.6 + phase) + 1) * 0.5; // 0…1
      pulseRef.current.scale.setScalar(1 + pulse * 0.55);
      pulseMat.current.opacity = 0.45 - pulse * 0.42;
    }
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* Inner orbit ring */}
      <mesh geometry={ringGeo}>
        <meshStandardMaterial
          color="#000"
          emissive={THREE_COLORS.hologram}
          emissiveIntensity={2.0}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Sonar pulse ring */}
      <mesh ref={pulseRef} geometry={pulseGeo} raycast={() => undefined}>
        <primitive object={pulseMat.current} attach="material" />
      </mesh>

      {/* Step number */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.155}
        color="#00E5FF"
        fillOpacity={1.0}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
        font={undefined}
      >
        {num}
      </Text>

      {/* Title */}
      <Text
        position={[0.44, 0.09, 0.01]}
        fontSize={0.175}
        color="#ffffff"
        fillOpacity={0.95}
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.09}
        font={undefined}
      >
        {title}
      </Text>

      {/* Separator line below title */}
      <mesh position={[0.9, -0.07, 0.01]} raycast={() => undefined}>
        <boxGeometry args={[0.9, 0.0018, 0.001]} />
        <meshStandardMaterial
          color="#000"
          emissive={THREE_COLORS.hologram}
          emissiveIntensity={1.8}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Description */}
      <Text
        position={[0.44, -0.19, 0.01]}
        fontSize={0.086}
        color="#ffffff"
        fillOpacity={0.28}
        anchorX="left"
        anchorY="top"
        lineHeight={1.65}
        letterSpacing={0.04}
        font={undefined}
      >
        {desc}
      </Text>
    </group>
  );
}

export function AILab() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.visible = Math.abs(getScrollProgress() - 0.65) < 0.18;
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.aiLab.z]}>
      {/* Smooth CatmullRom connecting curve */}
      <Line
        points={CURVE_LINE_POINTS}
        color={THREE_COLORS.hologram}
        lineWidth={0.9}
        transparent
        opacity={0.16}
      />

      {/* Energy particles flowing 01 → 04 */}
      <FlowParticles />

      {/* Step nodes */}
      {STEPS.map((s, i) => (
        <StepNode key={i} {...s} />
      ))}

      <pointLight position={[0,  3, 3]}  color={THREE_COLORS.hologram}   intensity={16} distance={24} decay={2} />
      <pointLight position={[-3,-2, 0]}  color={THREE_COLORS.accentBlue} intensity={6}  distance={16} decay={2} />
    </group>
  );
}
