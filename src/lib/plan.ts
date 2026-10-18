// The shared design representation for the sequence-driven scene — the single
// model that 2D, 3D and the AI all read and write. Extends the base Room with
// openings (doors/windows) so the architecture sequence can "cut them in".
import { baseModel, PLOT, type Room, type RoomType } from "./floorplan";

export type Side = "n" | "s" | "e" | "w";
export interface Opening {
  side: Side;
  pos: number; // 0..1 along the wall
  width: number; // feet
  kind: "door" | "window";
}
export interface PlanRoom extends Room {
  openings?: Opening[];
}
export interface PlanData {
  plot: { w: number; h: number };
  rooms: PlanRoom[];
}

export function planArea(p: PlanData): number {
  return p.rooms.reduce((n, r) => n + r.w * r.h, 0);
}

/** Default plan (used for the auto-play hero and as the mock baseline). */
export function defaultPlan(): PlanData {
  const rooms = baseModel().map((r) => withDefaultOpenings(r));
  return { plot: { w: PLOT.w, h: PLOT.h }, rooms };
}

/** Give a room sensible doors/windows on exterior-ish sides. */
export function withDefaultOpenings(r: Room): PlanRoom {
  const openings: Opening[] = [];
  // a window on the longer outer wall, a door toward the interior
  if (r.type !== "service") openings.push({ side: "s", pos: 0.5, width: Math.min(5, r.w * 0.4), kind: "window" });
  openings.push({ side: "n", pos: 0.3, width: 3, kind: "door" });
  return { ...r, openings };
}

export const ROOM_COLOR: Record<RoomType, string> = {
  living: "#9EC5FF",
  kitchen: "#aee0d0",
  bed: "#c3b6ec",
  bath: "#8fd0e0",
  service: "#8A919E",
};
