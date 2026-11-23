import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (process.env.MARKETPLACE_PRODUCTS_ENABLED !== "true") return NextResponse.json([]);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", store: { isVerified: true }, ...(category ? { category: { slug: category } } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { store: { name: { contains: q, mode: "insensitive" } } }] } : {}) },
    include: { store: { select: { name: true, slug: true } }, category: { select: { name: true, slug: true } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });
  return NextResponse.json(products);
}