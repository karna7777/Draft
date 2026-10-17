import { destroySession } from "@/lib/auth";
import { handle, json } from "@/lib/http";

export async function POST() {
  return handle(async () => {
    await destroySession();
    return json({ ok: true });
  });
}
