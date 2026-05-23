"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeHoveredProject, type HoveredProject } from "@/lib/portfolioState";
import { PORTFOLIO_PROJECTS } from "@/components/canvas/environments/PortfolioSpace";

export function PortfolioHoverImage() {
  const [active, setActive] = useState(false);
  const [src, setSrc]       = useState("");

  useEffect(() => {
    return subscribeHoveredProject((p: HoveredProject) => {
      if (p) {
        const match = PORTFOLIO_PROJECTS.find(proj => proj.project === p);
        if (match) setSrc(match.image);
        setActive(true);
      } else {
        setActive(false);
      }
    });
  }, []);

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        position:      "fixed",
        left:          "var(--port-hover-left,   -200%)",
        top:           "var(--port-hover-top,    -200%)",
        width:         "var(--port-hover-width,    0%)",
        height:        "var(--port-hover-height,   0%)",
        opacity:       active ? 1 : 0,
        objectFit:     "cover",
        objectPosition:"top center",
        zIndex:        2,
        pointerEvents: "none",
        transition:    "opacity 0.25s ease",
        display:       "block",
        userSelect:    "none",
      }}
    />
  );
}
