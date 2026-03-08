import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  trailingSlash: true
};

export default nextConfig;
