import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
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
  
  // Updated dev indicators configuration
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
