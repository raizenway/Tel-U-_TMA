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
        pathname: "/uploads/branches/**", // 👈 Pastikan path ini cocok dengan URL di frontend
      },
    ],
  },
};

export default nextConfig;