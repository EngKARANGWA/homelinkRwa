import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HomeLink Rwanda | All-in-One Property Management Platform",
    short_name: "HomeLink",
    description:
      "HomeLink Rwanda helps property owners and managers simplify operations, keep tenants happy and grow their rental business - all in one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1628",
    theme_color: "#0a1628",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
