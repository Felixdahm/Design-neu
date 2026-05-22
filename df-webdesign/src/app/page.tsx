"use client";

import dynamic from "next/dynamic";
import { useLenis } from "@/hooks/useLenis";
import { LoadingScreen } from "@/components/ui/overlay/LoadingScreen";
import { Navigation } from "@/components/ui/overlay/Navigation";
import { ContactForm } from "@/components/ui/overlay/ContactForm";
import { ScrollProgress } from "@/components/ui/overlay/ScrollProgress";
import { BackgroundVideo } from "@/components/ui/overlay/BackgroundVideo";
import { SCROLL_HEIGHT_VH } from "@/config/world.config";

const WorldScene = dynamic(
  () => import("@/components/canvas/WorldScene").then((m) => m.WorldScene),
  { ssr: false }
);

export default function Home() {
  useLenis();

  return (
    <div style={{ background: "#000005" }}>
      {/* z:0 — Cosmic nebula video — the living world behind everything */}
      <BackgroundVideo />

      {/* z:1 — Three.js canvas — transparent, floats IN the nebula */}
      <WorldScene />

      {/* z:10 — scroll height driver — invisible */}
      <div
        style={{ height: `${SCROLL_HEIGHT_VH}vh`, position: "relative", zIndex: 10, pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* z:50+ — UI overlays */}
      <Navigation />
      <ScrollProgress />
      <ContactForm />
      <LoadingScreen />
    </div>
  );
}
