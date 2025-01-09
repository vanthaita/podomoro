import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        // optional
        // port: '',
        // pathname: '/account123/**',
      },
    ],
  },
};

export default nextConfig;
