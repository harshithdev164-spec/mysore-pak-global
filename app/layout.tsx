import type { Metadata } from "next";
import Providers from "./providers";
import StoreShell from "@/components/StoreShell";
import "@/index.css";

export const metadata: Metadata = {
  title: "World of Mysore Pak — Premium Authentic Sweets",
  description:
    "Handcrafted Mysore Pak made with pure ghee and traditional recipes. Shop online and get authentic Mysuru sweets delivered to your door.",
  keywords: ["Mysore Pak", "Indian sweets", "ghee sweets", "online sweet shop"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect before any other font request so the TCP handshake
            is already done when we request the font stylesheet/files. */}
        {/* Preload the brand pattern SVG used as background on every section */}
        <link rel="preload" href="/womp-bg.svg" as="image" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Non-blocking font load — replaces the render-blocking @import in CSS */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Felix+Titling&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
        />
      </head>
      <body>
        <Providers>
          <StoreShell>{children}</StoreShell>
        </Providers>
      </body>
    </html>
  );
}
