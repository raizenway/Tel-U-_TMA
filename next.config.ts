import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000", // 👈 Ini sudah sesuai dengan port backend-mu
        pathname: "/uploads/**", // 👈 Pastikan path ini cocok dengan URL di frontend
      },
      {
        protocol: "https",
        hostname: "tma.telkomuniversity.ac.id",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;