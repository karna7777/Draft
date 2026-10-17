import { prisma } from "@/lib/db";
import { createSession, HttpError, verifyPassword } from "@/lib/auth";
import { handle, json, readBody } from "@/lib/http";
import { email, str } from "@/lib/validation";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readBody(req);
    const mail = email(body.email);
    const password = str(body.password, "password", { min: 1, max: 200, trim: false });

    const user = await prisma.user.findUnique({ where: { email: mail } });
    // Same message whether the email or the password is wrong.
    if (!user || !verifyPassword(password, user.password)) {
      throw new HttpError(401, "Incorrect email or password");
    }
    await createSession(user.id);
    return json({ user: { id: user.id, email: user.email, name: user.name } });
  });
}
