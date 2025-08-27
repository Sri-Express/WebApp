import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Ensure proper static file handling
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Enable experimental features for better error handling
  experimental: {
    forceSwcTransforms: true,
  },
  
  // Better error overlay
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
