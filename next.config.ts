import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir conexiones de desarrollo desde IPs locales / LAN para probar desde celular
  allowedDevOrigins: [
    "172.31.17.139",
    "172.31.17.139:3000",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
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
