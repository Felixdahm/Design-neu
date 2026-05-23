"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getScrollProgress } from "@/hooks/useLenis";
import { getCameraState } from "@/lib/cameraPath";

export function CameraRig() {
  const { camera } = useThree();
  const pos    = useRef(new THREE.Vector3(0, 0, 12));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const driftT = useRef(0);

  // Raw mouse target — updated on every mousemove
  const mouseRaw = useRef(new THREE.Vector2(0, 0));
  // Smoothed mouse — lerped in useFrame for cinematic weight
  const mouse    = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRaw.current.set(
        (e.clientX / window.innerWidth  - 0.5) * 2,   // -1 … +1
        (e.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((_, delta) => {
    driftT.current += delta;

    // Smooth mouse lerp
    mouse.current.lerp(mouseRaw.current, 0.07);

    const progress = Math.min(getScrollProgress(), 0.87);
    const state    = getCameraState(progress);

    // Organic ambient drift
    const dX = Math.sin(driftT.current * 0.15) * 0.07;
    const dY = Math.cos(driftT.current * 0.10) * 0.04;

    // Mouse parallax
    const mX =  mouse.current.x * 0.55;
    const mY = -mouse.current.y * 0.28;

    const destPos = state.position.clone().add(
      new THREE.Vector3(dX + mX, dY + mY, 0)
    );

    // Target moves less than position → creates true depth parallax:
    // near objects shift more, far objects less — exactly like a real lens
    const destTarget = state.target.clone().add(
      new THREE.Vector3(mX * 0.35, mY * 0.35, 0)
    );

    pos.current.lerp(destPos,       0.07);
    target.current.lerp(destTarget, 0.055);

    camera.position.copy(pos.current);
    camera.lookAt(target.current);
  });

  return null;
}
