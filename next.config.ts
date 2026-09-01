/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Build time par ESLint mismatch errors ko bypass karega
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
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