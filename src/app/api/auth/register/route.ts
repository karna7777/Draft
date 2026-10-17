import { prisma } from "@/lib/db";
import { createSession, hashPassword, HttpError } from "@/lib/auth";
import { handle, json, readBody } from "@/lib/http";
import { email, optStr, str } from "@/lib/validation";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readBody(req);
    const mail = email(body.email);
    const password = str(body.password, "password", { min: 8, max: 200, trim: false });
    const name = optStr(body.name, "name", 120);

    const existing = await prisma.user.findUnique({ where: { email: mail } });
    if (existing) throw new HttpError(409, "An account with that email already exists");

    const user = await prisma.user.create({
      data: { email: mail, name, password: hashPassword(password) },
    });
    await createSession(user.id);
    return json({ user: { id: user.id, email: user.email, name: user.name } }, 201);
  });
}
