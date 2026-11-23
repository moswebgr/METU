import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  if (!["APPROVED", "REJECTED"].includes(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  const application = await prisma.sellerApplication.update({ where: { id }, data: { status: body.status }, include: { user: true } });
  if (body.status === "APPROVED") {
    const storeName = application.brandName;
    await prisma.$transaction([
      prisma.store.upsert({ where: { ownerId: application.userId }, update: { name: storeName, description: application.description }, create: { ownerId: application.userId, name: storeName, slug: slugify(storeName) + "-" + application.id.slice(-5), description: application.description } }),
      prisma.user.update({ where: { id: application.userId }, data: { role: "SELLER" } })
    ]);
  }
  return NextResponse.json({ id: application.id, status: application.status });
}