"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  PerspectiveCamera,
  ContactShadows,
  MeshTransmissionMaterial,
  Edges,
} from "@react-three/drei";
import * as THREE from "three";
import { baseModel, PLOT, type Room, type RoomType } from "@/lib/floorplan";
import { getGsap, prefersReducedMotion } from "@/lib/scroll";

/* ------------------------------------------------------------------ *
 * A warm, cinematic dusk scene: a crafted modern glass house with
 * interior light, that dissolves into its floor-plan as you scroll.
 * Original work (not NEST's licensed assets), inspired by its principles.
 * ------------------------------------------------------------------ */

const MAT = {
  plaster: "#d9cfbd",
  plasterDark: "#b7a98f",
  walnut: "#6a4a30",
  slab: "#2b2520",
  glow: "#ffcf93",
};

// progress refs shared scene-wide: p = 0 (arrival) → 1 (plan revealed)
type P = React.MutableRefObject<number>;

function House({ p }: { p: P }) {
  const solid = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const t = p.current;
    // Fade the solid house out as the plan takes over (second half of scroll).
    const solidOpacity = THREE.MathUtils.clamp(1 - (t - 0.45) / 0.4, 0, 1);
    if (solid.current) {
      solid.current.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m && "opacity" in m) {
          (m as THREE.Material & { opacity: number }).transparent = true;
          (m as THREE.Material & { opacity: number }).opacity = solidOpacity;
        }
      });
      solid.current.visible = solidOpacity > 0.01;
    }
    if (glowRef.current) glowRef.current.visible = solidOpacity > 0.05;
  });

  const wall = (
    <meshStandardMaterial color={MAT.plaster} roughness={0.9} metalness={0.02} />
  );

  return (
    <group ref={solid} position={[0, 0, 0]}>
      {/* terrace slab */}
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 0.3, 17]} />
        <meshStandardMaterial color={MAT.plasterDark} roughness={0.95} />
      </mesh>

      {/* ground floor main volume */}
      <mesh position={[-2.5, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 4, 12]} />
        {wall}
      </mesh>
      {/* ground floor glass front (south) */}
      <mesh position={[-2.5, 1.9, 6.05]}>
        <boxGeometry args={[8.4, 3.4, 0.12]} />
        <MeshTransmissionMaterial
          samples={4}
          resolution={256}
          thickness={0.4}
          roughness={0.08}
          ior={1.4}
          chromaticAberration={0.02}
          transmission={1}
          color="#cfe0e6"
          attenuationColor="#bcae95"
          attenuationDistance={4}
        />
      </mesh>

      {/* cantilevered upper volume */}
      <mesh position={[3.2, 5.6, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[8.5, 3.6, 9]} />
        {wall}
      </mesh>
      {/* upper glass band */}
      <mesh position={[3.2, 5.7, 3.35]}>
        <boxGeometry args={[8, 2.6, 0.12]} />
        <MeshTransmissionMaterial
          samples={4}
          resolution={256}
          thickness={0.4}
          roughness={0.08}
          ior={1.4}
          transmission={1}
          color="#cfe0e6"
          attenuationColor="#bcae95"
          attenuationDistance={4}
        />
      </mesh>

      {/* roof slabs with overhang */}
      <mesh position={[-2.5, 4.1, 0.4]} castShadow>
        <boxGeometry args={[9.8, 0.3, 13.2]} />
        <meshStandardMaterial color={MAT.slab} roughness={0.8} />
      </mesh>
      <mesh position={[3.2, 7.5, -0.8]} castShadow>
        <boxGeometry args={[9.3, 0.3, 10]} />
        <meshStandardMaterial color={MAT.slab} roughness={0.8} />
      </mesh>

      {/* warm interior glow (emissive) + lights behind glass */}
      <group ref={glowRef}>
        <mesh position={[-2.5, 1.9, 5.7]}>
          <planeGeometry args={[7.6, 3]} />
          <meshBasicMaterial color={MAT.glow} toneMapped={false} opacity={0.5} transparent />
        </mesh>
        <mesh position={[3.2, 5.7, 3.1]}>
          <planeGeometry args={[7, 2.2]} />
          <meshBasicMaterial color={MAT.glow} toneMapped={false} opacity={0.42} transparent />
        </mesh>
        <pointLight position={[-2.5, 2, 3]} intensity={18} distance={14} color={MAT.glow} />
        <pointLight position={[3.2, 5.6, 0]} intensity={14} distance={14} color={MAT.glow} />
      </group>
    </group>
  );
}

const ROOM_LINE: Record<RoomType, string> = {
  living: "#e9b98a",
  kitchen: "#e9cf8a",
  bed: "#cdbfe0",
  bath: "#8fc6d8",
  service: "#b7ad9a",
};

/** Flat floor-plan that rises in as the house dissolves. */
function PlanReveal({ p }: { p: P }) {
  const group = useRef<THREE.Group>(null);
  const rooms = baseModel();
  const SC = 0.42; // scale feet → scene units to match house footprint
  useFrame(() => {
    if (!group.current) return;
    const t = p.current;
    const a = THREE.MathUtils.clamp((t - 0.4) / 0.4, 0, 1);
    group.current.visible = a > 0.01;
    group.current.position.y = THREE.MathUtils.lerp(-0.2, 0.08, a);
    group.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as (THREE.Material & { opacity: number }) | undefined;
      if (m && "opacity" in m) {
        m.transparent = true;
        m.opacity = a;
      }
    });
  });
  return (
    <group ref={group} rotation={[0, 0, 0]} position={[0, 0, 0]}>
      {rooms.map((r: Room) => {
        const w = r.w * SC;
        const h = r.h * SC;
        const x = (r.x + r.w / 2 - PLOT.w / 2) * SC;
        const z = (r.y + r.h / 2 - PLOT.h / 2) * SC;
        return (
          <mesh key={r.id} position={[x, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[w - 0.12, h - 0.12]} />
            <meshBasicMaterial color="#1c1813" transparent opacity={0} />
            <Edges color={ROOM_LINE[r.type]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Rig({ p }: { p: P }) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  useFrame((state, dt) => {
    if (!cam.current) return;
    const reduce = prefersReducedMotion();
    const t = p.current;
    const aspect = state.size.width / Math.max(1, state.size.height);
    const fit = aspect < 1 ? THREE.MathUtils.lerp(1, 0.68, THREE.MathUtils.clamp((1 - aspect) / 0.6, 0, 1)) : 1;

    // Arrival (low cinematic 3/4) → push in → lift to near top-down for the plan.
    const px = reduce ? 0 : state.pointer.x * 2.2;
    const py = reduce ? 0 : state.pointer.y * 1.4;
    const ex = THREE.MathUtils.lerp(20, 2, t) * fit + px;
    const ey = THREE.MathUtils.lerp(8, 30, Math.pow(t, 1.3)) * fit - py * (1 - t);
    const ez = THREE.MathUtils.lerp(26, 8, t) * fit;
    cam.current.position.x = THREE.MathUtils.damp(cam.current.position.x, ex, 3.5, dt);
    cam.current.position.y = THREE.MathUtils.damp(cam.current.position.y, ey, 3.5, dt);
    cam.current.position.z = THREE.MathUtils.damp(cam.current.position.z, ez, 3.5, dt);
    const ly = THREE.MathUtils.lerp(3.4, 0, t);
    cam.current.lookAt(0, ly, 0);
  });
  return <PerspectiveCamera ref={cam} makeDefault fov={40} position={[20, 8, 26]} />;
}

function Scene({ p }: { p: P }) {
  return (
    <>
      {/* warm dusk haze — fades distant geometry to amber */}
      <fog attach="fog" args={["#caa06a", 34, 80]} />
      <Rig p={p} />

      <ambientLight intensity={0.35} color="#ffe6c4" />
      {/* low golden key (setting sun) */}
      <directionalLight
        position={[-22, 14, 10]}
        intensity={3.4}
        color="#ffb871"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />
      {/* cool sky fill */}
      <directionalLight position={[16, 20, -12]} intensity={0.6} color="#9fb4e0" />

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
        <circleGeometry args={[120, 64]} />
        <meshStandardMaterial color="#3a3026" roughness={1} />
      </mesh>

      <House p={p} />
      <PlanReveal p={p} />

      <ContactShadows position={[0, -0.14, 0]} opacity={0.5} scale={60} blur={2.4} far={30} color="#120d08" />

      {/* reflections/refractions for the glass — built from lightformers (no network HDR) */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.4} color="#ffd9a6" position={[-10, 8, 6]} scale={[14, 8, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#b9ccf0" position={[12, 10, -8]} scale={[12, 8, 1]} />
        <Lightformer form="circle" intensity={1.6} color="#ffe8c8" position={[0, 14, 2]} scale={[8, 8, 1]} />
      </Environment>
    </>
  );
}

export default function CinematicHero() {
  const [mounted, setMounted] = useState(false);
  const p = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const { gsap, ScrollTrigger } = getGsap();
    const reduce = prefersReducedMotion();

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=220%",
      pin: true,
      scrub: reduce ? false : 1,
      onUpdate: (self) => (p.current = self.progress),
    });

    let tween: gsap.core.Tween | undefined;
    if (!reduce && overlayRef.current) {
      tween = gsap.to(overlayRef.current, {
        opacity: 0,
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "+=90%", scrub: true },
      });
    }

    // reduced motion: show the plan directly so the story still reads.
    if (reduce) p.current = 0.9;

    return () => {
      st.kill();
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [mounted]);

  return (
    <section className="ch" id="top" ref={sectionRef}>
      <div className="ch-sky" aria-hidden="true" />
      <div className="ch-canvas">
        {mounted && (
          <Canvas shadows dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
            <Scene p={p} />
          </Canvas>
        )}
      </div>
      <div className="ch-grain" aria-hidden="true" />

      {/* floating glass panels — the interface lives in the scene */}
      <div className="ch-ui">
        <div className="ch-badge glass mono">DRAFT · LIVING DESIGN STUDIO</div>
        <nav className="ch-rail glass">
          <span className="ch-rail-h mono">EXPERIENCES</span>
          <a className="on">01 — Discover</a>
          <a>02 — Create</a>
          <a>03 — Experience</a>
          <a>04 — Personalize</a>
          <a>05 — Present</a>
        </nav>
      </div>

      <div className="ch-overlay" ref={overlayRef}>
        <p className="ch-eyebrow mono"><span className="ch-rule" />FROM SPACE TO HOME</p>
        <h1 className="ch-title">Space is only<br />the <em>beginning.</em></h1>
        <p className="ch-sub">
          From your first floor plan to the finishing touches. Imagine it, design it, make it yours —
          inside a home you can walk through before it exists.
        </p>
        <div className="ch-cta">
          <Link className="ch-btn primary" href="/create">Begin designing <span aria-hidden="true">→</span></Link>
          <a className="ch-btn ghost" href="#story">See how it works</a>
        </div>
      </div>

      <div className="ch-scrollhint mono" aria-hidden="true">SCROLL — WATCH IT BECOME A PLAN</div>
      <span id="story" className="ch-anchor" />
    </section>
  );
}
