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
      { source: "/api/ask",               destination: "http://localhost:8000/ask" },
      { source: "/api/last",              destination: "http://localhost:8000/last" },
      { source: "/api/save-workout-plan", destination: "http://localhost:8000/save-workout-plan" },
      { source: "/api/end-conversation",  destination: "http://localhost:8000/end-conversation" },

      { source: "/api/workouts/user",     destination: "http://localhost:8000/workouts/user" },
      { source: "/api/workouts/:id",      destination: "http://localhost:8000/workouts/:id" },
      { source: "/api/workouts/set-main", destination: "http://localhost:8000/workouts/set-main" },

      {
        source: "/api/posts/:postId/comments",
        destination: "http://localhost:8000/api/posts/:postId/comments",
      },
      {
        source: "/api/comments/:commentId",
        destination: "http://localhost:8000/api/comments/:commentId",
      },
      {
        source: "/auth/me",
        destination: "http://localhost:8000/auth/me",
      },
    ];
  },
};

export default nextConfig;
