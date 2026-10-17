"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { C, WALL_H, CX, CZ, FOCUS_ROOM, focusFurniture, rooms, ROOM_LABEL } from "@/lib/scene";
import { area, type Room } from "@/lib/floorplan";
import { prefersReducedMotion } from "@/lib/scroll";

export interface HoverInfo { name: string; area: number; x: number; y: number }
type Prog = React.MutableRefObject<number>;

const smooth = (p: number, a: number, b: number) =>
  THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
const ease = (t: number) => t * t * (3 - 2 * t);

// camera keyframes: exterior -> top-down plan -> dive into focus room
const FOCUS: [number, number, number] = [6, 0, -17];
const KEYS: { p: number; pos: [number, number, number]; tgt: [number, number, number] }[] = [
  { p: 0.0, pos: [34, 20, 42], tgt: [0, 5, 0] },
  { p: 0.3, pos: [40, 27, 28], tgt: [0, 6, 0] },
  { p: 0.52, pos: [6, 58, 7], tgt: [0, 0, -5] },
  { p: 0.72, pos: [6, 22, 14], tgt: [6, 1, -16] },
  { p: 0.9, pos: [5, 7, 2], tgt: [4, 1.5, -15] },
  { p: 1.0, pos: [5, 6.5, 0], tgt: [4, 1.5, -15] },
];
function sampleKeys(p: number) {
  let i = 0;
  while (i < KEYS.length - 1 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const t = a.p === b.p ? 0 : ease((p - a.p) / (b.p - a.p));
  const lerp3 = (u: number[], v: number[]) => [
    THREE.MathUtils.lerp(u[0], v[0], t),
    THREE.MathUtils.lerp(u[1], v[1], t),
    THREE.MathUtils.lerp(u[2], v[2], t),
  ];
  return { pos: lerp3(a.pos, b.pos), tgt: lerp3(a.tgt, b.tgt) };
}

function Rig({ progress }: { progress: Prog }) {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const tgt = useRef(new THREE.Vector3(0, 5, 0));
  useFrame((state, dt) => {
    if (!cam.current) return;
    const reduce = prefersReducedMotion();
    const p = progress.current;
    const { pos, tgt: t } = sampleKeys(p);
    const aspect = state.size.width / Math.max(1, state.size.height);
    const fit = aspect < 1 ? THREE.MathUtils.lerp(1, 0.72, THREE.MathUtils.clamp((1 - aspect) / 0.6, 0, 1)) : 1;
    const px = reduce ? 0 : state.pointer.x * 2.5 * (1 - p);
    const py = reduce ? 0 : state.pointer.y * 1.6 * (1 - p);
    const k = reduce ? 1 : 6;
    cam.current.position.x = THREE.MathUtils.damp(cam.current.position.x, pos[0] * (p < 0.5 ? fit : 1) + px, k, dt);
    cam.current.position.y = THREE.MathUtils.damp(cam.current.position.y, pos[1] * (p < 0.5 ? fit : 1) - py, k, dt);
    cam.current.position.z = THREE.MathUtils.damp(cam.current.position.z, pos[2] * (p < 0.5 ? fit : 1), k, dt);
    tgt.current.lerp(new THREE.Vector3(t[0], t[1], t[2]), reduce ? 1 : 0.1);
    cam.current.lookAt(tgt.current);
  });
  return <PerspectiveCamera ref={cam} makeDefault fov={42} position={[34, 20, 42]} near={0.5} far={400} />;
}

function Walls({ progress, onHover }: { progress: Prog; onHover: (h: HoverInfo | null) => void }) {
  const group = useRef<THREE.Group>(null);
  const rs = useMemo(() => rooms(), []);
  const [hovered, setHovered] = useState<string | null>(null);

  useFrame(() => {
    if (!group.current) return;
    const p = progress.current;
    const sy = THREE.MathUtils.lerp(1, 0.02, ease(smooth(p, 0.34, 0.55)));
    const glow = 1 - ease(smooth(p, 0.34, 0.52));
    group.current.children.forEach((child) => {
      const g = child as THREE.Group;
      g.scale.y = sy;
      const rid = g.userData.rid as string;
      const win = g.children[1] as THREE.Mesh | undefined;
      if (win) {
        const m = win.material as THREE.MeshStandardMaterial;
        m.opacity = 0.55 * glow + (rid === hovered ? 0.4 : 0);
      }
      const box = g.children[0] as THREE.Mesh;
      const bm = box.material as THREE.MeshStandardMaterial;
      bm.color.set(rid === hovered ? C.wallHi : C.wall);
    });
    // stop hover interactions once walls are gone
    if (p > 0.4 && hovered) { setHovered(null); onHover(null); }
  });

  function enter(e: ThreeEvent<PointerEvent>, r: Room) {
    if (progress.current > 0.33) return;
    e.stopPropagation();
    setHovered(r.id);
    onHover({ name: r.name, area: area(r), x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  }
  function leave() {
    setHovered(null);
    onHover(null);
  }

  return (
    <group ref={group} position={[0, 0, 0]}>
      {rs.map((r) => (
        <group
          key={r.id}
          userData={{ rid: r.id }}
          position={[r.x + r.w / 2 - CX, WALL_H / 2, r.y + r.h / 2 - CZ]}
          onPointerOver={(e) => enter(e, r)}
          onPointerOut={leave}
        >
          <mesh>
            <boxGeometry args={[r.w - 0.3, WALL_H, r.h - 0.3]} />
            <meshStandardMaterial color={C.wall} roughness={0.85} metalness={0.1} />
          </mesh>
          {/* window glow band */}
          <mesh position={[0, 0.6, (r.h - 0.3) / 2 + 0.02]}>
            <planeGeometry args={[(r.w - 0.3) * 0.7, WALL_H * 0.42]} />
            <meshStandardMaterial color={C.window} emissive={C.window} emissiveIntensity={1.4} transparent opacity={0.55} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Roof({ progress }: { progress: Prog }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const p = progress.current;
    const lift = ease(smooth(p, 0.16, 0.34));
    ref.current.position.y = THREE.MathUtils.lerp(WALL_H + 0.3, WALL_H + 22, lift);
    ref.current.children.forEach((c) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.opacity = 1 - lift;
      m.transparent = true;
    });
    ref.current.visible = lift < 0.98;
  });
  return (
    <group ref={ref} position={[0, WALL_H + 0.3, 0]}>
      <mesh>
        <boxGeometry args={[30.6, 0.4, 50.6]} />
        <meshStandardMaterial color={C.roof} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Blueprint({ progress }: { progress: Prog }) {
  const ref = useRef<THREE.Group>(null);
  const rs = useMemo(() => rooms(), []);
  useFrame(() => {
    if (!ref.current) return;
    const o = ease(smooth(progress.current, 0.4, 0.6));
    ref.current.visible = o > 0.01;
    ref.current.children.forEach((c) => {
      c.traverse((n) => {
        const mesh = n as THREE.Mesh;
        if (mesh.material) {
          const m = mesh.material as THREE.MeshBasicMaterial & { opacity: number };
          m.transparent = true;
          m.opacity = (mesh.userData.base ?? 1) * o;
        }
      });
    });
  });
  return (
    <group ref={ref} position={[0, 0.05, 0]}>
      {rs.map((r) => {
        const w = r.w - 0.25, h = r.h - 0.25;
        const x = r.x + r.w / 2 - CX, z = r.y + r.h / 2 - CZ;
        return (
          <group key={r.id} position={[x, 0, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ base: 0.14 }}>
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial color={C.ice} transparent opacity={0.14} toneMapped={false} />
            </mesh>
            <lineSegments userData={{ base: 1 }}>
              <edgesGeometry args={[new THREE.BoxGeometry(w, 0.01, h)]} />
              <lineBasicMaterial color={C.iceGlow} transparent toneMapped={false} />
            </lineSegments>
          </group>
        );
      })}
    </group>
  );
}

function Furniture({ progress }: { progress: Prog }) {
  const ref = useRef<THREE.Group>(null);
  const pieces = useMemo(() => focusFurniture(), []);
  useFrame(() => {
    if (!ref.current) return;
    const p = progress.current;
    const o = ease(smooth(p, 0.74, 0.9));
    const swap = ease(smooth(p, 0.9, 1.0)); // "style swap" — subtle tone lerp
    ref.current.visible = o > 0.01;
    ref.current.children.forEach((c, i) => {
      const mesh = c as THREE.Mesh;
      const m = mesh.material as THREE.MeshStandardMaterial;
      m.transparent = true;
      m.opacity = o;
      const base = new THREE.Color(pieces[i].color);
      const alt = new THREE.Color("#39414d");
      m.color.copy(base).lerp(alt, swap * 0.6);
      mesh.scale.setScalar(THREE.MathUtils.lerp(0.92, 1, o));
    });
  });
  return (
    <group ref={ref} position={FOCUS}>
      {pieces.map((pc, i) => (
        <mesh key={i} position={pc.pos}>
          <boxGeometry args={pc.size} />
          <meshStandardMaterial
            color={pc.color}
            roughness={0.7}
            metalness={0.1}
            emissive={pc.kind === "lamp" ? C.window : "#000000"}
            emissiveIntensity={pc.kind === "lamp" ? 2 : 0}
            toneMapped={pc.kind !== "lamp"}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ progress, onHover }: { progress: Prog; onHover: (h: HoverInfo | null) => void }) {
  const reduce = prefersReducedMotion();
  return (
    <>
      <fog attach="fog" args={[C.bg, 60, 170]} />
      <Rig progress={progress} />
      <ambientLight intensity={0.34} color="#cdd8ee" />
      <directionalLight position={[-30, 40, 20]} intensity={1.3} color="#dfe8ff" />
      <directionalLight position={[26, 24, -18]} intensity={0.35} color="#9EC5FF" />
      {/* lights the focus room for the "furnish / style" beat */}
      <pointLight position={[6, 7, -15]} intensity={26} distance={28} decay={1.4} color="#e7eeff" />
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[200, 48]} />
        <meshStandardMaterial color={C.floor} roughness={1} />
      </mesh>
      <Roof progress={progress} />
      <Walls progress={progress} onHover={onHover} />
      <Blueprint progress={progress} />
      <Furniture progress={progress} />
      <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={80} blur={2.6} far={34} color="#000000" />
      {!reduce && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.15} luminanceThreshold={0.45} luminanceSmoothing={0.32} mipmapBlur />
          <Vignette eskil={false} offset={0.22} darkness={0.9} />
          <Noise opacity={0.035} premultiply />
        </EffectComposer>
      )}
    </>
  );
}

export default function FilmCanvas({ progress, onHover }: { progress: Prog; onHover: (h: HoverInfo | null) => void }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(C.bg)}
    >
      <Scene progress={progress} onHover={onHover} />
    </Canvas>
  );
}
