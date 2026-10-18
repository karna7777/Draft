// Deterministic fallback generator (also the "demo mode" engine). Produces a
// clean, non-overlapping plan by scaling the base template to the brief's plot.
import { baseModel, PLOT } from "@/lib/floorplan";
import { assemblePlan } from "./fix";
import type { AiRoom } from "./schema";
import type { AiFurniture } from "./schema";

export interface Brief {
  plotW: number;
  plotH: number;
  beds: number;
  baths: number;
  style: string;
}

export function parseBrief(text: string): Brief {
  const t = (text || "").toLowerCase();
  const plot = t.match(/(\d{2,3})\s*(?:x|×|by|\*)\s*(\d{2,3})/);
  const beds = t.match(/(\d)\s*(?:bhk|bed)/);
  const baths = t.match(/(\d)\s*bath/);
  const styles = ["japandi", "industrial", "luxe", "minimal", "modern", "scandinavian", "contemporary", "coastal", "bohemian"];
  const style = styles.find((s) => t.includes(s)) ?? "modern";
  return {
    plotW: plot ? Math.min(500, Math.max(12, +plot[1])) : PLOT.w,
    plotH: plot ? Math.min(500, Math.max(12, +plot[2])) : PLOT.h,
    beds: beds ? Math.min(8, Math.max(1, +beds[1])) : 3,
    baths: baths ? Math.min(6, Math.max(1, +baths[1])) : 2,
    style,
  };
}

export function mockPlan(text: string) {
  const b = parseBrief(text);
  const sx = b.plotW / PLOT.w;
  const sy = b.plotH / PLOT.h;
  const rooms: AiRoom[] = baseModel().map((r) => ({
    name: r.name,
    type: r.type,
    x: Math.round(r.x * sx),
    y: Math.round(r.y * sy),
    w: Math.round(r.w * sx),
    h: Math.round(r.h * sy),
  }));
  return assemblePlan(rooms, { w: b.plotW, h: b.plotH });
}

export function mockFurnish(style: string, roomType: string): AiFurniture[] {
  const base: AiFurniture[] = [
    { kind: "sofa", name: "Sofa", x: -2, z: 2, w: 7, d: 3, rot: 0, price: 48000 },
    { kind: "table", name: "Coffee table", x: -2, z: -1, w: 3.5, d: 2, rot: 0, price: 14000 },
    { kind: "rug", name: "Rug", x: -2, z: 0.5, w: 9, d: 6, rot: 0, price: 12000 },
    { kind: "storage", name: "Shelving", x: 5, z: -4, w: 1, d: 5, rot: 0, price: 22000 },
    { kind: "lamp", name: "Floor lamp", x: 3, z: 3, w: 0.6, d: 0.6, rot: 0, price: 7000 },
    { kind: "plant", name: "Plant", x: -6, z: -3, w: 1.4, d: 1.4, rot: 0, price: 3500 },
  ];
  if (roomType === "bed") {
    return [
      { kind: "bed", name: "Bed", x: 0, z: -2, w: 6, d: 7, rot: 0, price: 55000 },
      { kind: "storage", name: "Wardrobe", x: 5, z: 0, w: 1.5, d: 7, rot: 0, price: 38000 },
      { kind: "table", name: "Desk", x: -5, z: 3, w: 4, d: 2, rot: 0, price: 16000 },
      { kind: "chair", name: "Chair", x: -5, z: 1.5, w: 1.6, d: 1.6, rot: 0, price: 9000 },
      { kind: "rug", name: "Rug", x: 0, z: -1, w: 7, d: 5, rot: 0, price: 10000 },
      { kind: "lamp", name: "Lamp", x: 4, z: -4, w: 0.6, d: 0.6, rot: 0, price: 6000 },
    ];
  }
  return base;
}
