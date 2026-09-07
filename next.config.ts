import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output: bundles only the production deps the server actually
  // needs into .next/standalone, so the Docker image doesn't ship the full
  // node_modules tree. See Dockerfile.
  output: "standalone",

  // Local-dev-only proxy: the backend is production-only and its CORS
  // allow-list doesn't include http://localhost:3000. Proxying same-origin
  // requests through Next's own server (not subject to browser CORS) avoids
  // needing a backend change just to develop locally. Only kicks in when
  // NEXT_PUBLIC_API_BASE_URL is set to a relative path (see .env.local) —
  // a deployed build pointed straight at an absolute backend URL is
  // unaffected.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://api.homelink.rw/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
