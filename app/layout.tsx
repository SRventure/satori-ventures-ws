import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Providers from "@/components/providers/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.satori.ventures"),
  title: "Satori.Ventures — Fostering the Blockchain Renaissance",
  description:
    "Satori Ventures is a venture capital firm investing in transformative Web3, blockchain, and AI companies. We back the potential of tomorrow.",
  openGraph: {
    type: "website",
    url: "https://www.satori.ventures/",
    title: "Satori.Ventures — Fostering the Blockchain Renaissance",
    description:
      "A venture capital firm investing in transformative Web3, blockchain, and AI companies.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
};

const themeInit = `(function(){try{var t=localStorage.getItem('satori-theme');if(t!=='light'&&t!=='dark'){t='dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={`${playfair.variable} ${inter.variable} ${archivo.variable} grain`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
