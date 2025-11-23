import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  transpilePackages: ["lucide-react", "prettier"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
