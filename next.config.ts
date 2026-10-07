import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir conexiones de desarrollo desde IPs locales / LAN para probar desde celular
  allowedDevOrigins: [
    "172.31.17.139",
    "172.31.17.139:3000",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-oracle.lukeapp.cl',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.lukeapp.cl',
        pathname: '/**',
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
