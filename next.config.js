/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF is ~20% smaller than WebP for the ticket photos and map backgrounds.
    formats: ["image/avif", "image/webp"],
    // 75 is the default; 100 is used for the desktop maps (see lib/images.ts).
    qualities: [75, 100],
    // Defaults plus 1600, the phone map crop's size on 3x phones (~1560px).
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920, 2048, 3840],
    // Assets in /public rarely change; let browsers/CDN cache optimized variants for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  // The static AVIF maps (scripts/optimize-images.mjs) have a content hash in
  // their names, so browsers and the CDN can keep them forever.
  async headers() {
    return [
      {
        source: "/maps/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

module.exports = nextConfig;
