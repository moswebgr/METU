import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const categories = [
    ["Προσωπική Φροντίδα & Ομορφιά","beauty-personal-care"],
    ["Γυναικεία Ένδυση","womens-clothing"],
    ["Σπίτι & Κουζίνα","home-kitchen"],
    ["Ανδρική Ένδυση","mens-clothing"],
    ["Γυναικεία Παπούτσια","womens-shoes"],
    ["Ανδρικά Εσώρουχα & Ρούχα Ύπνου","mens-underwear-sleepwear"],
    ["Αθλητισμός & Υπαίθριες Δραστηριότητες","sports-outdoors"],
    ["Είδη Γραφείου & Σχολείου","office-school-supplies"],
    ["Παιχνίδια & Games","toys-games"],
    ["Κοσμήματα & Αξεσουάρ","jewelry-accessories"],
    ["Ηλεκτρονικά","electronics"],
    ["Κινητά & Αξεσουάρ","phones-accessories"],
    ["Αυτοκίνητο & Μοτοσικλέτα","automotive-motorcycle"],
    ["Βρεφικά & Παιδικά","baby-kids"],
    ["Κατοικίδια","pet-supplies"],
    ["Εργαλεία & Βελτίωση Σπιτιού","tools-home-improvement"],
    ["Αποθήκευση & Οργάνωση","storage-organization"],
    ["Παπούτσια & Τσάντες","shoes-bags"],
    ["Τρόφιμα & Ποτά","food-drink"],
    ["Χαρτικά & Είδη Χειροτεχνίας","stationery-crafts"]
  ];
  for (const [name,slug] of categories) await prisma.category.upsert({ where:{slug}, update:{name}, create:{name,slug} });
  const admins=(process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  for(const email of admins) await prisma.user.updateMany({where:{email},data:{role:"ADMIN"}});
}
main().finally(()=>prisma.$disconnect());
