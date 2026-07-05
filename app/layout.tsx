import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
  // Brand green — Chrome's address bar, iOS Safari status bar, Android nav bar
  // all pick this up. Also used by the PWA manifest.
  themeColor: "#1B3A2D",
};

export const metadata: Metadata = {
  title: "World of Mysore Pak — Premium Authentic Sweets",
  description:
    "Traditional Mysore Pak made with pure ghee and traditional recipes. Shop online and get authentic Mysuru sweets delivered to your door.",
  keywords: ["Mysore Pak", "Indian sweets", "ghee sweets", "online sweet shop"],
  // Next App Router auto-emits <link> tags from app/icon.png, app/apple-icon.png
  // and app/favicon.ico — no manual `icons:` block needed. The manifest below
  // points Android/Edge/Firefox PWAs at the full multi-size set.
  manifest: "/manifest.webmanifest",
  // iOS-specific PWA hints — make the home-screen icon look native
  appleWebApp: {
    title: "WOMP",
    capable: true,
    statusBarStyle: "default",
  },
  other: {
    // Windows Pinned Site / Edge legacy tile colour
    "msapplication-TileColor": "#1B3A2D",
    "msapplication-TileImage": "/icon-192.png",
  },
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
        {/* Mapbox GL CSS */}
        <link href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css" rel="stylesheet" />
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PLN4TZZR');`}
        </Script>
        {/* Organization schema markup (JSON-LD) */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "World Of Mysore Pak",
              url: "https://www.worldofmysorepak.com/",
              logo: "https://www.worldofmysorepak.com/logo.svg",
              sameAs: [
                "https://www.facebook.com/profile.php?id=61568545833768&mibextid=ZbWKwL",
                "https://www.instagram.com/worldofmysorepakofficial?igsh=MWQ2ejRyYmtxdW02aw==",
                "https://youtube.com/@worldofmysorepak?si=t6_hvr6a-hE7RgWm",
                "https://www.linkedin.com/company/world-of-mysorepak/",
              ],
            }),
          }}
        />
        {/* End Organization schema markup (JSON-LD) */}

        {/* End Google Tag Manager */}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PLN4TZZR"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Providers>
          <ErrorBoundary>
            <StoreShell>{children}</StoreShell>
          </ErrorBoundary>
        </Providers>
        {/* Floating WhatsApp button — global, always visible on every page
            (including admin and tour-guide). Imported but unrendered until
            this fix; that's why customers were seeing no chat button at all. */}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
