"use client";

import { useEffect } from "react";
import Script from "next/script";
import { track } from "@/lib/track";

const GA_RE = /^G-[A-Z0-9]{4,}$/;
const CH_RE = /^[\w-]{8,}$/;

declare global {
  interface Window {
    ChannelIO?: ((...args: unknown[]) => void) & { q?: unknown[]; c?: (a: unknown) => void };
    ChannelIOInitialized?: boolean;
  }
}

/**
 * 공개 홈페이지의 분석·상담 연결.
 * - Google Analytics 4 (관리자 "분석"에서 측정 ID 입력 시)
 * - 전화·카카오톡 버튼 클릭, 페이지 방문을 자체 집계 + GA 이벤트로
 * - 채널톡 상담 버튼 (관리자 "고객지원"에서 플러그인 키 입력 시)
 */
export default function SiteAnalytics({ gaId, channelTalkKey }: { gaId: string; channelTalkKey: string }) {
  const ga = GA_RE.test(gaId) ? gaId : "";

  // 방문 1회 + 버튼 클릭
  useEffect(() => {
    track("page_view");
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) track("call_click", (a.textContent ?? "").trim().slice(0, 40));
      else if (/kakao|pf\.kakao/i.test(href) || a.dataset.track === "kakao") track("kakao_click", href);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // 채널톡
  useEffect(() => {
    if (!CH_RE.test(channelTalkKey)) return;
    const w = window;
    if (!w.ChannelIO) {
      const ch = ((...args: unknown[]) => ch.c!(args)) as NonNullable<Window["ChannelIO"]>;
      ch.q = [];
      ch.c = (a) => ch.q!.push(a);
      w.ChannelIO = ch;
      if (!w.ChannelIOInitialized) {
        w.ChannelIOInitialized = true;
        const sc = document.createElement("script");
        sc.async = true;
        sc.src = "https://cdn.channel.io/plugin/ch-plugin-web.js";
        document.head.appendChild(sc);
      }
    }
    const mobile = window.matchMedia("(max-width: 900px)").matches;
    // 모바일은 하단 유리 도크가 있으므로 기본 버튼을 숨긴다
    w.ChannelIO?.("boot", { pluginKey: channelTalkKey, hideChannelButtonOnBoot: mobile });
    document.body.classList.add("has-chat");
    return () => {
      w.ChannelIO?.("shutdown");
      document.body.classList.remove("has-chat");
    };
  }, [channelTalkKey]);

  if (!ga) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`}
      </Script>
    </>
  );
}
