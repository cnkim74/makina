import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * 지금은 모든 페이지가 정적이라 캐시 설정이 필요 없다.
 * ISR이나 서버 렌더링을 쓰게 되면 R2 incremental cache 를 여기에 추가한다.
 */
export default defineCloudflareConfig({});
