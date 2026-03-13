/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  // Needed for Three.js (uses Node.js globals in some packages)
  transpilePackages: ["three"],
};

export default nextConfig;
