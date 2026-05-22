"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useScrollProgress";

export function ContactTerminal() {
  const groupRef = useRef<THREE.Group>(null);
  const cursorRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;
    const progress = getScrollProgress();
    const center = 0.88;
    const spread = 0.15;
    const dist = Math.abs(progress - center);
    groupRef.current.visible = dist < spread;

    // Cursor blink
    if (cursorRef.current) {
      cursorRef.current.visible = Math.sin(time.current * 3) > 0;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.terminal.z]}>
      {/* Terminal frame */}
      <RoundedBox args={[8, 5, 0.08]} radius={0.1} smoothness={4} position={[0, 0, -1]}>
        <meshStandardMaterial
          color={new THREE.Color(0x030308)}
          emissive={new THREE.Color(0x001122)}
          emissiveIntensity={0.5}
          transparent
          opacity={0.95}
        />
      </RoundedBox>

      {/* Terminal border */}
      <RoundedBox args={[8.05, 5.05, 0.07]} radius={0.1} smoothness={4} position={[0, 0, -1.01]}>
        <meshBasicMaterial color={THREE_COLORS.terminal} transparent opacity={0.2} wireframe />
      </RoundedBox>

      {/* Header bar */}
      <mesh position={[0, 2.3, -0.95]}>
        <boxGeometry args={[8, 0.35, 0.02]} />
        <meshBasicMaterial color={THREE_COLORS.terminal} transparent opacity={0.08} />
      </mesh>

      {/* Terminal text */}
      <Text font="/fonts/GeistMono-Regular.woff2" fontSize={0.1} letterSpacing={0.1} color="#00FF88" anchorX="left" position={[-3.7, 2.25, -0.9]}>
        df-webdesign ~ terminal v1.0
      </Text>

      <Text font="/fonts/GeistMono-Regular.woff2" fontSize={0.14} letterSpacing={0.05} color="#00FF88" anchorX="left" position={[-3.5, 0.8, -0.9]}>
        {`> Ready to build something\n  extraordinary?`}
      </Text>

      <Text font="/fonts/GeistMono-Regular.woff2" fontSize={0.12} letterSpacing={0.05} color="#4FC3F7" anchorX="left" position={[-3.5, -0.3, -0.9]}>
        {`hello@df-webdesign.de`}
      </Text>

      {/* Blinking cursor */}
      <mesh ref={cursorRef} position={[-0.2, -0.3, -0.88]}>
        <boxGeometry args={[0.1, 0.14, 0.01]} />
        <meshBasicMaterial color={THREE_COLORS.terminal} />
      </mesh>

      <pointLight position={[0, 2, 2]} color={THREE_COLORS.terminal} intensity={4} distance={18} />
    </group>
  );
}
