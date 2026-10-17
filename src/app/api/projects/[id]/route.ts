import { prisma } from "@/lib/db";
import { HttpError, requireUser, SessionUser } from "@/lib/auth";
import { handle, json, readBody } from "@/lib/http";
import { projectInclude, serializeProject } from "@/lib/project";
import { parseBrief } from "@/lib/brief";
import { asArray, num, optStr, room, str } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

/** Load a project the user owns, or throw 404 (don't reveal others' ids). */
async function ownedProject(user: SessionUser, id: string) {
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p || p.userId !== user.id) throw new HttpError(404, "Project not found");
  return p;
}

// GET /api/projects/:id — full project graph.
export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    await ownedProject(user, id);
    const full = await prisma.project.findUnique({ where: { id }, include: projectInclude });
    return json({ project: serializeProject(full!) });
  });
}

// PUT /api/projects/:id — save the whole design (meta + floors + rooms).
export async function PUT(req: Request, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    await ownedProject(user, id);
    const body = await readBody(req);

    const name = str(body.name, "name", { min: 1, max: 120 });
    const prompt = optStr(body.prompt, "prompt", 5000) ?? "";
    const brief = parseBrief(body.brief);
    const activeFloor = num(body.activeFloor, "activeFloor", { min: 0, max: 20, int: true });

    const floorsIn = asArray(body.floors, "floors").map((f, fi) => {
      if (typeof f !== "object" || f === null) throw new HttpError(400, `floor ${fi} is invalid`);
      const fr = f as Record<string, unknown>;
      return {
        name: str(fr.name, `floor ${fi} name`, { min: 1, max: 80 }),
        rooms: asArray(fr.rooms, `floor ${fi} rooms`).map((r, ri) => room(r, ri)),
      };
    });
    if (floorsIn.length === 0) throw new HttpError(400, "A project needs at least one floor");

    // Replace the floor/room graph atomically. Floors are index-ordered, so
    // recreating them is safe; the editor refreshes its ids from the response.
    const saved = await prisma.$transaction(async (tx) => {
      await tx.floor.deleteMany({ where: { projectId: id } });
      await tx.project.update({
        where: { id },
        data: {
          name,
          prompt,
          bedrooms: brief.bedrooms,
          bathrooms: brief.bathrooms,
          floorsCount: brief.floors,
          plotW: brief.plotW,
          plotH: brief.plotH,
          unit: brief.unit,
          parking: brief.parking,
          style: brief.style,
          budget: brief.budget,
          location: brief.location,
          notes: brief.notes,
          activeFloor: Math.min(activeFloor, floorsIn.length - 1),
          floors: {
            create: floorsIn.map((f, level) => ({
              name: f.name,
              level,
              rooms: { create: f.rooms },
            })),
          },
        },
      });
      return tx.project.findUnique({ where: { id }, include: projectInclude });
    });
    return json({ project: serializeProject(saved!) });
  });
}

// PATCH /api/projects/:id — light metadata edits (rename, budget, etc.).
export async function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    await ownedProject(user, id);
    const body = await readBody(req);

    const data: Record<string, unknown> = {};
    if ("name" in body) data.name = str(body.name, "name", { min: 1, max: 120 });
    if ("location" in body) data.location = optStr(body.location, "location", 200);
    if ("notes" in body) data.notes = optStr(body.notes, "notes", 5000);
    if ("budget" in body) {
      const b = body.budget;
      data.budget = b === null || b === "" ? null : num(b, "budget", { min: 0, max: 1e12 });
    }
    if (Object.keys(data).length === 0) throw new HttpError(400, "Nothing to update");

    const updated = await prisma.project.update({ where: { id }, data, include: projectInclude });
    return json({ project: serializeProject(updated) });
  });
}

// DELETE /api/projects/:id — remove the project and its graph (cascade).
export async function DELETE(_req: Request, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;
    await ownedProject(user, id);
    await prisma.project.delete({ where: { id } });
    return json({ ok: true });
  });
}
