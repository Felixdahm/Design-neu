"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress } from "@/hooks/useLenis";

// ─── LUMINANCE-BASED WHITE REMOVAL SHADER ─────────────────────────────────────
// White background in the video → transparent.
// Blue logo pixels → fully visible and slightly enhanced.
// This is how professional studios handle logo-on-white assets in WebGL.

const LOGO_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LOGO_FRAG = `
  uniform sampler2D uTexture;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec4 c = texture2D(uTexture, vUv);

    // Luminance (how "white" is this pixel)
    float lum = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));

    // White = transparent, colored = opaque
    // smoothstep(0.75, 0.98) = soft edge to avoid hard cutout
    float alpha = 1.0 - smoothstep(0.72, 0.96, lum);
    alpha = clamp(alpha, 0.0, 1.0);

    // Subtle blue enhancement — makes the gradient pop more
    vec3 color = c.rgb;
    color.b = min(1.0, color.b * 1.15);

    // Subtle pulse — driven by uTime
    float pulse = 0.9 + sin(uTime * 0.55) * 0.1;
    color *= pulse;

    gl_FragColor = vec4(color, alpha);
  }
`;

// ─── LOGO VIDEO COMPONENT ─────────────────────────────────────────────────────
function LogoVideo() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.ShaderMaterial>(null);
  const time    = useRef(0);

  const { texture, video } = useMemo(() => {
    const video = document.createElement("video");
    video.src         = "/logo/logo-rotation.mp4";
    video.autoplay    = true;
    video.muted       = true;
    video.loop        = true;
    video.playsInline = true;

    // Start playing — required for VideoTexture to have frames
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Retry on first user interaction if autoplay blocked
        document.addEventListener("click", () => video.play(), { once: true });
      });
    }

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    return { texture, video };
  }, []);

  useEffect(() => {
    return () => {
      video.pause();
      texture.dispose();
    };
  }, [video, texture]);

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uTime:    { value: 0 },
  }), [texture]);

  useFrame((_, delta) => {
    time.current += delta;

    // Tell Three.js to update the video frame
    texture.needsUpdate = true;

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = time.current;
    }

    // Slow breathing scale
    if (meshRef.current) {
      const s = 1 + Math.sin(time.current * 0.35) * 0.018;
      meshRef.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0.01]}>
      <planeGeometry args={[5, 5]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={LOGO_VERT}
        fragmentShader={LOGO_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
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
  const geo3 = useMemo(() => new THREE.TorusGeometry(5.2, 0.002, 16, 120), []);

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
    if (m1.current) {
      m1.current.emissiveIntensity = 2.2 + Math.sin(time.current * 0.65) * 0.9;
    }
    if (m2.current) {
      m2.current.emissiveIntensity = 0.9 + Math.cos(time.current * 0.45) * 0.4;
    }
  });

  return (
    <>
      <mesh ref={r1} geometry={geo1}>
        <meshStandardMaterial ref={m1} color="#000" emissive={THREE_COLORS.accentBlue} emissiveIntensity={2.2} transparent opacity={0.9} />
      </mesh>
      <mesh ref={r2} geometry={geo2} rotation={[Math.PI / 3, 0.3, 0]}>
        <meshStandardMaterial ref={m2} color="#000" emissive={THREE_COLORS.hologram} emissiveIntensity={0.9} transparent opacity={0.5} />
      </mesh>
      <mesh ref={r3} geometry={geo3} rotation={[Math.PI / 2.2, 0.1, 0]}>
        <meshStandardMaterial color="#000" emissive={THREE_COLORS.accentBlue} emissiveIntensity={0.5} transparent opacity={0.3} />
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
    if (p > 0.28) { groupRef.current.visible = false; return; }
    groupRef.current.visible = true;
    const fade = p > 0.15 ? 1 - (p - 0.15) / 0.13 : 1;
    groupRef.current.scale.setScalar(0.88 + fade * 0.12);
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
