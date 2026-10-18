// Zod schemas + matching JSON schemas for Groq structured outputs.
import { z } from "zod";

export const ROOM_TYPES = ["living", "kitchen", "bed", "bath", "service"] as const;

export const zRoom = z.object({
  name: z.string().min(1).max(40),
  type: z.enum(ROOM_TYPES),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});
export const zPlan = z.object({ rooms: z.array(zRoom).min(1).max(40) });
export type AiRoom = z.infer<typeof zRoom>;

export const FURN_KINDS = ["sofa", "bed", "table", "chair", "storage", "rug", "lamp", "plant"] as const;
export const zFurniture = z.object({
  kind: z.enum(FURN_KINDS),
  name: z.string().min(1).max(40),
  x: z.number(), // room-local feet
  z: z.number(),
  w: z.number(),
  d: z.number(),
  rot: z.number(), // degrees
  price: z.number().min(0).max(1e7),
});
export const zFurnishing = z.object({ items: z.array(zFurniture).min(1).max(30) });
export type AiFurniture = z.infer<typeof zFurniture>;

// --- JSON Schemas for Groq response_format: json_schema (strict) ---
export const planJsonSchema = {
  name: "floor_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["rooms"],
    properties: {
      rooms: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "type", "x", "y", "w", "h"],
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: [...ROOM_TYPES] },
            x: { type: "number" },
            y: { type: "number" },
            w: { type: "number" },
            h: { type: "number" },
          },
        },
      },
    },
  },
} as const;

export const furnishJsonSchema = {
  name: "room_furnishing",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["kind", "name", "x", "z", "w", "d", "rot", "price"],
          properties: {
            kind: { type: "string", enum: [...FURN_KINDS] },
            name: { type: "string" },
            x: { type: "number" },
            z: { type: "number" },
            w: { type: "number" },
            d: { type: "number" },
            rot: { type: "number" },
            price: { type: "number" },
          },
        },
      },
    },
  },
} as const;
