import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // AWS EC2 ke liye lightweight production build banata hai
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;