import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ brandName: z.string().trim().min(2).max(100), contactName: z.string().trim().min(2).max(100), website: z.string().trim().max(200).optional().or(z.literal("")), description: z.string().trim().min(30).max(3000) });
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to apply." }, { status: 401 });
  const data = schema.safeParse(await request.json().catch(() => null));
  if (!data.success) return NextResponse.json({ error: "Complete all required fields. Description must be at least 30 characters." }, { status: 400 });
  const existing = await prisma.sellerApplication.findFirst({ where: { userId: session.user.id, status: "PENDING" } });
  if (existing) return NextResponse.json({ error: "You already have a pending application." }, { status: 409 });
  const application = await prisma.sellerApplication.create({ data: { userId: session.user.id, ...data.data } });
  return NextResponse.json({ id: application.id, status: application.status }, { status: 201 });
}