// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/ask",
        destination: "http://localhost:8000/ask",
      },
      {
        source: "/api/last",
        destination: "http://localhost:8000/last",
      },
      {
        source: "/api/workouts/user",
        destination: "http://localhost:8000/workouts/user",
      },
    ];
  },
};

export default nextConfig;
