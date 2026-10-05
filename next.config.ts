import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// `next dev` 에서도 Cloudflare 바인딩(env)을 쓸 수 있게 한다.
initOpenNextCloudflareForDev();
