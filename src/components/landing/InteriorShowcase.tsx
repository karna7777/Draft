"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/scroll";

interface Style { wall: string; floor: string; furnA: string; furnB: string; glow: string; light: string; budget: number }
const STYLES: Record<string, Style> = {
  Japandi:       { wall: "#cfc6b4", floor: "#6b4a2f", furnA: "#b7a684", furnB: "#8a7a63", glow: "#ffe6bf", light: "#ffe7c6", budget: 420000 },
  Industrial:    { wall: "#3c4046", floor: "#2a2b2e", furnA: "#51555b", furnB: "#23262c", glow: "#cfe0ff", light: "#d6e4ff", budget: 510000 },
  "Modern Luxe": { wall: "#262a33", floor: "#b7b0a2", furnA: "#c9a46a", furnB: "#e6dcc6", glow: "#ffe9c6", light: "#ffeccf", budget: 980000 },
  Minimal:       { wall: "#e9e5dd", floor: "#d4cdbf", furnA: "#cdc8bd", furnB: "#9a948a", glow: "#eef2f7", light: "#eef2f7", budget: 350000 },
};
const NAMES = Object.keys(STYLES);

const W = 18, D = 13, H = 9;

function Rig() {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  useFrame((s, dt) => {
    if (!cam.current) return;
    const reduce = prefersReducedMotion();
    const px = reduce ? 0 : s.pointer.x * 1.8;
    const py = reduce ? 0 : s.pointer.y * 1.0;
    cam.current.position.x = THREE.MathUtils.damp(cam.current.position.x, px, 3, dt);
    cam.current.position.y = THREE.MathUtils.damp(cam.current.position.y, 4.6 - py, 3, dt);
    cam.current.lookAt(0, 3.6, -3);
  });
  return <PerspectiveCamera ref={cam} makeDefault fov={48} position={[0, 4.6, 13]} near={0.3} far={120} />;
}

function Room({ styleName, reduce }: { styleName: string; reduce: boolean }) {
  const mats = useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ roughness: 0.96 }),
    floor: new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.12 }),
    furnA: new THREE.MeshStandardMaterial({ roughness: 0.7 }),
    furnB: new THREE.MeshStandardMaterial({ roughness: 0.6 }),
    glow: new THREE.MeshBasicMaterial({ toneMapped: false }),
  }), []);
  const key = useRef<THREE.DirectionalLight>(null);
  const lamp = useRef<THREE.PointLight>(null);

  // current (lerped) colors
  const cur = useMemo(() => {
    const s = STYLES[styleName];
    return { wall: new THREE.Color(s.wall), floor: new THREE.Color(s.floor), furnA: new THREE.Color(s.furnA), furnB: new THREE.Color(s.furnB), glow: new THREE.Color(s.glow), light: new THREE.Color(s.light) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, dt) => {
    const s = STYLES[styleName];
    const k = reduce ? 1 : 1 - Math.pow(0.0001, dt);
    cur.wall.lerp(new THREE.Color(s.wall), k);
    cur.floor.lerp(new THREE.Color(s.floor), k);
    cur.furnA.lerp(new THREE.Color(s.furnA), k);
    cur.furnB.lerp(new THREE.Color(s.furnB), k);
    cur.glow.lerp(new THREE.Color(s.glow), k);
    cur.light.lerp(new THREE.Color(s.light), k);
    mats.wall.color.copy(cur.wall);
    mats.floor.color.copy(cur.floor);
    mats.furnA.color.copy(cur.furnA);
    mats.furnB.color.copy(cur.furnB);
    mats.glow.color.copy(cur.glow);
    if (key.current) key.current.color.copy(cur.light);
    if (lamp.current) lamp.current.color.copy(cur.glow);
  });

  return (
    <group>
      {/* shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={mats.floor} receiveShadow>
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh position={[0, H / 2, -D / 2]} material={mats.wall} receiveShadow>
        <planeGeometry args={[W, H]} />
      </mesh>
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={mats.wall} receiveShadow>
        <planeGeometry args={[D, H]} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]} material={mats.wall} receiveShadow>
        <planeGeometry args={[D, H]} />
      </mesh>
      {/* window glow on back wall */}
      <mesh position={[4.6, 4.6, -D / 2 + 0.05]} material={mats.glow}>
        <planeGeometry args={[6, 5]} />
      </mesh>

      {/* furniture */}
      <mesh position={[-2.2, 1.3, -1.6]} material={mats.furnA} castShadow>
        <boxGeometry args={[7.5, 2.4, 3.2]} />
      </mesh>
      <mesh position={[-2.2, 0.55, 1.8]} material={mats.furnB} castShadow>
        <boxGeometry args={[4.2, 1.1, 2.2]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, 0.03, 0.4]} material={mats.furnB}>
        <planeGeometry args={[9, 6]} />
      </mesh>
      <mesh position={[6.4, 3, -4.6]} material={mats.furnA} castShadow>
        <boxGeometry args={[0.8, 6, 4.4]} />
      </mesh>
      {/* floor lamp */}
      <mesh position={[5, 2.6, 2]} material={mats.furnB}>
        <cylinderGeometry args={[0.12, 0.12, 5.2, 10]} />
      </mesh>
      <mesh position={[5, 5.3, 2]} material={mats.glow}>
        <sphereGeometry args={[0.6, 16, 12]} />
      </mesh>
      {/* plant */}
      <mesh position={[-7.4, 1.4, -3.4]} material={mats.furnB}>
        <cylinderGeometry args={[0.6, 0.5, 2.8, 10]} />
      </mesh>

      <ambientLight intensity={0.5} color="#c7d2e6" />
      <directionalLight ref={key} position={[6, 10, 6]} intensity={2.1} />
      <pointLight ref={lamp} position={[5, 5.2, 2]} intensity={16} distance={20} decay={1.4} />
      <ContactShadows position={[0, 0.02, 0]} opacity={0.5} scale={26} blur={2.4} far={14} color="#000000" />
    </group>
  );
}

function RoomCanvas({ styleName }: { styleName: string }) {
  const reduce = prefersReducedMotion();
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <Rig />
      <Room styleName={styleName} reduce={reduce} />
    </Canvas>
  );
}
const RoomCanvasLazy = dynamic(() => Promise.resolve(RoomCanvas), { ssr: false });

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function InteriorShowcase() {
  const [style, setStyle] = useState("Japandi");
  const [inView, setInView] = useState(false);
  const [budget, setBudget] = useState(STYLES.Japandi.budget);
  const sectionRef = useRef<HTMLElement>(null);

  // Mount the room canvas only when the section is near view — one GL context
  // at a time, and nothing rendering off-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // count-up budget when style changes
  useEffect(() => {
    const target = STYLES[style].budget;
    let raf = 0; const start = performance.now(); const from = budget;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 600);
      setBudget(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style]);

  return (
    <section className="is" id="interior" ref={sectionRef}>
      <div className="is-canvas">{inView && <RoomCanvasLazy styleName={style} />}</div>
      <div className="is-frame" aria-hidden="true" />

      <div className="is-ui">
        <div className="is-copy">
          <p className="hs-eyebrow mono"><span className="hs-rule" />STEP INTO THE ROOM</p>
          <h2 className="is-h">Design it from the inside.</h2>
          <p className="is-sub">Pick a style and the whole room responds — walls, floor, furniture and light shift live. In the studio you place every piece yourself.</p>
        </div>

        <div className="is-panel glass">
          <span className="is-panel-h mono">INTERIOR STYLE</span>
          <div className="is-chips">
            {NAMES.map((n) => (
              <button key={n} className={`is-chip ${style === n ? "on" : ""}`} onClick={() => setStyle(n)}>{n}</button>
            ))}
          </div>
          <div className="is-budget">
            <span className="mono">EST. BUDGET</span>
            <b className="mono">{inr(budget)}</b>
          </div>
          <p className="is-note mono">Estimate only — not verified market pricing.</p>
          <Link className="btn-ice is-cta" href="/create">Design your own <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
