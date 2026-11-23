import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function Orders(){const s=await getServerSession(authOptions);if(!s?.user?.id)redirect("/login");const orders=await prisma.order.findMany({where:{userId:s.user.id},include:{items:{include:{product:true}}},orderBy:{createdAt:"desc"}});return <main className="account-page"><header className="header"><Link className="logo" href="/">metu<span>.</span></Link><Link href="/account">← Λογαριασμός</Link></header><section className="account-content"><h1>Οι παραγγελίες μου</h1>{orders.length?orders.map(o=><article className="order-card order-expanded" key={o.id}><div><b>#{o.id.slice(-8).toUpperCase()}</b><p>{o.createdAt.toLocaleDateString("el-GR")} · {o.status}</p>{o.items.map(i=><small key={i.id}>{i.product.name} × {i.quantity}</small>)}</div><strong>€{Number(o.total).toFixed(2)}</strong></article>):<p>Δεν υπάρχουν παραγγελίες ακόμη.</p>}</section></main>}