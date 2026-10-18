import { handle, json, readBody } from "@/lib/http";
import { HttpError } from "@/lib/auth";
import { str, optStr } from "@/lib/validation";
import { groqJson, hasGroqKey, GroqError } from "@/lib/ai/groq";
import { zPlan, zFurnishing, planJsonSchema, furnishJsonSchema, type AiRoom } from "@/lib/ai/schema";
import { snapRooms, resolveOverlaps, validatePlan, assemblePlan } from "@/lib/ai/fix";
import { parseBrief, mockPlan, mockFurnish } from "@/lib/ai/mock";

// --- tiny in-memory per-client rate limit (best-effort; resets on redeploy) ---
const WINDOW = 60_000, LIMIT = 24;
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > LIMIT;
}

function planSystem(plotW: number, plotH: number, beds: number, baths: number) {
  return `You are a residential architect. Design a single-floor conceptual plan on a plot ${plotW} ft wide (x) by ${plotH} ft deep (y).
Rules:
- Output rooms as axis-aligned rectangles that TILE the plot with NO overlaps and NO gaps where possible.
- Coordinates are in feet: x,y is the room's top-left from the plot origin (0,0); w,h are width/depth. Every room must satisfy 0<=x, 0<=y, x+w<=${plotW}, y+h<=${plotH}.
- Include a living area, a kitchen, ${beds} bedroom(s), ${baths} bathroom(s), and circulation/service as needed. Use type: living | kitchen | bed | bath | service.
- Rooms must be at least 5 ft in each dimension. Prefer realistic proportions.`;
}

async function aiPlan(brief: string) {
  const b = parseBrief(brief);
  const raw = (await groqJson(
    [
      { role: "system", content: planSystem(b.plotW, b.plotH, b.beds, b.baths) },
      { role: "user", content: brief || `${b.beds}BHK home on ${b.plotW}x${b.plotH} ft` },
    ],
    planJsonSchema
  )) as unknown;
  const parsed = zPlan.safeParse(raw);
  if (!parsed.success) throw new GroqError(502, "schema mismatch");
  let rooms: AiRoom[] = parsed.data.rooms;
  rooms = resolveOverlaps(snapRooms(rooms, { w: b.plotW, h: b.plotH }), { w: b.plotW, h: b.plotH });
  if (!validatePlan(rooms, { w: b.plotW, h: b.plotH })) throw new GroqError(422, "invalid plan");
  return assemblePlan(rooms, { w: b.plotW, h: b.plotH });
}

export async function POST(req: Request) {
  return handle(async () => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const body = await readBody(req);
    const action = str(body.action, "action");

    const demoMode = !hasGroqKey();
    const rateHit = limited(ip);

    // ---- PLAN ----
    if (action === "plan") {
      const brief = optStr(body.brief, "brief", 2000) ?? "";
      if (demoMode || rateHit) {
        return json({ plan: mockPlan(brief), source: "mock", demoMode });
      }
      // try AI, retry once, then fall back to the mock
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          return json({ plan: await aiPlan(brief), source: "ai", demoMode: false });
        } catch (e) {
          if (attempt === 1) {
            console.warn("[ai] plan fell back to mock:", (e as Error).message);
            return json({ plan: mockPlan(brief), source: "mock", demoMode: false });
          }
        }
      }
    }

    // ---- FURNISH ----
    if (action === "furnish") {
      const style = str(body.style ?? "modern", "style", { max: 40 });
      const roomType = optStr(body.roomType, "roomType", 20) ?? "living";
      if (demoMode || rateHit) {
        return json({ items: mockFurnish(style, roomType), source: "mock", demoMode });
      }
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const raw = await groqJson(
            [
              { role: "system", content: `You are an interior designer. Furnish a ${roomType} room in "${style}" style. Positions are room-local feet (x,z), rotation in degrees, sizes in feet, price in INR. Keep 4-10 believable items with realistic Indian prices.` },
              { role: "user", content: `Furnish this ${roomType} as: ${style}` },
            ],
            furnishJsonSchema
          );
          const parsed = zFurnishing.safeParse(raw);
          if (!parsed.success) throw new GroqError(502, "schema mismatch");
          return json({ items: parsed.data.items, source: "ai", demoMode: false });
        } catch (e) {
          if (attempt === 1) {
            console.warn("[ai] furnish fell back to mock:", (e as Error).message);
            return json({ items: mockFurnish(style, roomType), source: "mock", demoMode: false });
          }
        }
      }
    }

    throw new HttpError(400, "Unknown action");
  });
}
