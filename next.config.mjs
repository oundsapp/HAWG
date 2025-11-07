/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dexscreener.com',
      },
      {
        protocol: 'https',
        hostname: '**.dexscreener.com',
      },
      {
        protocol: 'https',
        hostname: 'ore.supply',
      },
    ],
  },
};

export default nextConfig;

