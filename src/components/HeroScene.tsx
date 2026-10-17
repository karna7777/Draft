"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { baseModel, PLOT, Room, RoomType, area } from "@/lib/floorplan";

export type HeroView = "exterior" | "plan" | "interior";

const TYPE_COLOR: Record<RoomType, number> = {
  living: 0xe7decb,
  kitchen: 0xd8e2d6,
  bed: 0xe4dccd,
  bath: 0xcddde6,
  service: 0xdedacb,
};
const WALL_H: Record<RoomType, number> = {
  living: 11,
  bed: 10,
  kitchen: 10,
  bath: 9,
  service: 8,
};

interface RoomObj {
  room: Room;
  group: THREE.Group;
  walls: THREE.Mesh[];
  floor: THREE.Mesh;
  baseH: number;
  curH: number;
  targetLift: number;
  curLift: number;
}

// camera presets. phi = polar angle from vertical (0 = straight overhead).
const PRESETS: Record<HeroView, { radius: number; phi: number; wall: number; targetY: number }> = {
  exterior: { radius: 122, phi: 43, wall: 1, targetY: 1 },
  plan: { radius: 108, phi: 6, wall: 0.05, targetY: 0 },
  interior: { radius: 26, phi: 74, wall: 1, targetY: 7 },
};

export default function HeroScene({ view }: { view: HeroView }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HeroView>(view);
  const [tip, setTip] = useState<{ x: number; y: number; room: Room } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }

    const rooms = baseModel();
    let W = mount.clientWidth || 800;
    let H = mount.clientHeight || 600;
    const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 3000);

    // lights
    scene.add(new THREE.HemisphereLight(0xe4ecfa, 0x26282e, 0.85));
    const key = new THREE.DirectionalLight(0xfff3e2, 1.5);
    key.position.set(38, 72, 26);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 10;
    key.shadow.camera.far = 240;
    (key.shadow.camera as THREE.OrthographicCamera).left = -60;
    (key.shadow.camera as THREE.OrthographicCamera).right = 60;
    (key.shadow.camera as THREE.OrthographicCamera).top = 60;
    (key.shadow.camera as THREE.OrthographicCamera).bottom = -60;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x89aaff, 0.5);
    fill.position.set(-44, 30, -26);
    scene.add(fill);

    // ground catcher for soft shadow
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    const house = new THREE.Group();
    scene.add(house);

    const OFFX = -PLOT.w / 2;
    const OFFZ = -PLOT.h / 2;

    // base plinth so the model reads as a physical object on a surface
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(PLOT.w + 6, 1.4, PLOT.h + 6),
      new THREE.MeshStandardMaterial({ color: 0x2b3040, roughness: 0.95 })
    );
    plinth.position.set(0, -0.7, 0);
    plinth.receiveShadow = true;
    house.add(plinth);
    const plinthEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(PLOT.w + 6, 1.4, PLOT.h + 6)),
      new THREE.LineBasicMaterial({ color: 0x8fb8ff, transparent: true, opacity: 0.3 })
    );
    plinthEdge.position.copy(plinth.position);
    house.add(plinthEdge);
    const T = 0.4; // wall thickness
    const roomObjs: RoomObj[] = [];
    const floorMeshes: THREE.Mesh[] = [];
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.92, metalness: 0 });

    function wall(w: number, d: number): THREE.Mesh {
      const geo = new THREE.BoxGeometry(w, 1, d);
      geo.translate(0, 0.5, 0); // base at y=0, grows up with scale.y
      const m = new THREE.Mesh(geo, wallMat.clone());
      m.castShadow = true;
      m.receiveShadow = true;
      return m;
    }

    rooms.forEach((r) => {
      const g = new THREE.Group();
      const x0 = r.x + OFFX;
      const z0 = r.y + OFFZ;
      const cx = x0 + r.w / 2;
      const cz = z0 + r.h / 2;
      const baseH = WALL_H[r.type];

      // floor slab
      const floorMat = new THREE.MeshStandardMaterial({ color: TYPE_COLOR[r.type], roughness: 0.96 });
      const floor = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.4, r.h), floorMat);
      floor.position.set(cx, 0.2, cz);
      floor.receiveShadow = true;
      floor.userData.room = r;
      floorMeshes.push(floor);
      g.add(floor);

      // floor outline for the drawing feel
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(r.w, 0.42, r.h)),
        new THREE.LineBasicMaterial({ color: 0x2a2b27, transparent: true, opacity: 0.35 })
      );
      edges.position.copy(floor.position);
      g.add(edges);

      // 4 walls
      const walls: THREE.Mesh[] = [];
      const wN = wall(r.w, T); wN.position.set(cx, 0, z0);
      const wS = wall(r.w, T); wS.position.set(cx, 0, z0 + r.h);
      const wW = wall(T, r.h); wW.position.set(x0, 0, cz);
      const wE = wall(T, r.h); wE.position.set(x0 + r.w, 0, cz);
      [wN, wS, wW, wE].forEach((w) => {
        w.scale.y = baseH;
        walls.push(w);
        g.add(w);
      });

      house.add(g);
      roomObjs.push({ room: r, group: g, walls, floor, baseH, curH: baseH, targetLift: 0, curLift: 0 });
    });

    // ---- interaction state ----
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-2, -2);
    const mouseNorm = new THREE.Vector2(0, 0);
    let hovered: RoomObj | null = null;
    let theta = Math.PI * 0.16; // azimuth
    const target = new THREE.Vector3(0, 1, 0);

    // place the camera at the exterior framing immediately (never start inside)
    {
      const p = PRESETS.exterior;
      const ph = THREE.MathUtils.degToRad(p.phi);
      const hz = Math.sin(ph) * p.radius;
      const cyy = Math.cos(ph) * p.radius;
      camera.position.set(Math.sin(theta) * hz, cyy + 2, Math.cos(theta) * hz);
      target.set(0, p.targetY, 0);
      camera.lookAt(target);
    }

    function onMove(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      pointer.x = nx * 2 - 1;
      pointer.y = -(ny * 2 - 1);
      mouseNorm.x = pointer.x;
      mouseNorm.y = pointer.y;
    }
    function onLeave() {
      pointer.x = -2;
      pointer.y = -2;
      mouseNorm.set(0, 0);
    }
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("pointerleave", onLeave);

    function setHover(ro: RoomObj | null) {
      if (hovered === ro) return;
      if (hovered) {
        hovered.targetLift = 0;
        (hovered.floor.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
        hovered.walls.forEach((w) => (w.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000));
      }
      hovered = ro;
      if (hovered) {
        hovered.targetLift = 1.2;
        (hovered.floor.material as THREE.MeshStandardMaterial).emissive.setHex(0x24406e);
        hovered.walls.forEach((w) => (w.material as THREE.MeshStandardMaterial).emissive.setHex(0x1a2c4a));
      }
    }

    let raf = 0;
    let visible = true;
    const clock = new THREE.Clock();
    const visIO = new IntersectionObserver((e) => (visible = e[0].isIntersecting), { threshold: 0 });
    visIO.observe(mount);

    function frame() {
      raf = requestAnimationFrame(frame);
      // pause all work + WebGL rendering while off-screen or tab hidden
      if (!visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const preset = PRESETS[viewRef.current];

      // wall heights + lifts
      roomObjs.forEach((ro) => {
        const targetH = ro.baseH * preset.wall + 0.02;
        ro.curH += (targetH - ro.curH) * Math.min(1, dt * 4);
        ro.curLift += (ro.targetLift - ro.curLift) * Math.min(1, dt * 8);
        ro.walls.forEach((w) => (w.scale.y = ro.curH));
        ro.group.position.y = ro.curLift;
      });

      // camera orbit
      if (!reduce && viewRef.current === "exterior") theta += dt * 0.07;
      const phi = THREE.MathUtils.clamp(
        THREE.MathUtils.degToRad(preset.phi) - mouseNorm.y * 0.12,
        0.05,
        1.45
      );
      const az = theta + mouseNorm.x * 0.35;
      const rad = preset.radius;
      const cy = Math.cos(phi) * rad; // height (large when overhead)
      const horiz = Math.sin(phi) * rad;
      const camTarget = new THREE.Vector3(Math.sin(az) * horiz, cy + 2, Math.cos(az) * horiz);
      camera.position.lerp(camTarget, Math.min(1, dt * 2.4));
      target.y += (preset.targetY - target.y) * Math.min(1, dt * 3);
      camera.lookAt(target);

      // raycast (skip in interior for clarity)
      if (pointer.x > -1.5 && viewRef.current !== "interior") {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(floorMeshes, false);
        if (hits.length) {
          const ro = roomObjs.find((o) => o.floor === hits[0].object) || null;
          setHover(ro);
          if (ro) {
            const p = ro.floor.getWorldPosition(new THREE.Vector3());
            p.y += ro.baseH * preset.wall;
            p.project(camera);
            const rect = renderer.domElement.getBoundingClientRect();
            setTip({
              x: (p.x * 0.5 + 0.5) * rect.width,
              y: (-p.y * 0.5 + 0.5) * rect.height,
              room: ro.room,
            });
          }
        } else {
          setHover(null);
          setTip(null);
        }
      } else if (hovered) {
        setHover(null);
        setTip(null);
      }

      renderer.render(scene, camera);
    }
    frame();

    function onResize() {
      if (!mount) return;
      W = mount.clientWidth || W;
      H = mount.clientHeight || H;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    }
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      visIO.disconnect();
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerleave", onLeave);
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = (m as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) (mat as THREE.Material).dispose();
      });
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  if (failed) return null;

  return (
    <div className="hero3d" ref={mountRef}>
      {tip && (
        <div className="room-tip" style={{ left: tip.x, top: tip.y }}>
          <div className="rt-name">{tip.room.name}</div>
          <div className="rt-area mono">{area(tip.room)} sq ft</div>
          <div className="rt-dim mono">
            {Math.round(tip.room.w)}ʹ × {Math.round(tip.room.h)}ʹ
          </div>
        </div>
      )}
    </div>
  );
}
