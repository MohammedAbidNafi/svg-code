import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: [
    "@svgr/core",
    "@svgr/plugin-jsx",
    "@babel/core",
    "@babel/preset-typescript",
    "prettier",
  ],
};

export default nextConfig;
