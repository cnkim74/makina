/* 브라우저에서 부르는 분석 이벤트. Google Analytics(설정된 경우)와 자체 집계(/api/track) 양쪽에 보낸다 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type TrackType =
  | "page_view"
  | "call_click"
  | "kakao_click"
  | "inquiry_submit"
  | "video_play"
  | "cta_click";

export function track(type: TrackType, label = "") {
  if (typeof window === "undefined") return;
  try {
    if (type !== "page_view") window.gtag?.("event", type, { event_label: label });
    const body = JSON.stringify({ type, label: label.slice(0, 80), path: location.pathname });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
  } catch {
    /* 분석 실패는 사용자에게 영향을 주지 않는다 */
  }
}
