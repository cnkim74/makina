import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cloudflare 빌드 산출물
    ".open-next/**",
    ".wrangler/**",
    "cloudflare-env.d.ts",
    // 인쇄물·브랜드북을 만드는 보관용 스크립트 (사이트 코드가 아님)
    "docs/**",
  ]),
]);

export default eslintConfig;
