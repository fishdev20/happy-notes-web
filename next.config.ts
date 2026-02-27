import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn6.aptoide.com",
      },
    ],
  },
};

export default nextConfig;
