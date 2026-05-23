"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeHoveredProject, type HoveredProject } from "@/lib/portfolioState";

export function PortfolioInfo() {
  const [project, setProject] = useState<HoveredProject>(null);
  const [visible, setVisible]  = useState(false);
  const [animKey, setAnimKey]  = useState(0);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return subscribeHoveredProject((p) => {
      if (clearTimer.current) clearTimeout(clearTimer.current);

      if (p) {
        setProject(p);
        setVisible(true);
        setAnimKey(k => k + 1);
      } else {
        setVisible(false);
        clearTimer.current = setTimeout(() => setProject(null), 500);
      }
    });
  }, []);

  if (!project) return null;

  return (
    <div
      key={animKey}
      style={{
        position:      "fixed",
        right:         "5.5%",
        bottom:        "8%",
        zIndex:        40,
        fontFamily:    "monospace",
        pointerEvents: "none",
        textAlign:     "right",
        animation:     visible
          ? "sectionIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards"
          : "sectionOut 0.4s ease forwards",
      }}
    >
      {/* Tag line */}
      <div style={{
        fontSize:       "0.55vw",
        letterSpacing:  "0.5em",
        color:          "rgba(79,195,247,0.5)",
        marginBottom:   "0.5vw",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "flex-end",
        gap:            "0.5vw",
      }}>
        <span style={{
          display:    "inline-block",
          width:      "4vw",
          height:     "1px",
          background: "rgba(79,195,247,0.2)",
        }} />
        <span>{project.client}</span>
      </div>

      {/* Project name */}
      <div style={{
        fontSize:      "2.4vw",
        color:         "#ffffff",
        fontWeight:    200,
        letterSpacing: "0.14em",
        lineHeight:    1,
        marginBottom:  "0.5vw",
        textShadow:    "0 0 40px rgba(79,195,247,0.1)",
      }}>
        {project.name}
      </div>

      {/* Description */}
      <div style={{
        fontSize:      "0.6vw",
        color:         "rgba(255,255,255,0.2)",
        letterSpacing: "0.15em",
        lineHeight:    1.7,
        whiteSpace:    "pre-line",
        marginBottom:  "0.8vw",
      }}>
        {project.desc}
      </div>

      {/* URL */}
      <div style={{
        fontSize:      "0.55vw",
        color:         "rgba(79,195,247,0.35)",
        letterSpacing: "0.35em",
      }}>
        ↗ {project.url}
      </div>
    </div>
  );
}
