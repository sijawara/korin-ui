import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@monorepo/shadcn-ui"],
};

export default nextConfig;
