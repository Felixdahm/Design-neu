"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import * as THREE from "three";
import { ENVIRONMENTS, THREE_COLORS } from "@/config/world.config";
import { getScrollProgress, getIsScrolling } from "@/hooks/useLenis";
import { setHoveredProject, type HoveredProject } from "@/lib/portfolioState";

const PORTFOLIO_CENTER = 0.5;

export const PORTFOLIO_PROJECTS: {
  pos: [number, number, number];
  rot: [number, number, number];
  image: string;
  project: HoveredProject;
}[] = [
  {
    pos:   [-2.4, 0, 0.2],
    rot:   [0,  0.18, 0],
    image: "/img_5.png",
    project: {
      name:   "LEADPILOT",
      client: "KI-Erklärfilme.de",
      desc:   "AI-produzierte Erklärvideos\ndie Aufmerksamkeit erzeugen",
      url:    "www.ki-erklärfilme.de",
    },
  },
  {
    pos:   [ 2.4, 0, 0.2],
    rot:   [0, -0.18, 0],
    image: "/img_6.png",
    project: {
      name:   "CRONOS",
      client: "Cronos Memmingen",
      desc:   "Personalvermittlung &\nKarriereberatung in Memmingen",
      url:    "cronos-memmingen.de",
    },
  },
];

function PortfolioScreen({
  pos, rot, image, project,
}: {
  pos: [number, number, number];
  rot: [number, number, number];
  image: string;
  project: HoveredProject;
}) {
  const groupRef    = useRef<THREE.Group>(null);
  const hovered     = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  const texture = useLoader(THREE.TextureLoader, image);
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter  = THREE.LinearFilter;
    texture.magFilter  = THREE.LinearFilter;
  }, [texture]);

  const frameMat = useRef(new THREE.MeshStandardMaterial({
    color: "#000",
    emissive: THREE_COLORS.accentBlue,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.8,
  }));

  const onEnter = useCallback(() => {
    if (getIsScrolling()) return;
    if (Math.abs(getScrollProgress() - PORTFOLIO_CENTER) >= 0.16) return;
    hovered.current = true;
    setIsHovered(true);
    setHoveredProject(project);
    document.body.style.cursor = "pointer";
  }, [project]);

  const onLeave = useCallback(() => {
    hovered.current = false;
    setIsHovered(false);
    setHoveredProject(null);
    document.body.style.cursor = "default";
  }, []);

  const onClick = useCallback(() => {
    if (!hovered.current || !project?.url) return;
    window.open(`https://${project.url}`, "_blank", "noopener,noreferrer");
  }, [project]);

  useFrame(() => {
    if (!groupRef.current) return;
    const inView = Math.abs(getScrollProgress() - PORTFOLIO_CENTER) < 0.16;

    // Clear hover when the section scrolls out of view (onPointerLeave won't fire on hidden meshes)
    if (!inView && hovered.current) {
      hovered.current = false;
      setIsHovered(false);
      setHoveredProject(null);
      document.body.style.cursor = "default";
    }

    const targetScale = (inView && hovered.current) ? 1.06 : 1.0;
    const cur         = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(cur + (targetScale - cur) * 0.08);
  });

  return (
    <group ref={groupRef} position={pos} rotation={rot}>
      {/* On hover: Select excludes this mesh from bloom → original colors show */}
      <Select enabled={isHovered}>
        <mesh onPointerEnter={onEnter} onPointerLeave={onLeave} onClick={onClick}>
          <planeGeometry args={[3.5, 2.25]} />
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      </Select>

      {/* Frame, glow line, dots — NOT in Select → they keep their bloom */}
      <mesh position={[0, 0, -0.04]} raycast={() => undefined}>
        <boxGeometry args={[3.7, 2.42, 0.04]} />
        <primitive object={frameMat.current} attach="material" />
      </mesh>

      <mesh position={[0, -1.12, 0.01]} raycast={() => undefined}>
        <boxGeometry args={[3.5, 0.003, 0.01]} />
        <meshStandardMaterial color="#000" emissive={THREE_COLORS.accentBlue} emissiveIntensity={2.5} />
      </mesh>

      {([[-1.7, 1.1], [1.7, 1.1], [-1.7, -1.1], [1.7, -1.1]] as [number,number][]).map(([cx, cy], i) => (
        <mesh key={i} position={[cx, cy, 0.01]} raycast={() => undefined}>
          <circleGeometry args={[0.016, 12]} />
          <meshStandardMaterial color="#000" emissive={THREE_COLORS.accentBlue} emissiveIntensity={2.0} />
        </mesh>
      ))}
    </group>
  );
}

export function PortfolioSpace() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.visible = Math.abs(getScrollProgress() - PORTFOLIO_CENTER) < 0.18;
  });

  return (
    <group ref={groupRef} position={[0, 0, ENVIRONMENTS.portfolio.z]}>
      {PORTFOLIO_PROJECTS.map((s, i) => (
        <PortfolioScreen key={i} {...s} />
      ))}
      <pointLight position={[0, 4, 4]}  color={THREE_COLORS.accentBlue} intensity={12} distance={25} decay={2} />
      <pointLight position={[0, -3, 2]} color={THREE_COLORS.glowBlue}   intensity={5}  distance={18} decay={2} />
    </group>
  );
}
