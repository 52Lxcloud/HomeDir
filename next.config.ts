import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.10.151", "127.0.0.1"],
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
