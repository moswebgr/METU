import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";
const itemSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(5000).default(""),
  price: z.coerce.number().positive().max(100000),
  inventory: z.coerce.number().int().min(0).max(100000).default(0),
  storeUrl: z.string().url(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  sku: z.string().trim().max(100).optional(),
  ean: z.string().trim().max(14).optional(),
  mpn: z.string().trim().max(100).optional(),
  availability: z.string().trim().max(80).default("Άμεσα διαθέσιμο"),
  shipping: z.coerce.number().min(0).max(10000).default(0),
  categoryName: z.string().trim().max(80).optional()
});
function listFrom(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    if (value.products) return listFrom(value.products.product ?? value.products);
    if (value.product) return listFrom(value.product);
    if (value.item) return listFrom(value.item);
    if (value.items) return listFrom(value.items.item ?? value.items);
  }
  return value && typeof value === "object" ? [value] : [];
}
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["SELLER", "ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Απαιτείται εγκεκριμένος λογαριασμός καταστήματος." }, { status: 403 });
  const store = await prisma.store.findUnique({ where: { ownerId: session.user.id } });
  if (!store) return NextResponse.json({ error: "Δεν βρέθηκε το κατάστημά σου." }, { status: 404 });
  const raw = await request.text();
  if (!raw || raw.length > 5_000_000) return NextResponse.json({ error: "Το αρχείο είναι κενό ή υπερβαίνει τα 5MB." }, { status: 400 });
  let records: any[];
  try {
    const trimmed = raw.trim();
    const parsed = trimmed.startsWith("<") ? new XMLParser({ ignoreAttributes: false, trimValues: true }).parse(trimmed) : JSON.parse(trimmed);
    records = listFrom(parsed);
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο XML ή JSON αρχείο." }, { status: 400 });
  }
  if (!records.length || records.length > 5000) return NextResponse.json({ error: "Το αρχείο πρέπει να περιέχει από 1 έως 5.000 προϊόντα." }, { status: 400 });
  const valid = records.map((r, index) => {
    const value = (key: string, ...aliases: string[]) => {
      for (const k of [key, ...aliases]) if (r?.[k] !== undefined) return r[k];
      return undefined;
    };
    return itemSchema.safeParse({
      name: value("name", "title", "product_name"),
      description: value("description", "desc") ?? "Προϊόν από το αρχείο καταστήματος.",
      price: value("price"),
      inventory: value("inventory", "stock", "quantity") ?? 0,
      storeUrl: value("storeUrl", "url", "link", "product_url"),
      imageUrl: value("imageUrl", "image", "image_link") ?? "",
      sku: value("sku", "id"),
      ean: value("ean", "gtin", "barcode"),
      mpn: value("mpn", "manufacturer_part_number"),
      availability: value("availability", "stock_status") ?? "Άμεσα διαθέσιμο",
      shipping: value("shipping", "shipping_cost") ?? 0,
      categoryName: value("category", "categoryName")
    });
  });
  const invalid = valid.map((v, i) => !v.success ? i + 1 : null).filter(Boolean);
  if (invalid.length) return NextResponse.json({ error: "Υπάρχουν προϊόντα με ελλιπή ή μη έγκυρα πεδία.", invalidRows: invalid.slice(0, 50), invalidCount: invalid.length }, { status: 400 });
  const rows = valid.map(v => (v as { success: true; data: z.infer<typeof itemSchema> }).data);
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
  const created = await prisma.$transaction(rows.map((p, index) => {
    const slug = slugify(p.name) + "-" + Math.random().toString(36).slice(2, 8) + "-" + index;
    return prisma.product.create({ data: {
      name: p.name, description: p.description, price: p.price, inventory: p.inventory,
      storeUrl: p.storeUrl, imageUrl: p.imageUrl || null, sku: p.sku || null, ean: p.ean || null,
      mpn: p.mpn || null, availability: p.availability, shipping: p.shipping,
      categoryId: p.categoryName ? categoryMap.get(p.categoryName.toLowerCase()) ?? null : null,
      slug, storeId: store.id, status: "DRAFT"
    }});
  }));
  return NextResponse.json({ imported: created.length, status: "DRAFT", message: "Τα προϊόντα εισήχθησαν ως πρόχειρα και περιμένουν έγκριση." }, { status: 201 });
}
