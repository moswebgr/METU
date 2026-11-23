import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 const p=await prisma.product.findUnique({where:{slug},include:{store:{select:{name:true,slug:true,description:true}},category:true}});
 if(!p||p.status!=="ACTIVE")notFound();
 return <main className="min-h-screen bg-white"><header className="header"><Link className="logo" href="/">metu<span>.</span></Link><Link href="/">← Επιστροφή στο marketplace</Link></header><section className="product-detail-page"><div className="product-detail-image">{p.imageUrl?<img src={p.imageUrl} alt={p.name}/>:<span>✳</span>}</div><div><div className="eyebrow">{p.store.name}</div><h1>{p.name}</h1><p>{p.description}</p><h2>€{Number(p.price).toFixed(2)}</h2><p className="muted">Κατηγορία: {p.category?.name||"Γενικά"} · Διαθέσιμα: {p.inventory}</p><p>Πωλητής: {p.store.name}</p><Link className="primary-btn" href="/#shop">Πίσω στις αγορές</Link></div></section></main>;
}