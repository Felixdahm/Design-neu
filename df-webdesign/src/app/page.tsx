"use client";

import dynamic from "next/dynamic";
import { useLenis } from "@/hooks/useLenis";
import { LoadingScreen } from "@/components/ui/overlay/LoadingScreen";
import { Navigation } from "@/components/ui/overlay/Navigation";
import { ScrollProgress } from "@/components/ui/overlay/ScrollProgress";
import { SCROLL_HEIGHT_VH } from "@/config/world.config";

const WorldScene = dynamic(
  () => import("@/components/canvas/WorldScene").then((m) => m.WorldScene),
  { ssr: false }
);

export default function Home() {
  useLenis();

  return (
    <div style={{ background: "#000" }}>
      {/* z:1 — 3D world */}
      <WorldScene />

      {/* z:10 — invisible scroll height driver */}
      <div
        style={{ height: `${SCROLL_HEIGHT_VH}vh`, position: "relative", zIndex: 10, pointerEvents: "none" }}
        aria-hidden="true"
      />

      {/* z:50+ — UI overlays */}
      <Navigation />
      <ScrollProgress />
      <LoadingScreen />
    </div>
  );
}
