// Lightweight hand-rolled validators (no schema dependency). Each returns a
// cleaned value or throws HttpError(400). Used by the API route handlers so
// that bad client input never reaches the database.
import { HttpError } from "./auth";

export function str(v: unknown, field: string, { min = 0, max = 5000, trim = true } = {}): string {
  if (typeof v !== "string") throw new HttpError(400, `${field} must be a string`);
  const s = trim ? v.trim() : v;
  if (s.length < min) throw new HttpError(400, `${field} must be at least ${min} characters`);
  if (s.length > max) throw new HttpError(400, `${field} is too long`);
  return s;
}

export function optStr(v: unknown, field: string, max = 5000): string | null {
  if (v === null || v === undefined || v === "") return null;
  return str(v, field, { max });
}

export function email(v: unknown): string {
  const s = str(v, "email", { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new HttpError(400, "Enter a valid email address");
  return s;
}

export function num(v: unknown, field: string, { min = -1e9, max = 1e9, int = false } = {}): number {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n)) throw new HttpError(400, `${field} must be a number`);
  if (int && !Number.isInteger(n)) throw new HttpError(400, `${field} must be a whole number`);
  if (n < min || n > max) throw new HttpError(400, `${field} must be between ${min} and ${max}`);
  return n;
}

export function optNum(v: unknown, field: string, opts?: Parameters<typeof num>[2]): number | null {
  if (v === null || v === undefined || v === "") return null;
  return num(v, field, opts);
}

export function bool(v: unknown, field: string): boolean {
  if (typeof v !== "boolean") throw new HttpError(400, `${field} must be true or false`);
  return v;
}

const ROOM_TYPES = ["living", "kitchen", "bed", "bath", "service"];
const UNITS = ["ft", "m"];

export function unit(v: unknown): "ft" | "m" {
  const s = str(v, "unit");
  if (!UNITS.includes(s)) throw new HttpError(400, "unit must be ft or m");
  return s as "ft" | "m";
}

export interface CleanRoom {
  rid: string;
  name: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
}

export function room(v: unknown, i: number): CleanRoom {
  if (typeof v !== "object" || v === null) throw new HttpError(400, `room ${i} is invalid`);
  const r = v as Record<string, unknown>;
  const type = str(r.type, `room ${i} type`);
  if (!ROOM_TYPES.includes(type)) throw new HttpError(400, `room ${i} has an unknown type`);
  return {
    rid: str(r.id ?? r.rid, `room ${i} id`, { max: 120 }),
    name: str(r.name, `room ${i} name`, { min: 1, max: 120 }),
    type,
    x: num(r.x, `room ${i} x`, { min: 0, max: 1000 }),
    y: num(r.y, `room ${i} y`, { min: 0, max: 1000 }),
    w: num(r.w, `room ${i} width`, { min: 0.5, max: 1000 }),
    h: num(r.h, `room ${i} depth`, { min: 0.5, max: 1000 }),
    rotation: optNum(r.rotation, `room ${i} rotation`, { min: -360, max: 360 }) ?? 0,
  };
}

export function asArray(v: unknown, field: string): unknown[] {
  if (!Array.isArray(v)) throw new HttpError(400, `${field} must be a list`);
  return v;
}
