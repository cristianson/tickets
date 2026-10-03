/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF is ~20% smaller than WebP for the ticket photos and map backgrounds.
    formats: ["image/avif", "image/webp"],
    // 75 is the default; 50 is used for the faint map backgrounds.
    qualities: [50, 75],
    // Assets in /public rarely change; let browsers/CDN cache optimized variants for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

module.exports = nextConfig;
