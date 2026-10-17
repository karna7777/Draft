// Validate/clean a brief object coming from the client into a typed Brief.
import { HttpError } from "./auth";
import type { Brief } from "./store";
import { bool, num, optNum, optStr, str, unit } from "./validation";

export function parseBrief(v: unknown): Brief {
  if (typeof v !== "object" || v === null) throw new HttpError(400, "brief is required");
  const b = v as Record<string, unknown>;
  return {
    bedrooms: num(b.bedrooms, "bedrooms", { min: 1, max: 20, int: true }),
    bathrooms: num(b.bathrooms, "bathrooms", { min: 1, max: 20, int: true }),
    floors: num(b.floors, "floors", { min: 1, max: 5, int: true }),
    plotW: num(b.plotW, "plot width", { min: 5, max: 500 }),
    plotH: num(b.plotH, "plot length", { min: 5, max: 500 }),
    unit: unit(b.unit ?? "ft"),
    parking: typeof b.parking === "boolean" ? b.parking : bool(b.parking ?? false, "parking"),
    style: str(b.style ?? "Warm Modern", "style", { min: 1, max: 60 }),
    budget: optNum(b.budget, "budget", { min: 0, max: 1e12 }),
    location: optStr(b.location, "location", 200),
    notes: optStr(b.notes, "notes", 5000),
  };
}
