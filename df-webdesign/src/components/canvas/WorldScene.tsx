"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./shared/CameraRig";
import { ParticleField } from "./shared/ParticleField";
import { DynamicLighting } from "./shared/DynamicLighting";
import { VoidIntro } from "./environments/VoidIntro";
import { ServicesWorld } from "./environments/ServicesWorld";
import { PortfolioSpace } from "./environments/PortfolioSpace";
import { AILab } from "./environments/AILab";
import { ContactTerminal } from "./environments/ContactTerminal";
import { FOG } from "@/config/world.config";

export function WorldScene() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: "#000",
      }}
    >
      <Canvas
        camera={{ fov: 55, near: 0.1, far: 200, position: [0, 0, 12] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: 4,
          toneMappingExposure: 0.85,
        }}
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 1)}
      >
        <fog attach="fog" args={["#030306", FOG.near, FOG.far]} />
        <ambientLight intensity={0.05} color="#0a0a18" />

        <CameraRig />
        <DynamicLighting />

        <Suspense fallback={null}>
          <ParticleField />
          <VoidIntro />
          <ServicesWorld />
          <PortfolioSpace />
          <AILab />
          <ContactTerminal />
        </Suspense>
      </Canvas>
    </div>
  );
}
