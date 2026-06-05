import type { MetadataRoute } from "next";

// PWA manifest — tells Android Chrome / Edge / Firefox how to install
// the site as an app and which icons to use at every density.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "World of Mysore Pak",
    short_name: "WOMP",
    description:
      "Premium authentic Mysuru sweets — pure ghee, fresh batches, delivered pan-India.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF7F0",
    theme_color: "#1B3A2D",
    orientation: "portrait",
    icons: [
      // Standard icons (any purpose) — used for browser tab, address bar, etc.
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Maskable icons — Android adaptive icon, safely padded for circle/squircle mask
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
