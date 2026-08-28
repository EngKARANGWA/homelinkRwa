import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: bundles only the production deps the server actually
  // needs into .next/standalone, so the Docker image doesn't ship the full
  // node_modules tree. See Dockerfile.
  output: "standalone",
};

export default nextConfig;
