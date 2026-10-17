// Draft's shared design representation — the single project shape the whole
// app (canvas, inspector, AI, and the API) reads and writes. This module is
// isomorphic: pure data + generator functions, safe to import on server or
// client. Persistence lives in the database (see src/lib/db.ts and the API
// routes); the client talks to it through src/lib/api.ts.

import { Room, baseModel, mirrorX, rot180, PLOT, Plot } from "./floorplan";

export type Unit = "ft" | "m";

export interface Brief {
  bedrooms: number;
  bathrooms: number;
  floors: number;
  plotW: number;
  plotH: number;
  unit: Unit;
  parking: boolean;
  style: string;
  budget: number | null;
  location: string | null;
  notes: string | null;
}

export interface Floor {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Project {
  id: string;
  name: string;
  prompt: string;
  brief: Brief;
  plot: Plot;
  floors: Floor[];
  activeFloor: number;
  createdAt: number;
  updatedAt?: number;
}

export const DEFAULT_BRIEF: Brief = {
  bedrooms: 3,
  bathrooms: 2,
  floors: 2,
  plotW: 30,
  plotH: 50,
  unit: "ft",
  parking: true,
  style: "Warm Modern",
  budget: null,
  location: null,
  notes: null,
};

export function projectName(prompt: string, brief: Brief): string {
  const p = (prompt || "").toLowerCase();
  if (p.includes("courtyard")) return "Courtyard House";
  if (p.includes("coastal") || p.includes("beach")) return "Coastal Home";
  if (p.includes("villa")) return "The Villa";
  if (p.includes("studio")) return "Studio + Unit";
  return `${brief.bedrooms}-Bedroom Home`;
}

/**
 * Deterministic seed layout from the brief. This is the concept generator that
 * a real AI design engine replaces later — the returned floor/room shape stays
 * the same, so everything downstream (persistence, editor, 3D) is unaffected.
 */
export function seedFloors(prompt: string, brief: Brief): Floor[] {
  const seed = (prompt.length + brief.bedrooms + brief.plotW) % 3;
  const ground = seed === 0 ? baseModel() : seed === 1 ? mirrorX(baseModel()) : rot180(baseModel());

  const floors: Floor[] = [{ id: "gf", name: "Ground Floor", rooms: ground }];
  if (brief.floors >= 2) {
    floors.push({ id: "ff", name: "First Floor", rooms: mirrorX(baseModel()) });
  }
  for (let i = 2; i < brief.floors; i++) {
    floors.push({ id: `fl${i}`, name: `Floor ${i + 1}`, rooms: rot180(baseModel()) });
  }
  return floors;
}

/** Build a full (unsaved) client Project — used for previews and tests. */
export function generateProject(prompt: string, brief: Brief): Project {
  return {
    id: "p_" + Date.now().toString(36),
    name: projectName(prompt, brief),
    prompt,
    brief,
    plot: { w: PLOT.w, h: PLOT.h },
    floors: seedFloors(prompt, brief),
    activeFloor: 0,
    createdAt: Date.now(),
  };
}
