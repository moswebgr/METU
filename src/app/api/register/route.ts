import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(100)
});
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check your name, email and password (minimum 10 characters)." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  const passwordHash = await hash(parsed.data.password, 12);
  const user = await prisma.user.create({ data: { name: parsed.data.name, email, passwordHash } });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
}
