"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Vector2 } from "three";

// Static post-processing chain.
// Dynamic values are handled separately via useFrame in the scene.
// Keeping this static prevents any ref-related crashes in EffectComposer v3.

const ABERRATION_OFFSET = new Vector2(0.0004, 0.0004);

export function PostProcessing() {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />
      <Vignette
        offset={0.25}
        darkness={0.6}
        eskil={false}
        blendFunction={BlendFunction.MULTIPLY}
      />
      <ChromaticAberration
        offset={ABERRATION_OFFSET}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise
        opacity={0.025}
        blendFunction={BlendFunction.OVERLAY}
      />
    </EffectComposer>
  );
}
