import * as THREE from "three";
import { CAMERA_KEYFRAMES } from "@/config/world.config";

// Cubic Hermite interpolation — smoother than linear, more controllable than Bezier
function hermite(t: number, p0: number, p1: number, m0: number, m1: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * p0 +
    (t3 - 2 * t2 + t) * m0 +
    (-2 * t3 + 3 * t2) * p1 +
    (t3 - t2) * m1
  );
}

function lerpComponent(
  t: number,
  i0: number,
  i1: number,
  axis: number
): number {
  const p0 = CAMERA_KEYFRAMES[i0].pos[axis] as number;
  const p1 = CAMERA_KEYFRAMES[i1].pos[axis] as number;
  // Compute tangents from neighbors
  const pPrev = i0 > 0 ? (CAMERA_KEYFRAMES[i0 - 1].pos[axis] as number) : p0;
  const pNext =
    i1 < CAMERA_KEYFRAMES.length - 1
      ? (CAMERA_KEYFRAMES[i1 + 1].pos[axis] as number)
      : p1;

  const m0 = (p1 - pPrev) * 0.5;
  const m1 = (pNext - p0) * 0.5;

  return hermite(t, p0, p1, m0, m1);
}

function lerpTargetComponent(
  t: number,
  i0: number,
  i1: number,
  axis: number
): number {
  const p0 = CAMERA_KEYFRAMES[i0].target[axis] as number;
  const p1 = CAMERA_KEYFRAMES[i1].target[axis] as number;
  return p0 + (p1 - p0) * t;
}

// Given a global scroll progress (0→1), return camera position and lookAt target
export function getCameraState(progress: number): {
  position: THREE.Vector3;
  target: THREE.Vector3;
} {
  const frames = CAMERA_KEYFRAMES;

  // Clamp
  const p = Math.max(0, Math.min(1, progress));

  // Find surrounding keyframes
  let i0 = 0;
  for (let i = 0; i < frames.length - 1; i++) {
    if (p >= frames[i].progress && p <= frames[i + 1].progress) {
      i0 = i;
      break;
    }
  }
  const i1 = Math.min(i0 + 1, frames.length - 1);

  // Local t within this segment
  const segLength = frames[i1].progress - frames[i0].progress;
  const localT = segLength === 0 ? 0 : (p - frames[i0].progress) / segLength;

  const position = new THREE.Vector3(
    lerpComponent(localT, i0, i1, 0),
    lerpComponent(localT, i0, i1, 1),
    lerpComponent(localT, i0, i1, 2)
  );

  const target = new THREE.Vector3(
    lerpTargetComponent(localT, i0, i1, 0),
    lerpTargetComponent(localT, i0, i1, 1),
    lerpTargetComponent(localT, i0, i1, 2)
  );

  return { position, target };
}
