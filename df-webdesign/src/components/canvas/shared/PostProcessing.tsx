"use client";

import { EffectComposer, SelectiveBloom, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Vector2 } from "three";

export function PostProcessing() {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      {/* SELECTIVE BLOOM (inverted) — blooms everything EXCEPT meshes in the
          Selection context (the portfolio screen planes). Frame/glow/dots keep
          their bloom; screenshot textures show original colors. */}
      <SelectiveBloom
        intensity={1.2}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.7}
        kernelSize={KernelSize.LARGE}
        mipmapBlur={false}
        inverted
      />

      <Vignette
        offset={0.22}
        darkness={0.65}
        eskil={false}
        blendFunction={BlendFunction.MULTIPLY}
      />

      <ChromaticAberration
        offset={new Vector2(0.0005, 0.0005)}
        radialModulation={false}
        modulationOffset={0}
      />

      <Noise opacity={0.022} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
