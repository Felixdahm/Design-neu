"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { CameraRig } from "./shared/CameraRig";
import { ParticleField } from "./shared/ParticleField";
import { DynamicLighting } from "./shared/DynamicLighting";
import { PostProcessing } from "./shared/PostProcessing";
import { VoidIntro } from "./environments/VoidIntro";
import { ServicesWorld } from "./environments/ServicesWorld";
import { PortfolioSpace } from "./environments/PortfolioSpace";
import { AILab } from "./environments/AILab";
import { ContactTerminal } from "./environments/ContactTerminal";
import { FOG } from "@/config/world.config";
import { getPerformanceTier } from "@/lib/performanceTier";

const tier = getPerformanceTier();

export function WorldScene() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, background: "transparent" }}>
      <Canvas
        camera={{ fov: 55, near: 0.1, far: 200, position: [0, 0, 12] }}
        gl={{
          antialias: true,
          alpha: true,              // Transparent — video shows through
          powerPreference: "high-performance",
          toneMapping: 4,
          toneMappingExposure: 0.85,
        }}
        style={{ width: "100%", height: "100%" }}
        dpr={tier === "low" ? [1, 1] : [1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)} // Alpha 0 = fully transparent bg
      >
        {/* Selection context — used by SelectiveBloom (inverted) in PostProcessing.
            Any mesh wrapped in <Select enabled> is excluded from bloom. */}
          {/* Fog fades 3D objects into the video background — no hard edges */}
          <fog attach="fog" args={["#000008", FOG.near, FOG.far]} />
          <ambientLight intensity={0.08} color="#0a0a18" />

          {/* Camera + lights — no Suspense, no async deps */}
          <CameraRig />
          <DynamicLighting />

          {/* Particles — own Suspense so it can't block anything */}
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>

          <VoidIntro />

          <Suspense fallback={null}>
            <ServicesWorld />
          </Suspense>
          <Suspense fallback={null}>
            <PortfolioSpace />
          </Suspense>
          <Suspense fallback={null}>
            <AILab />
          </Suspense>
          <Suspense fallback={null}>
            <ContactTerminal />
          </Suspense>

          <Suspense fallback={null}>
            <PostProcessing />
          </Suspense>
      </Canvas>
    </div>
  );
}
