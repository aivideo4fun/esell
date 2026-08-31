import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Sabhi external image URLs allow karne ke liye
      },
    ],
  },
};

export default nextConfig;