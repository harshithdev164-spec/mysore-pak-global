/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle at .next/standalone/server.js so PM2
  // (on Cloudways / DigitalOcean droplet) can run the app without needing
  // node_modules or the `next` CLI. See scripts/copy-standalone-assets.mjs —
  // it runs postbuild to copy public/ and .next/static/ into the standalone dir.
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      {
        // Old single-product URLs → new /products/:slug (301 permanent)
        source: "/product/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      // Keep a stable /sitemap.xml URL while serving from app/sitemap
      { source: '/sitemap.xml', destination: '/sitemap' },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
          },
        ],
      },
      {
        // Cache all public static assets for 1 year
        source: "/(:path*)(png|jpg|jpeg|webp|avif|svg|ico|woff2|woff)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Short CDN cache for product/category API responses
        source: "/api/products(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=30, stale-while-revalidate=300" },
        ],
      },
      {
        source: "/api/categories(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=600" },
        ],
      },
    ];
  },
};

export default nextConfig;
