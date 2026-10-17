// Shared 3D scene data for the landing film — built from the real floorplan
// model so the marketing scene and the product read the same source of truth.
import { baseModel, PLOT, type Room, type RoomType } from "./floorplan";

export const WALL_H = 10; // feet
export const CX = PLOT.w / 2;
export const CZ = PLOT.h / 2;

// Obsidian + Ice, as scene colors (color comes from lighting, not UI).
export const C = {
  bg: "#08090B",
  wall: "#111319",
  wallHi: "#1b2330", // hovered room wall
  floor: "#0b0d11",
  ice: "#9EC5FF",
  iceGlow: "#bcd8ff",
  window: "#cfe0ff",
  roof: "#0e1014",
  furn: "#20242c",
  furnSoft: "#2b313b",
};

export const FOCUS_ROOM = "living";

export interface Piece {
  kind: "sofa" | "table" | "rug" | "lamp" | "shelf" | "plant";
  pos: [number, number, number]; // room-local feet (x,y,z), y = height off floor
  size: [number, number, number];
  color: string;
}

/** A few parametric furniture pieces for the "furnish" beat, placed in the focus room. */
export function focusFurniture(): Piece[] {
  return [
    { kind: "sofa", pos: [-3, 0.9, 2], size: [8, 1.8, 3], color: "#4a515d" },
    { kind: "table", pos: [-3, 0.5, -1.5], size: [4, 1, 2.2], color: "#5b4a3c" },
    { kind: "rug", pos: [-3, 0.03, 0.4], size: [10, 0.06, 7], color: "#2a2f38" },
    { kind: "shelf", pos: [6, 2.4, -4], size: [1, 5, 6], color: "#49433a" },
    { kind: "lamp", pos: [4, 2.2, 3.5], size: [0.5, 4.4, 0.5], color: "#6a7280" },
    { kind: "plant", pos: [-7, 1.2, -3], size: [1.4, 2.6, 1.4], color: "#3a5240" },
  ];
}

export function rooms(): Room[] {
  return baseModel();
}

/** Room center in world coords (feet), plot-centered. y is floor level. */
export function roomCenter(r: Room): [number, number, number] {
  return [r.x + r.w / 2 - CX, 0, r.y + r.h / 2 - CZ];
}

export const ROOM_LABEL: Record<RoomType, string> = {
  living: "Living",
  kitchen: "Kitchen",
  bed: "Bedroom",
  bath: "Bath",
  service: "Service",
};
