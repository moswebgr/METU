import { prisma } from "@/lib/prisma";
import { Marketplace } from "@/components/marketplace";
export const dynamic = "force-dynamic";
export default async function Home() {
  const productsEnabled = process.env.MARKETPLACE_PRODUCTS_ENABLED === "true";
  const [products, categories] = await Promise.all([
    productsEnabled ? prisma.product.findMany({ where: { status: "ACTIVE", store: { isVerified: true } }, include: { store: { select: { name: true, slug: true } }, category: { select: { name: true, slug: true } } }, orderBy: [{ featured: "desc" }, { createdAt: "desc" }], take: 48 }) : Promise.resolve([]),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);
  const serializable = products.map(p => ({ ...p, price: Number(p.price), compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null, createdAt: p.createdAt.toISOString() }));
  return <Marketplace products={serializable} categories={categories} />;
}