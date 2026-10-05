import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS === "true" ? "/-" : "",
  trailingSlash: true,
};

export default nextConfig;
