"use client";

import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Vector2 } from "three";
import { getPerformanceTier } from "@/lib/performanceTier";

const tier = getPerformanceTier();

export function PostProcessing() {
  if (tier === "low") {
    return (
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.7}
          kernelSize={KernelSize.SMALL}
          mipmapBlur={false}
        />
        <Vignette
          offset={0.22}
          darkness={0.65}
          eskil={false}
          blendFunction={BlendFunction.MULTIPLY}
        />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.7}
        kernelSize={KernelSize.LARGE}
        mipmapBlur={false}
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
