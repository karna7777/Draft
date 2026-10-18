// Post-process AI plans: snap to a 1ft grid, clamp into the plot, nudge
// overlaps apart, then validate (in-bounds, not too overlapping, sane area).
import type { AiRoom } from "./schema";
import { withDefaultOpenings, type PlanData } from "@/lib/plan";
import type { RoomType } from "@/lib/floorplan";

const r1 = (n: number) => Math.round(n);
const MIN = 4; // min room dimension (ft)

function overlapArea(a: AiRoom, b: AiRoom): number {
  const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return ox * oy;
}

export function snapRooms(rooms: AiRoom[], plot: { w: number; h: number }): AiRoom[] {
  return rooms.map((r) => {
    let w = Math.max(MIN, Math.min(r1(r.w), plot.w));
    let h = Math.max(MIN, Math.min(r1(r.h), plot.h));
    const x = Math.max(0, Math.min(r1(r.x), plot.w - w));
    const y = Math.max(0, Math.min(r1(r.y), plot.h - h));
    if (x + w > plot.w) w = plot.w - x;
    if (y + h > plot.h) h = plot.h - y;
    return { ...r, x, y, w, h };
  });
}

/** Greedy nudge: shift later rooms off earlier ones, staying inside the plot. */
export function resolveOverlaps(rooms: AiRoom[], plot: { w: number; h: number }): AiRoom[] {
  const out = rooms.map((r) => ({ ...r }));
  for (let j = 1; j < out.length; j++) {
    for (let attempt = 0; attempt < 24; attempt++) {
      let hit = false;
      for (let i = 0; i < j; i++) {
        if (overlapArea(out[j], out[i]) > 1) {
          hit = true;
          // try moving right of i, else below i, clamped to plot
          const right = out[i].x + out[i].w;
          const below = out[i].y + out[i].h;
          if (right + out[j].w <= plot.w) out[j].x = right;
          else if (below + out[j].h <= plot.h) { out[j].y = below; out[j].x = Math.min(out[j].x, plot.w - out[j].w); }
          else { out[j].x = Math.max(0, plot.w - out[j].w); out[j].y = Math.max(0, plot.h - out[j].h); }
          break;
        }
      }
      if (!hit) break;
    }
  }
  return out;
}

export function overlapRatio(rooms: AiRoom[]): number {
  let ov = 0, tot = 0;
  for (const r of rooms) tot += r.w * r.h;
  for (let i = 0; i < rooms.length; i++)
    for (let j = i + 1; j < rooms.length; j++) ov += overlapArea(rooms[i], rooms[j]);
  return tot > 0 ? ov / tot : 1;
}

export function validatePlan(rooms: AiRoom[], plot: { w: number; h: number }): boolean {
  if (rooms.length < 2 || rooms.length > 30) return false;
  const inBounds = rooms.every((r) => r.x >= 0 && r.y >= 0 && r.x + r.w <= plot.w + 0.5 && r.y + r.h <= plot.h + 0.5 && r.w >= MIN && r.h >= MIN);
  if (!inBounds) return false;
  if (overlapRatio(rooms) > 0.18) return false;
  const plotArea = plot.w * plot.h;
  const total = rooms.reduce((n, r) => n + r.w * r.h, 0);
  return total >= plotArea * 0.3 && total <= plotArea * 1.25;
}

export function assemblePlan(rooms: AiRoom[], plot: { w: number; h: number }): PlanData {
  const planRooms = rooms.map((r, i) => {
    const id = `${r.type}_${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 14) || "room"}_${i}`;
    return withDefaultOpenings({ id, name: r.name, type: r.type as RoomType, x: r.x, y: r.y, w: r.w, h: r.h });
  });
  return { plot, rooms: planRooms };
}
