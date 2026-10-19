/* 서버·클라이언트가 함께 쓰는 CMS 데이터 모양 */
import type { HeroVideo, Video } from "@/data/content";

export type SiteInfo = {
  name: string;
  nameEn: string;
  tagline: string;
  slogan: string;
  sloganSub: string;
  phone: string;
  phoneHref: string;
  phone2: string;
  phone2Href: string;
  fax: string;
  address: string;
  hours: string;
  ceo: string;
  bizNo: string;
  kakaoHref: string;
  mapHref: string;
  routeHref: string;
  naverMapHref: string;
  mapEmbed: string;
  youtubeHref: string;
};

/** 관리자 "고객지원" 화면에서 고치는 연락처 */
export type ContactSettings = {
  phone: string;
  /** 두 번째 회선 (없으면 빈 칸) */
  phone2: string;
  hours: string;
  address: string;
  fax: string;
  ceo: string;
  bizNo: string;
  kakaoUrl: string;
  mapUrl: string;
};

/** 외부 서비스 연결 */
export type IntegrationSettings = {
  /** Google Analytics 4 측정 ID (G-XXXXXXX) */
  gaId: string;
  /** 채널톡 플러그인 키 — 넣으면 사이트에 상담 버튼이 뜬다 */
  channelTalkKey: string;
  /** 새 문의가 오면 알릴 웹훅 주소 (슬랙·디스코드 등). 사이트에는 노출하지 않는다 */
  inquiryWebhook: string;
};

export type HeroCaption = { word: string; ko: string; from: number; to: number };

export type HeroSettings = {
  /** video: 스크롤 영상 / sketch: SVG 자리표시 장면 */
  mode: "video" | "sketch";
  video: HeroVideo;
  story: HeroCaption[];
  tagline: string;
  slogan: string;
};

export type SnsPlatform = "youtube" | "instagram" | "blog" | "facebook" | "kakao" | "tiktok" | "x" | "etc";

export type SnsLink = { id: number; platform: SnsPlatform; label: string; url: string };

export type PublicData = {
  site: SiteInfo;
  hero: { video: HeroVideo | null; story: HeroCaption[] };
  videos: Video[];
  sns: SnsLink[];
  integrations: { gaId: string; channelTalkKey: string };
};

export const SNS_PLATFORMS: { id: SnsPlatform; label: string }[] = [
  { id: "youtube", label: "유튜브" },
  { id: "instagram", label: "인스타그램" },
  { id: "blog", label: "블로그" },
  { id: "facebook", label: "페이스북" },
  { id: "kakao", label: "카카오톡 채널" },
  { id: "tiktok", label: "틱톡" },
  { id: "x", label: "X" },
  { id: "etc", label: "기타" },
];

export const INQUIRY_CATEGORIES = ["구매 상담", "소모품 주문", "A/S · 정비", "시연 · 방문 예약", "기타"] as const;

export const INQUIRY_STATUS: Record<"new" | "in_progress" | "done", string> = {
  new: "새 문의",
  in_progress: "처리 중",
  done: "완료",
};

/** "054-843-4000" → "tel:0548434000" */
export function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#";
}

/** "054-843-4000" + "054-843-4001" → "054-843-4000~1" (앞부분이 다르면 쉼표로 잇는다) */
export function phoneRange(p1: string, p2?: string) {
  if (!p2) return p1;
  if (p1.length === p2.length) {
    let i = 0;
    while (i < p1.length && p1[i] === p2[i]) i++;
    if (i >= p1.length - 2) return `${p1}~${p2.slice(i)}`;
  }
  return `${p1}, ${p2}`;
}
