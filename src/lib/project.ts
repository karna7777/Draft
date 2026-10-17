// Server-side bridge between Prisma rows and the client `Project` shape.
// Keeps the editor/create pages working against the same object they used
// when state lived in localStorage.
import type { Prisma } from "@prisma/client";
import type { Brief, Project } from "./store";
import { seedFloors } from "./store";

// A Project row with its floors and their rooms eagerly loaded.
export type ProjectWithGraph = Prisma.ProjectGetPayload<{
  include: { floors: { include: { rooms: true } } };
}>;

export const projectInclude = {
  floors: { include: { rooms: true }, orderBy: { level: "asc" } },
} satisfies Prisma.ProjectInclude;

/** Prisma project graph -> client Project. */
export function serializeProject(p: ProjectWithGraph): Project {
  return {
    id: p.id,
    name: p.name,
    prompt: p.prompt,
    brief: {
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      floors: p.floorsCount,
      plotW: p.plotW,
      plotH: p.plotH,
      unit: p.unit as Brief["unit"],
      parking: p.parking,
      style: p.style,
      budget: p.budget,
      location: p.location,
      notes: p.notes,
    },
    plot: { w: p.plotW, h: p.plotH },
    floors: [...p.floors]
      .sort((a, b) => a.level - b.level)
      .map((f) => ({
        id: f.id,
        name: f.name,
        rooms: f.rooms.map((r) => ({
          id: r.rid,
          name: r.name,
          type: r.type as "living" | "kitchen" | "bed" | "bath" | "service",
          x: r.x,
          y: r.y,
          w: r.w,
          h: r.h,
        })),
      })),
    activeFloor: p.activeFloor,
    createdAt: p.createdAt.getTime(),
    updatedAt: p.updatedAt.getTime(),
  };
}

/** Build the nested `floors.create` payload for a brand-new project. */
export function seedFloorCreate(prompt: string, brief: Brief): Prisma.FloorCreateWithoutProjectInput[] {
  return seedFloors(prompt, brief).map((f, level) => ({
    name: f.name,
    level,
    rooms: {
      create: f.rooms.map((r) => ({
        rid: r.id,
        name: r.name,
        type: r.type,
        x: r.x,
        y: r.y,
        w: r.w,
        h: r.h,
      })),
    },
  }));
}
