import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import { PERSON } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * UI chrome gets the clean geometric sans (the "organized skeleton" half of the
 * metaphor); the handwriting face is reserved for sticky notes and todo flavour
 * text, never for project descriptions or resume content (design doc §3).
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${PERSON.name}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Pallav Dholariya",
    "AI ML Engineer",
    "Systems Builder",
    "portfolio",
    "Deploy Forge",
    "deployment infrastructure",
    "WebGL",
    "custom renderer",
    "Next.js",
    "developer infrastructure",
  ],
  authors: [{ name: PERSON.name, url: PERSON.github }],
  creator: PERSON.name,
  publisher: PERSON.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "47 Tabs Open — portfolio of Pallav Dholariya, AI/ML Engineer and Systems Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "portfolio",
};

export const viewport: Viewport = {
  themeColor: "#f4f1ea",
  width: "device-width",
  initialScale: 1,
};

/** Structured data: who this portfolio belongs to. */
function PersonJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSON.name,
    jobTitle: PERSON.positioning,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressCountry: "IN",
    },
    alumniOf: PERSON.education,
    sameAs: [PERSON.github, PERSON.linkedin],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased">
        <PersonJsonLd />
        {children}
      </body>
    </html>
  );
}
