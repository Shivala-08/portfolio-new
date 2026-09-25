import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

/**
 * UI chrome gets the clean geometric sans (the "organized skeleton" half of the
 * metaphor); the handwriting face is reserved for sticky notes and todo flavour
 * text, never for project descriptions or resume content (design doc §3).
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "47 Tabs Open — Pallav Dholariya",
  description:
    "Portfolio of Pallav Dholariya — AI/ML Engineer · Systems Builder. Deployment infrastructure, a custom WebGL renderer, and retrieval systems that were measured rather than asserted.",
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
