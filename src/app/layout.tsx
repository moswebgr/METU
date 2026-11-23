import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moswebgr.github.io/METU";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "METU — Ανακάλυψε κάτι ξεχωριστό", template: "%s | METU Marketplace" },
  description: "Ένα marketplace για ανεξάρτητα brands, δημιουργούς και ξεχωριστά προϊόντα.",
  openGraph: { title: "METU Marketplace", description: "Ανεξάρτητα brands. Ξεχωριστές ανακαλύψεις.", type: "website" },
  robots: { index: true, follow: true }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="el"><body><Providers>{children}</Providers></body></html>;
}