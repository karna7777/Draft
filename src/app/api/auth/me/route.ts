import { getCurrentUser } from "@/lib/auth";
import { handle, json } from "@/lib/http";

export async function GET() {
  return handle(async () => {
    const user = await getCurrentUser();
    return json({ user });
  });
}
