"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { baseModel, mirrorX, PLOT, type Room, type RoomType } from "@/lib/floorplan";
import { getGsap, prefersReducedMotion } from "@/lib/scroll";

const WALL_H = 10; // feet
const CX = PLOT.w / 2;
const CZ = PLOT.h / 2;

// Warm dark massing palette — near-black volumes with faint warm separation.
const ROOM_TONE: Record<RoomType, string> = {
  living: "#2b231c",
  kitchen: "#272019",
  bed: "#241d18",
  bath: "#1d2228",
  service: "#1c1813",
};

function Massing({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const ground = baseModel();
  const upper = mirrorX(baseModel());

  function Floor({ rooms, y }: { rooms: Room[]; y: number }) {
    return (
      <group position={[0, y, 0]}>
        {rooms.map((r) => (
          <mesh
            key={r.id}
            position={[r.x + r.w / 2 - CX, WALL_H / 2, r.y + r.h / 2 - CZ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[r.w - 0.4, WALL_H, r.h - 0.4]} />
            <meshStandardMaterial
              color={ROOM_TONE[r.type]}
              roughness={0.82}
              metalness={0.12}
            />
            <Edges threshold={14} color="#8a6b4f" />
          </mesh>
        ))}
      </group>
    );
  }

  // Gentle idle rotation + scroll-driven settle.
  useFrame((_, dt) => {
    if (!group.current) return;
    const reduce = prefersReducedMotion();
    const target = reduce ? -0.5 : -0.5 - scroll.current * 0.5;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      target + (reduce ? 0 : Math.sin(performance.now() / 6000) * 0.06),
      3,
      dt
    );
  });

  return (
    <group ref={group} rotation={[0, -0.5, 0]}>
      <Floor rooms={ground} y={0} />
      <Floor rooms={upper} y={WALL_H + 0.6} />
    </group>
  );
}

function Rig({ scroll }: { scroll: React.MutableRefObject<number> }) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  useFrame((state, dt) => {
    if (!cam.current) return;
    const reduce = prefersReducedMotion();
    const p = scroll.current;
    // Pull closer on portrait/narrow viewports so the massing keeps filling
    // the frame instead of shrinking into empty black.
    const aspect = state.size.width / Math.max(1, state.size.height);
    const fit = aspect < 1 ? THREE.MathUtils.lerp(1, 0.62, THREE.MathUtils.clamp((1 - aspect) / 0.6, 0, 1)) : 1;
    // Dolly down + in as the hero scrolls past (cinematic descent).
    const baseY = THREE.MathUtils.lerp(42, 20, p) * fit;
    const baseZ = THREE.MathUtils.lerp(72, 42, p) * fit;
    const px = reduce ? 0 : state.pointer.x * 7;
    const py = reduce ? 0 : state.pointer.y * 4;
    cam.current.position.x = THREE.MathUtils.damp(cam.current.position.x, 38 * fit + px, 4, dt);
    cam.current.position.y = THREE.MathUtils.damp(cam.current.position.y, baseY - py, 4, dt);
    cam.current.position.z = THREE.MathUtils.damp(cam.current.position.z, baseZ, 4, dt);
    cam.current.lookAt(0, 9, 0);
  });
  return <PerspectiveCamera ref={cam} makeDefault fov={36} position={[38, 42, 72]} />;
}

function Scene({ scroll }: { scroll: React.MutableRefObject<number> }) {
  return (
    <>
      <color attach="background" args={["#0a0908"]} />
      <fog attach="fog" args={["#0a0908", 60, 140]} />
      <Rig scroll={scroll} />
      <ambientLight intensity={0.18} />
      {/* warm key light */}
      <directionalLight
        position={[26, 44, 20]}
        intensity={2.4}
        color="#ffd7a8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      {/* cool rim from behind for separation */}
      <directionalLight position={[-30, 20, -30]} intensity={0.7} color="#7d93c8" />
      <Massing scroll={scroll} />
      <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={90} blur={2.6} far={40} color="#000000" />
    </>
  );
}

export default function NestHero() {
  const [mounted, setMounted] = useState(false);
  const scroll = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Scroll-driven progress (0 → 1 across the hero) + overlay parallax/fade.
  useEffect(() => {
    if (!sectionRef.current) return;
    const { gsap, ScrollTrigger } = getGsap();
    const reduce = prefersReducedMotion();

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => (scroll.current = self.progress),
    });

    let tween: gsap.core.Tween | undefined;
    if (!reduce && overlayRef.current) {
      tween = gsap.to(overlayRef.current, {
        yPercent: 22,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    }
    return () => {
      st.kill();
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [mounted]);

  return (
    <section className="nh" id="top" ref={sectionRef}>
      <div className="nh-canvas">
        {mounted && (
          <Canvas
            shadows
            dpr={[1, 1.6]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
          >
            <Scene scroll={scroll} />
          </Canvas>
        )}
      </div>

      <div className="nh-vignette" aria-hidden="true" />

      <div className="nh-overlay" ref={overlayRef}>
        <p className="nh-eyebrow mono"><span className="nh-rule" />NEST · RESIDENTIAL DESIGN STUDIO</p>
        <h1 className="nh-title">
          Design the home<br />you&apos;ve <em>imagined.</em>
        </h1>
        <p className="nh-sub">
          Describe a home in plain words. Draft composes it in three dimensions — a place you can
          walk, shape and feel, long before the first wall goes up.
        </p>
        <div className="nh-cta">
          <Link className="nh-btn primary" href="/create">Begin your home <span aria-hidden="true">→</span></Link>
          <a className="nh-btn ghost" href="#concept">Explore the experience</a>
        </div>
      </div>

      <div className="nh-foot mono">
        <span>SCROLL TO ENTER</span>
        <span className="nh-foot-line" />
      </div>
    </section>
  );
}
