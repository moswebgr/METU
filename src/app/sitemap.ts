import type { MetadataRoute } from "next";
import {prisma} from "@/lib/prisma";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=process.env.NEXT_PUBLIC_SITE_URL||"https://metu.vercel.app";
 const products=await prisma.product.findMany({where:{status:"ACTIVE"},select:{slug:true,updatedAt:true}});
 return [{url:base,lastModified:new Date(),changeFrequency:"daily",priority:1},{url:base+"/about",priority:.5},{url:base+"/contact",priority:.4},{url:base+"/privacy",priority:.2},{url:base+"/terms",priority:.2},...products.map(p=>({url:base+"/products/"+p.slug,lastModified:p.updatedAt,changeFrequency:"weekly" as const,priority:.7}))];
}