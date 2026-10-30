import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 관리자 "네임카드"에서 명함 사진 두 장(각 8MB 이하)을 폼으로 올린다
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;

// `next dev` 에서도 Cloudflare 바인딩(env)을 쓸 수 있게 한다.
initOpenNextCloudflareForDev();
