import type { NextConfig } from "next";

// A GitHub project site is published under /<repo>/, so every asset needs that prefix. The
// deploy workflow sets this; it stays empty locally, for a user page, or for a custom domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // GitHub Pages serves plain files, so the site is exported as static HTML. That rules out
  // the on-demand image optimizer, which needs a running server — every image in public/ is
  // already a sized webp, so they are served as-is.
  output: "export",
  images: { loader: "custom", loaderFile: "./app/image-loader.ts" },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
