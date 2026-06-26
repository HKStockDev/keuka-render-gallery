import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Thumbnails are served from /public; allow local paths
    unoptimized: false,
  },
};

export default nextConfig;
