// The shared design representation that the whole product operates on.
// Requirements -> Room[] -> render / edit / refine / visualize.

export type RoomType = "living" | "kitchen" | "bed" | "bath" | "service";

export interface Room {
  id: string;
  name: string;
  x: number; // feet from left
  y: number; // feet from top
  w: number; // width in feet
  h: number; // depth in feet
  type: RoomType;
}

export interface Plot {
  w: number;
  h: number;
}

export const PLOT: Plot = { w: 30, h: 50 };

/** Concept A — a coherent 3-bed ground floor that tiles the 30x50 plot exactly. */
export function baseModel(): Room[] {
  return [
    { id: "park", name: "Parking", x: 0, y: 0, w: 12, h: 16, type: "service" },
    { id: "living", name: "Living", x: 12, y: 0, w: 18, h: 16, type: "living" },
    { id: "kitchen", name: "Kitchen", x: 0, y: 16, w: 11, h: 14, type: "kitchen" },
    { id: "dining", name: "Dining", x: 11, y: 16, w: 10, h: 14, type: "living" },
    { id: "bath1", name: "Bath", x: 21, y: 16, w: 9, h: 7, type: "bath" },
    { id: "stair", name: "Stair", x: 21, y: 23, w: 9, h: 7, type: "service" },
    { id: "master", name: "Master Bed", x: 0, y: 30, w: 17, h: 20, type: "bed" },
    { id: "bed2", name: "Bedroom 2", x: 17, y: 30, w: 13, h: 10, type: "bed" },
    { id: "mbath", name: "Master Bath", x: 17, y: 40, w: 13, h: 10, type: "bath" },
  ];
}

export function mirrorX(m: Room[]): Room[] {
  return m.map((r) => ({ ...r, x: PLOT.w - r.x - r.w }));
}

export function rot180(m: Room[]): Room[] {
  return m.map((r) => ({ ...r, x: PLOT.w - r.x - r.w, y: PLOT.h - r.y - r.h }));
}

/** Natural-language edit: open up the kitchen into the living area. */
export function openKitchen(): Room[] {
  const m = baseModel().filter((r) => r.id !== "dining");
  const k = m.find((r) => r.id === "kitchen")!;
  k.name = "Open Kitchen";
  k.w = 21;
  k.h = 14;
  k.x = 0;
  k.y = 16;
  return m;
}

/** Natural-language edit: enlarge the master, re-fit its neighbours. */
export function biggerMaster(): Room[] {
  const m = baseModel();
  m.find((r) => r.id === "master")!.w = 20;
  const b2 = m.find((r) => r.id === "bed2")!;
  b2.x = 20;
  b2.w = 10;
  const mb = m.find((r) => r.id === "mbath")!;
  mb.x = 20;
  mb.w = 10;
  return m;
}

export function area(r: Room): number {
  return r.w * r.h;
}

export function ft(n: number): string {
  return `${Math.round(n)}ʹ 0″`;
}

export const ROOM_LABEL: Record<RoomType, string> = {
  living: "Living / Dining",
  kitchen: "Kitchen",
  bed: "Bedrooms",
  bath: "Bath",
  service: "Parking / Circulation",
};
