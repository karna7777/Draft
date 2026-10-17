import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handle, json, readBody } from "@/lib/http";
import { projectInclude, seedFloorCreate, serializeProject } from "@/lib/project";
import { parseBrief } from "@/lib/brief";
import { optStr, str } from "@/lib/validation";
import { projectName } from "@/lib/store";

// GET /api/projects — list the signed-in user's projects (summaries).
export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    const rows = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { floors: { include: { _count: { select: { rooms: true } } } } },
    });
    const projects = rows.map((p) => ({
      id: p.id,
      name: p.name,
      style: p.style,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      plotW: p.plotW,
      plotH: p.plotH,
      unit: p.unit,
      budget: p.budget,
      location: p.location,
      floorCount: p.floors.length,
      roomCount: p.floors.reduce((n, f) => n + f._count.rooms, 0),
      createdAt: p.createdAt.getTime(),
      updatedAt: p.updatedAt.getTime(),
    }));
    return json({ projects });
  });
}

// POST /api/projects — create a project (seeded from the brief) and return it.
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireUser();
    const body = await readBody(req);
    const prompt = optStr(body.prompt, "prompt", 5000) ?? "";
    const brief = parseBrief(body.brief);
    const name = (optStr(body.name, "name", 120) ?? "") || projectName(prompt, brief);

    const created = await prisma.project.create({
      data: {
        userId: user.id,
        name: str(name, "name", { min: 1, max: 120 }),
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
        floors: { create: seedFloorCreate(prompt, brief) },
      },
      include: projectInclude,
    });
    return json({ project: serializeProject(created) }, 201);
  });
}
