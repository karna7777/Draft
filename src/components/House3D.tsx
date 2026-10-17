"use client";

import { useEffect, useRef, useState } from "react";
import { PLOT, Room, RoomType } from "@/lib/floorplan";

const S = 7; // px per foot
const STEP = 3; // px per extrusion slab
const HEIGHT: Record<RoomType, number> = {
  living: 30,
  bed: 26,
  kitchen: 24,
  bath: 19,
  service: 15,
};
const TOP: Record<RoomType, string> = {
  living: "var(--r-living)",
  kitchen: "var(--r-kitchen)",
  bed: "var(--r-bed)",
  bath: "var(--r-bath)",
  service: "var(--r-service)",
};

export default function House3D({ rooms }: { rooms: Room[] }) {
  const W = PLOT.w * S;
  const D = PLOT.h * S;
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // only spin while on-screen (saves compositing when scrolled away)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => setActive(e[0].isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`h3d-stage ${active ? "" : "paused"}`} ref={ref}>
      <div className="h3d-world" style={{ width: W, height: D }}>
        <div className="h3d-base" style={{ width: W, height: D, transform: "translateZ(-3px)" }} />
        {rooms.map((r) => {
          const h = HEIGHT[r.type];
          const n = Math.max(2, Math.round(h / STEP));
          const top = TOP[r.type];
          const side = `color-mix(in srgb, ${top} 78%, #05070b)`;
          return (
            <div
              key={r.id}
              className="h3d-room"
              style={{ left: r.x * S, top: r.y * S, width: r.w * S, height: r.h * S }}
            >
              {Array.from({ length: n }).map((_, k) => (
                <div
                  key={k}
                  className="h3d-slab"
                  style={{
                    transform: `translateZ(${k * STEP}px)`,
                    background: k === n - 1 ? top : side,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
