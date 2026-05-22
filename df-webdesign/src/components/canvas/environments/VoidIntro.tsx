"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

// ─── DF LOGO VIDEO ────────────────────────────────────────────────────────────
function LogoVideo() {
  const meshRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  const { texture, video } = useMemo(() => {
    const video = document.createElement("video");
    video.src = "/df-logo-spin.mp4";
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(() => {});

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return { texture, video };
  }, []);

  useEffect(() => {
    return () => {
      texture.dispose();
      video.pause();
    };
  }, [texture, video]);

  useFrame((_, delta) => {
    time.current += delta;
    texture.needsUpdate = true;
    if (!meshRef.current) return;
    // Slow breathing
    const s = 1 + Math.sin(time.current * 0.35) * 0.018;
    meshRef.current.scale.setScalar(s);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[5, 5]} />
      <meshBasicMaterial
        map={texture}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ─── ORBITAL RINGS ────────────────────────────────────────────────────────────
function OrbitalRings() {
  const r1 = useRef<THREE.Mesh>(null);
  const r2 = useRef<THREE.Mesh>(null);
  const r3 = useRef<THREE.Mesh>(null);
  const m1 = useRef<THREE.MeshStandardMaterial>(null);
  const m2 = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(0);

  const geo1 = useMemo(() => new THREE.TorusGeometry(2.8, 0.006, 16, 120), []);
  const geo2 = useMemo(() => new THREE.TorusGeometry(3.8, 0.003, 16, 120), []);
  const geo3 = useMemo(() => new THREE.TorusGeometry(5.0, 0.0015, 16, 120), []);

  useFrame((_, delta) => {
    time.current += delta;

    if (r1.current) {
      r1.current.rotation.z += delta * 0.07;
      r1.current.rotation.x = Math.PI / 2 + Math.sin(time.current * 0.11) * 0.12;
    }
    if (r2.current) {
      r2.current.rotation.z -= delta * 0.04;
      r2.current.rotation.y += delta * 0.03;
    }
    if (r3.current) {
      r3.current.rotation.z += delta * 0.025;
      r3.current.rotation.x = Math.PI / 2.5 + Math.cos(time.current * 0.07) * 0.08;
    }
    // Pulse emissive through bloom
    if (m1.current) {
      m1.current.emissiveIntensity = 2.5 + Math.sin(time.current * 0.65) * 1.0;
    }
    if (m2.current) {
      m2.current.emissiveIntensity = 1.0 + Math.cos(time.current * 0.45) * 0.5;
    }
  });

  return (
    <>
      <mesh ref={r1} geometry={geo1}>
        <meshStandardMaterial
          ref={m1}
          color="#000"
          emissive={THREE_COLORS.accentBlue}
          emissiveIntensity={2.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={r2} geometry={geo2} rotation={[Math.PI / 3, 0.3, 0]}>
        <meshStandardMaterial
          ref={m2}
          color="#000"
          emissive={THREE_COLORS.hologram}
          emissiveIntensity={1.0}
          transparent
          opacity={0.5}
        />
      </mesh>
      <mesh ref={r3} geometry={geo3} rotation={[Math.PI / 2.2, 0.1, 0]}>
        <meshStandardMaterial
          color="#000"
          emissive={THREE_COLORS.accentBlue}
          emissiveIntensity={0.6}
          transparent
          opacity={0.3}
        />
      </mesh>
    </>
  );
}

// ─── VOID INTRO ───────────────────────────────────────────────────────────────
export function VoidIntro() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const p = getScrollProgress();
    // Visible from 0 to 0.25, fades between 0.15–0.25
    if (p > 0.25) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;
    const fade = p > 0.15 ? 1 - (p - 0.15) / 0.10 : 1;
    groupRef.current.scale.setScalar(0.9 + fade * 0.1);
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.void.z]}>
      <LogoVideo />
      <OrbitalRings />
      <pointLight position={[5, 4, 5]}   color={THREE_COLORS.accentBlue} intensity={20} distance={25} decay={2} />
      <pointLight position={[-4, -2, 3]} color={THREE_COLORS.hologram}   intensity={10} distance={18} decay={2} />
    </group>
  );
}
