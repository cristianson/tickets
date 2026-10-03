/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF is ~20% smaller than WebP for the ticket photos and map backgrounds.
    formats: ["image/avif", "image/webp"],
    // 75 is the default; 60 is used for the faint map backgrounds.
    qualities: [60, 75],
    // Defaults plus 2560/3200, so 3x phones get a map close to the size they
    // draw it (~3100-3600px) instead of jumping from 2048 straight to 3840.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3200, 3840],
    // Assets in /public rarely change; let browsers/CDN cache optimized variants for 30 days.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

module.exports = nextConfig;
