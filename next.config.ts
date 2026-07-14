import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 82, 84, 90, 92, 95],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
