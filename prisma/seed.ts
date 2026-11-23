import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const categories = [["Μόδα","fashion"],["Σπίτι & Διακόσμηση","home-living"],["Αξεσουάρ","accessories"],["Ομορφιά","beauty"],["Τρόφιμα & Ποτά","food-drink"],["Χαρτικά","stationery"]];
  for (const [name,slug] of categories) await prisma.category.upsert({ where:{slug}, update:{name}, create:{name,slug} });
  const admins=(process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  for(const email of admins) await prisma.user.updateMany({where:{email},data:{role:"ADMIN"}});
}
main().finally(()=>prisma.$disconnect());
