"use client";
/* eslint-disable react-hooks/immutability -- R3F useFrame mutates three.js
   objects (materials, lights, gl) every frame by design; the compiler's
   immutability rule doesn't model that and flags false positives here. */

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, ContactShadows, Text, Edges } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { anim } from "@/lib/sequence/anim";
import { useScene } from "@/lib/sequence/store";
import { ROOM_COLOR, type PlanData, type PlanRoom } from "@/lib/plan";
import { area } from "@/lib/floorplan";

const WALL_H = 10;
const ICE = "#9EC5FF";

const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  const x = Math.min(1, Math.max(0, t));
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function Rig() {
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const tgt = useRef(new THREE.Vector3());
  useFrame(() => {
    if (!cam.current) return;
    cam.current.position.set(anim.cpx, anim.cpy, anim.cpz);
    tgt.current.set(anim.ctx, anim.cty, anim.ctz);
    cam.current.lookAt(tgt.current);
  });
  return <PerspectiveCamera ref={cam} makeDefault fov={42} position={[0, 70, 0.1]} near={0.5} far={500} />;
}

/** troika Text whose fillOpacity is animated each frame (cheap — no re-sync). */
function Lbl({ get, ...props }: { get: () => number } & React.ComponentProps<typeof Text>) {
  const ref = useRef<React.ComponentRef<typeof Text>>(null);
  useFrame(() => {
    const o = clamp01(get());
    if (ref.current) {
      ref.current.fillOpacity = o;
      ref.current.visible = o > 0.01;
    }
  });
  return <Text ref={ref} {...props} />;
}

function Ground({ plot }: { plot: { w: number; h: number } }) {
  const helper = useMemo(() => {
    const g = new THREE.GridHelper(220, 110, ICE, ICE);
    (g.material as THREE.Material).transparent = true;
    return g;
  }, []);
  useFrame(() => {
    (helper.material as THREE.Material & { opacity: number }).opacity = 0.07 * anim.grid;
  });
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[240, 64]} />
        <meshStandardMaterial color="#070809" roughness={1} />
      </mesh>
      <primitive object={helper} />
      <PlotOutline plot={plot} />
      <DimLabels plot={plot} />
    </>
  );
}

function PlotOutline({ plot }: { plot: { w: number; h: number } }) {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(plot.w, 0.01, plot.h)), [plot.w, plot.h]);
  useFrame(() => {
    if (!ref.current) return;
    (ref.current.material as THREE.LineBasicMaterial & { opacity: number }).opacity = anim.plot;
    ref.current.scale.setScalar(THREE.MathUtils.lerp(0.9, 1, anim.plot));
  });
  return (
    <lineSegments ref={ref} position={[0, 0.03, 0]}>
      <primitive object={geo} />
      <lineBasicMaterial color="#bcd8ff" transparent opacity={0} toneMapped={false} />
    </lineSegments>
  );
}

function DimLabels({ plot }: { plot: { w: number; h: number } }) {
  return (
    <>
      <Lbl get={() => anim.dims} position={[0, 0.2, plot.h / 2 + 3]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2} color={ICE} anchorX="center" anchorY="middle">{`${Math.round(plot.w)} ft`}</Lbl>
      <Lbl get={() => anim.dims} position={[plot.w / 2 + 3.5, 0.2, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} fontSize={2} color={ICE} anchorX="center" anchorY="middle">{`${Math.round(plot.h)} ft`}</Lbl>
      <Lbl get={() => anim.dims} position={[-plot.w / 2 - 3.5, 0.2, -plot.h / 2 - 3.5]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.4} color="#c9ced7" anchorX="center" anchorY="middle">{"N ↑"}</Lbl>
    </>
  );
}

function RoomUnit({ room, index, plot }: { room: PlanRoom; index: number; plot: { w: number; h: number } }) {
  const floor = useRef<THREE.Group>(null);
  const walls = useRef<THREE.Group>(null);
  const openings = useRef<THREE.Group>(null);

  const x = room.x + room.w / 2 - plot.w / 2;
  const z = room.y + room.h / 2 - plot.h / 2;
  const col = ROOM_COLOR[room.type];
  const fullArea = area(room);

  useFrame(() => {
    const g = easeOutBack(clamp01(anim.roomsProgress - index));
    if (floor.current) { floor.current.scale.set(g, 1, g); floor.current.visible = g > 0.001; }
    if (walls.current) { const wh = anim.walls * g; walls.current.scale.y = Math.max(0.001, wh); walls.current.visible = wh > 0.01; }
    if (openings.current) {
      openings.current.children.forEach((c) => {
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = 2 * anim.openings * (0.5 + 0.5 * anim.lights);
        m.opacity = anim.openings;
      });
      openings.current.visible = anim.openings > 0.01 && anim.walls > 0.3;
    }
  });

  const marks = (room.openings ?? []).map((o, i) => {
    const alongW = o.side === "n" || o.side === "s";
    const px = alongW ? (o.pos - 0.5) * (room.w - 0.6) : (o.side === "e" ? room.w / 2 : -room.w / 2);
    const pz = alongW ? (o.side === "s" ? room.h / 2 : -room.h / 2) : (o.pos - 0.5) * (room.h - 0.6);
    const geoW = alongW ? o.width : 0.2;
    const geoD = alongW ? 0.2 : o.width;
    const yy = o.kind === "door" ? WALL_H * 0.36 : WALL_H * 0.58;
    const hh = o.kind === "door" ? WALL_H * 0.7 : WALL_H * 0.38;
    return (
      <mesh key={i} position={[px, yy, pz]}>
        <boxGeometry args={[geoW, hh, geoD]} />
        <meshStandardMaterial color="#dbeaff" emissive="#bcd8ff" emissiveIntensity={0} transparent opacity={0} toneMapped={false} />
      </mesh>
    );
  });

  return (
    <group position={[x, 0, z]}>
      <group ref={floor}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <planeGeometry args={[room.w - 0.4, room.h - 0.4]} />
          <meshStandardMaterial color={col} transparent opacity={0.14} roughness={0.9} toneMapped={false} />
        </mesh>
        <lineSegments position={[0, 0.05, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(room.w - 0.4, 0.01, room.h - 0.4)]} />
          <lineBasicMaterial color={col} transparent opacity={0.95} toneMapped={false} />
        </lineSegments>
      </group>

      <group ref={walls}>
        <mesh position={[0, WALL_H / 2, 0]}>
          <boxGeometry args={[room.w - 0.4, WALL_H, room.h - 0.4]} />
          <meshStandardMaterial color="#262c37" roughness={0.78} metalness={0.12} />
          <Edges threshold={14} color="#4d6a93" />
        </mesh>
        <mesh position={[0, WALL_H * 0.54, (room.h - 0.4) / 2 + 0.03]}>
          <planeGeometry args={[(room.w - 0.4) * 0.72, WALL_H * 0.42]} />
          <WindowGlow />
        </mesh>
      </group>

      <group ref={openings}>{marks}</group>

      {/* label: fades in as the room grows, out as the walls rise */}
      <Lbl get={() => clamp01((easeOutBack(clamp01(anim.roomsProgress - index)) - 0.4) * 2) * (1 - anim.walls * 0.85)}
        position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.7} color="#f2f4f7" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#06080c">
        {room.name}
      </Lbl>
      <Lbl get={() => clamp01((easeOutBack(clamp01(anim.roomsProgress - index)) - 0.55) * 2) * (1 - anim.walls * 0.85)}
        position={[0, 0.25, 2.2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.1} color={ICE} anchorX="center" anchorY="middle">
        {`${fullArea} sq ft`}
      </Lbl>
    </group>
  );
}

function WindowGlow() {
  const ref = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (ref.current) {
      ref.current.emissiveIntensity = 1.6 * anim.lights;
      ref.current.opacity = 0.18 + 0.6 * anim.lights;
    }
  });
  return <meshStandardMaterial ref={ref} color="#cfe0ff" emissive="#cfe0ff" emissiveIntensity={0} transparent opacity={0} toneMapped={false} />;
}

function Roof({ plot }: { plot: { w: number; h: number } }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.y = THREE.MathUtils.lerp(WALL_H + 20, WALL_H + 0.4, anim.roof);
    (ref.current.material as THREE.MeshStandardMaterial).opacity = anim.roof;
    ref.current.visible = anim.roof > 0.02;
  });
  return (
    <mesh ref={ref} position={[0, WALL_H + 20, 0]} castShadow>
      <boxGeometry args={[plot.w + 1.4, 0.6, plot.h + 1.4]} />
      <meshStandardMaterial color="#1b2029" roughness={0.85} transparent opacity={0} />
    </mesh>
  );
}

function Lights() {
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const interior = useRef<THREE.PointLight>(null);
  const { gl } = useThree();
  useFrame(() => {
    if (key.current) key.current.intensity = 0.9 + 1.8 * anim.dusk;
    if (rim.current) rim.current.intensity = 0.4 + 1.1 * anim.dusk;
    if (interior.current) interior.current.intensity = 26 * anim.lights;
    gl.toneMappingExposure = THREE.MathUtils.lerp(0.9, 1.25, anim.dusk);
  });
  return (
    <>
      <ambientLight intensity={0.5} color="#b9c6e4" />
      <directionalLight ref={key} position={[-26, 40, 24]} intensity={0.9} color="#eaf1ff" />
      <directionalLight ref={rim} position={[20, 16, -22]} intensity={0.4} color={ICE} />
      <pointLight ref={interior} position={[0, 6, 0]} intensity={0} distance={60} decay={1.2} color="#e7eeff" />
    </>
  );
}

function Scene({ plan, reduce }: { plan: PlanData; reduce: boolean }) {
  return (
    <>
      <fog attach="fog" args={["#0a0c12", 85, 240]} />
      <Rig />
      <Lights />
      <Ground plot={plan.plot} />
      {plan.rooms.map((r, i) => (
        <RoomUnit key={r.id} room={r} index={i} plot={plan.plot} />
      ))}
      <Roof plot={plan.plot} />
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={90} blur={2.4} far={34} color="#000000" />
      {!reduce && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.1} luminanceThreshold={0.5} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.9} />
          <Noise opacity={0.028} premultiply />
        </EffectComposer>
      )}
    </>
  );
}

export default function HeroScene({ reduce = false }: { reduce?: boolean }) {
  const plan = useScene((s) => s.plan);
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => (gl.toneMappingExposure = 0.9)}
    >
      <Scene plan={plan} reduce={reduce} />
    </Canvas>
  );
}
