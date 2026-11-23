import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  if (!["ACTIVE", "ARCHIVED", "DRAFT"].includes(body.status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  const product = await prisma.product.update({ where: { id }, data: { status: body.status } });
  return NextResponse.json({ id: product.id, status: product.status });
}