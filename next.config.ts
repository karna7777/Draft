import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Three Fiber + drei <Html> portals don't survive StrictMode's dev
  // double-mount (it synchronously unmounts the portal root mid-render). This
  // is dev-only React behaviour; disabling it is the standard choice for R3F
  // apps and has no effect on production rendering.
  reactStrictMode: false,
};

export default nextConfig;
