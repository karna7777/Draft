import { prisma } from "@/lib/db";
import { HttpError, requireUser } from "@/lib/auth";
import { handle, json } from "@/lib/http";
import { projectInclude, serializeProject } from "@/lib/project";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/projects/:id/duplicate — deep-copy a project the user owns.
export async function POST(_req: Request, { params }: Ctx) {
  return handle(async () => {
    const user = await requireUser();
    const { id } = await params;

    const src = await prisma.project.findUnique({ where: { id }, include: projectInclude });
    if (!src || src.userId !== user.id) throw new HttpError(404, "Project not found");

    const copy = await prisma.project.create({
      data: {
        userId: user.id,
        name: `${src.name} (copy)`,
        prompt: src.prompt,
        bedrooms: src.bedrooms,
        bathrooms: src.bathrooms,
        floorsCount: src.floorsCount,
        plotW: src.plotW,
        plotH: src.plotH,
        unit: src.unit,
        parking: src.parking,
        style: src.style,
        budget: src.budget,
        location: src.location,
        notes: src.notes,
        activeFloor: src.activeFloor,
        floors: {
          create: src.floors.map((f) => ({
            name: f.name,
            level: f.level,
            rooms: {
              create: f.rooms.map((r) => ({
                rid: r.rid,
                name: r.name,
                type: r.type,
                x: r.x,
                y: r.y,
                w: r.w,
                h: r.h,
                rotation: r.rotation,
              })),
            },
          })),
        },
      },
      include: projectInclude,
    });
    return json({ project: serializeProject(copy) }, 201);
  });
}
