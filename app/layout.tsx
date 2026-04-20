import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import Providers from "./providers";
import StoreShell from "@/components/StoreShell";
import ErrorBoundary from "@/components/ErrorBoundary";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import "@/index.css";

// Self-hosted via next/font — no external DNS lookup, zero render-blocking
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "World of Mysore Pak — Premium Authentic Sweets",
  description:
    "Traditional Mysore Pak made with pure ghee and traditional recipes. Shop online and get authentic Mysuru sweets delivered to your door.",
  keywords: ["Mysore Pak", "Indian sweets", "ghee sweets", "online sweet shop"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <head>
        {/* Felix Titling is not in next/font — load async to avoid render-blocking */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maojwszmbrlnrjrllhar.supabase.co" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Felix+Titling&display=swap"
          media="print"
          // @ts-ignore — onLoad is valid on link elements for async font loading
          onLoad="this.media='all'"
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Felix+Titling&display=swap" />
        </noscript>
      </head>
      <body>
        <Providers>
          <ErrorBoundary>
            <StoreShell>{children}</StoreShell>
          </ErrorBoundary>
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  );
}
