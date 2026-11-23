import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params;
 const p=await prisma.product.findFirst({where:{slug,status:"ACTIVE",store:{isVerified:true}},include:{store:{select:{name:true,slug:true,description:true}},category:true}});
 if(!p)notFound();
 const identity=p.ean?{ean:p.ean}:p.mpn?{mpn:p.mpn}:{id:p.id};
 const offers=await prisma.product.findMany({where:{...identity,status:"ACTIVE",store:{isVerified:true}},include:{store:{select:{name:true,slug:true}}},orderBy:{price:"asc"}});
 return <main className="min-h-screen bg-white"><header className="header"><Link className="logo" href="/">metu<span>.</span></Link><Link href="/">← Επιστροφή στη σύγκριση</Link></header><section className="product-detail-page"><div className="product-detail-image">{p.imageUrl?<img src={p.imageUrl} alt={p.name}/>:<span>✳</span>}</div><div><div className="eyebrow">{p.store.name}</div><h1>{p.name}</h1><p>{p.description}</p><p className="muted">Κατηγορία: {p.category?.name||"Γενικά"}{p.ean?" · EAN: "+p.ean:""}{p.mpn?" · MPN: "+p.mpn:""}</p><h2>Σύγκριση τιμών</h2><p>Βρήκαμε {offers.length} διαθέσιμες προσφορές από συνεργαζόμενα καταστήματα.</p></div></section><section className="account-content"><h2>Όλες οι προσφορές</h2><div className="offer-list">{offers.map(o=><article className="order-card" key={o.id}><div><b>{o.store.name}</b><p>{o.availability} · Μεταφορικά: €{Number(o.shipping).toFixed(2)}</p><small>Η τελική τιμή και διαθεσιμότητα επιβεβαιώνονται στο κατάστημα.</small></div><strong>€{Number(o.price).toFixed(2)}</strong><strong>Σύνολο €{(Number(o.price)+Number(o.shipping)).toFixed(2)}</strong><a className="primary-btn" href={o.storeUrl||"#"} target="_blank" rel="noopener noreferrer nofollow">Μετάβαση στο κατάστημα ↗</a></article>)}</div></section><footer className="footer-bottom">Η METU συγκρίνει προσφορές. Η αγορά και η πληρωμή γίνονται αποκλειστικά στο ηλεκτρονικό κατάστημα του πωλητή.</footer></main>;
}