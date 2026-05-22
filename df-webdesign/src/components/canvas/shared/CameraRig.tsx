"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getScrollProgress } from "@/hooks/useLenis";
import { getCameraState } from "@/lib/cameraPath";

export function CameraRig() {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(0, 0, 12));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const driftT = useRef(0);

  useFrame((_, delta) => {
    driftT.current += delta;

    const progress = Math.min(getScrollProgress(), 0.87);
    const state = getCameraState(progress);

    // Organic drift — gives the camera life when stationary
    const dX = Math.sin(driftT.current * 0.15) * 0.07;
    const dY = Math.cos(driftT.current * 0.10) * 0.04;

    const destPos = state.position.clone().add(new THREE.Vector3(dX, dY, 0));

    // Heavy cinematic lerp — slow, weighted, expensive-feeling
    pos.current.lerp(destPos, 0.035);
    target.current.lerp(state.target, 0.025);

    camera.position.copy(pos.current);
    camera.lookAt(target.current);
  });

  return null;
}
