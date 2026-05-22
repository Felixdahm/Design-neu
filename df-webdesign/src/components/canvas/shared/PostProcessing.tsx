"use client";

import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Vector2 } from "three";

// Static values only — no dynamic refs.
// Dynamic scroll-reactive effects come in Phase 2.

export function PostProcessing() {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      {/* BLOOM — the single most important effect.
          Makes every emissive material produce a real glow halo.
          Without this: glowing lines. With this: cinematic sci-fi atmosphere. */}
      <Bloom
        intensity={1.4}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.85}
        kernelSize={KernelSize.HUGE}
        mipmapBlur
      />

      {/* VIGNETTE — darkens edges, forces attention to center.
          Every cinema camera lens does this naturally. */}
      <Vignette
        offset={0.22}
        darkness={0.65}
        eskil={false}
        blendFunction={BlendFunction.MULTIPLY}
      />

      {/* CHROMATIC ABERRATION — subtle RGB lens separation.
          Makes it feel like a real optical system, not CG. */}
      <ChromaticAberration
        offset={new Vector2(0.0005, 0.0005)}
        radialModulation={false}
        modulationOffset={0}
      />

      {/* FILM GRAIN — micro-texture.
          Prevents the "too clean" digital look. */}
      <Noise opacity={0.022} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
