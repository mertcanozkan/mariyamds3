import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob (public + private stores — private blobs served via proxy route)
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
      // Google OAuth profile pictures
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
