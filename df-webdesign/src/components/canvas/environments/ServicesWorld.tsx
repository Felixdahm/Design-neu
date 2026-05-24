"use client";

import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

const RADIUS = 0.72;

// ── Helix layout: same orbital radius (2.2), 72° rotation per step, 1.2 deeper each ──
// Gives a spiral/solar-system feel — camera follows the helix perfectly centered
const ORBIT_R = 2.2;
const SERVICES: {
  x: number; y: number; z: number; delay: number;
  num: string; title: string; desc: string;
  textureUrl: string | null;
  brightness: number;
  ringColor: string;
  textAbove?: boolean;
}[] = [
  {
    x:  ORBIT_R, y:  0,     z:   0,   delay: 0,
    num: "01", title: "KOSTENLOSER\nPROTOTYP VORAB",
    desc: "Sieh dein Design bevor\ndu einen Cent zahlst",
    textureUrl: "/planets/planet-seo.jpg",
    brightness: 3.5,
    ringColor: "#00FF88",
  },
  {
    x:  0.68,    y:  2.09,  z:  -2.0, delay: 0.12,
    num: "02", title: "ZAHLUNG NACH\nABNAHME",
    desc: "Keine Anzahlung —\nerst zahlen bei Zufriedenheit",
    textureUrl: "/planets/planet-webdesign.jpg",
    brightness: 1.2,
    ringColor: "#4FC3F7",
    textAbove: true,
  },
  {
    x: -1.78,    y:  1.30,  z:  -4.0, delay: 0.24,
    num: "03", title: "EIGENES\nBEARBEITUNGS-TOOL",
    desc: "Inklusive — kein fremdes\nCMS, keine Folgekosten",
    textureUrl: "/planets/planet-backend.jpg",
    brightness: 3.5,
    ringColor: "#1565C0",
    textAbove: true,
  },
  {
    x: -1.78,    y: -1.30,  z:  -6.0, delay: 0.36,
    num: "04", title: "100% TRANSPARENT\n& UPDATES",
    desc: "Regelmäßige Updates\nwährend der Entwicklung",
    textureUrl: "/planets/planet-chatbot.jpg",
    brightness: 3.5,
    ringColor: "#00BCD4",
  },
  {
    x:  0.68,    y: -2.09,  z:  -8.0, delay: 0.48,
    num: "05", title: "PERSÖNLICHE\nWARTUNG",
    desc: "Kein Stundensatz —\nimmer ein direkter Ansprechpartner",
    textureUrl: "/planets/planet-uiux.jpg",
    brightness: 3.5,
    ringColor: "#AB47BC",
  },
];

// ── Textured spheres ──────────────────────────────────────────────────────────
function VideoSphereMesh({ url }: { url: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useVideoTexture(url, { muted: true, loop: true, start: true });
  useFrame((_, delta) => { if (meshRef.current) meshRef.current.rotation.y += delta * 0.06; });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

function ImageSphereMesh({ url, brightness }: { url: string; brightness: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  useFrame((_, delta) => { if (meshRef.current) meshRef.current.rotation.y += delta * 0.06; });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        emissiveMap={texture}
        emissive={new THREE.Color(1, 1, 1)}
        emissiveIntensity={brightness}
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  );
}

function FallbackSphereMesh({ ringColor }: { ringColor: string }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color:             new THREE.Color(ringColor),
    emissive:          new THREE.Color(ringColor),
    emissiveIntensity: 0.3,
    roughness:         0.75,
  }), [ringColor]);
  return (
    <mesh>
      <sphereGeometry args={[RADIUS, 32, 32]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ── Planet ────────────────────────────────────────────────────────────────────
function Planet({ x, y, z, delay, num, title, desc, textureUrl, brightness, ringColor, textAbove }: typeof SERVICES[number]) {
  const groupRef = useRef<THREE.Group>(null);
  const time     = useRef(0);

  const ringMatA = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000", emissive: new THREE.Color(ringColor),
    emissiveIntensity: 1.3, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
  }), [ringColor]);

  const ringMatB = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000", emissive: new THREE.Color(ringColor),
    emissiveIntensity: 0.65, transparent: true, opacity: 0.22, side: THREE.DoubleSide,
  }), [ringColor]);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;
    const phase = delay * Math.PI * 2;
    groupRef.current.position.y = y + Math.sin(time.current * 0.22 + phase) * 0.09;
    groupRef.current.rotation.y = Math.sin(time.current * 0.09 + phase) * 0.06;
  });

  // For "above": title at top (grows up), desc below title (grows down), num closest to planet
  // For "below": num closest to planet, title next, desc furthest (grows down)
  const TEXT_Y_NUM   = textAbove ?  1.18 : -1.30;
  const TEXT_Y_DESC  = textAbove ?  1.72 : -1.88;
  const TEXT_Y_TITLE = textAbove ?  2.08 : -1.52;
  const CONN_Y       = textAbove ?  1.00 : -1.10;

  return (
    <group ref={groupRef} position={[x, y, z]}>
      {/* Sphere */}
      {textureUrl ? (
        <Suspense fallback={<FallbackSphereMesh ringColor={ringColor} />}>
          {textureUrl.endsWith(".mp4") || textureUrl.endsWith(".webm")
            ? <VideoSphereMesh url={textureUrl} />
            : <ImageSphereMesh url={textureUrl} brightness={brightness} />
          }
        </Suspense>
      ) : (
        <FallbackSphereMesh ringColor={ringColor} />
      )}

      {/* Saturn rings */}
      <mesh rotation={[Math.PI * 0.40, 0, Math.PI * 0.07]} raycast={() => undefined}>
        <torusGeometry args={[RADIUS * 1.58, 0.019, 16, 128]} />
        <primitive object={ringMatA} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI * 0.42, 0, Math.PI * 0.11]} raycast={() => undefined}>
        <torusGeometry args={[RADIUS * 1.95, 0.009, 16, 128]} />
        <primitive object={ringMatB} attach="material" />
      </mesh>

      {/* Glow */}
      <pointLight color={ringColor} intensity={2.8} distance={5.5} decay={2} />

      {/* Connector — short vertical line between sphere and text */}
      <mesh position={[0, CONN_Y, 0.85]} raycast={() => undefined}>
        <boxGeometry args={[0.0014, 0.22, 0.001]} />
        <meshStandardMaterial color="#000" emissive={new THREE.Color(ringColor)}
          emissiveIntensity={1.4} transparent opacity={0.38} />
      </mesh>

      <Text position={[0, TEXT_Y_NUM, 0.85]} anchorX="center" anchorY="middle"
        fontSize={0.088} color={ringColor} fillOpacity={0.85} letterSpacing={0.12} font={undefined}>
        {num}
      </Text>
      <Text position={[0, TEXT_Y_TITLE, 0.85]} anchorX="center"
        anchorY={textAbove ? "bottom" : "middle"}
        fontSize={0.138} color="#ffffff" fillOpacity={0.95} letterSpacing={0.06}
        lineHeight={1.4} font={undefined}>
        {title}
      </Text>
      <Text position={[0, TEXT_Y_DESC, 0.85]} anchorX="center"
        anchorY={textAbove ? "top" : "top"}
        fontSize={0.09} color="#ffffff" fillOpacity={0.72} lineHeight={1.65}
        letterSpacing={0.04} font={undefined}>
        {desc}
      </Text>
    </group>
  );
}

// ── Central sun ───────────────────────────────────────────────────────────────
function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const time    = useRef(0);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color:             new THREE.Color(1, 0.95, 0.7),
    emissive:          new THREE.Color(1, 0.85, 0.4),
    emissiveIntensity: 5,
  }), []);

  useFrame((_, delta) => {
    time.current += delta;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
    if (mat) mat.emissiveIntensity = 4.5 + Math.sin(time.current * 1.2) * 0.7;
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <pointLight color="#fff8e0" intensity={35} distance={22} decay={2} />
      <pointLight color="#ffcc66" intensity={12} distance={10} decay={2} />
    </group>
  );
}

// ── Orbital path rings (one per planet, showing the helix structure) ──────────
function OrbitRings() {
  return (
    <>
      {SERVICES.map((s, i) => (
        <mesh key={i} position={[0, 0, s.z]} rotation={[Math.PI / 2, 0, 0]} raycast={() => undefined}>
          <ringGeometry args={[ORBIT_R - 0.012, ORBIT_R + 0.012, 128]} />
          <meshBasicMaterial color={s.ringColor} transparent opacity={0.10} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────
export function ServicesWorld() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = getScrollProgress();
    groupRef.current.visible = p >= 0.18 && p <= 0.52;
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.services.z]}>
      <Sun />
      <OrbitRings />
      {SERVICES.map((s, i) => <Planet key={i} {...s} />)}
    </group>
  );
}
