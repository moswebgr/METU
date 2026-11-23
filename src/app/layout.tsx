import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "METU — Discover something good", description: "A modern multi-vendor marketplace for independent brands and everyday finds." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
