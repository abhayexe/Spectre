import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ❌ Not recommended for production
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignores ESLint errors during deployment
  },
};

export default nextConfig;
