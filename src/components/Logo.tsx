import { DRAGON_WORD } from "./dragon-word";
import { MARK, WORDMARK } from "./logo-paths";

/*
 * 회사 로고는 CompanyLogo(삼색 심볼 + 붓글씨 성원마끼나, 2026-10-28 교정으로 홈페이지·인쇄물 공통).
 * LogoMark·MAKKINA 워드마크는 scripts/logo.mjs 가 만든 logo-paths.ts 의 도형이다(지금 화면에서는 쓰지 않는다).
 * DRAGON 워드마크는 HS봄바람체 윤곽(dragon-word.ts, scripts/dragon-word.py)이다.
 */

const COMPANY_LOGO = { w: 1767, h: 394 };

/** 회사 로고. tone="light" 는 밝은 바탕(검은 글씨), "dark" 는 어두운 바탕(흰 글씨). height 는 px */
export function CompanyLogo({
  height = 28,
  tone = "light",
  title,
}: {
  height?: number;
  tone?: "light" | "dark";
  /** 있으면 읽어 주고, 없으면 장식으로 숨긴다 */
  title?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={tone === "dark" ? "/brand/sungwon-logo-white.webp" : "/brand/sungwon-logo.webp"}
      width={Math.round((height * COMPANY_LOGO.w) / COMPANY_LOGO.h)}
      height={height}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      style={{ flex: "none", display: "block", maxWidth: "100%", height: "auto" }}
    />
  );
}

/** 심볼 — 비스듬한 칼날 세 개. size 는 높이(px) */
export function LogoMark({ size = 32, color = "var(--hay-gold)" }: { size?: number; color?: string }) {
  return (
    <svg
      viewBox={`0 0 ${MARK.w} ${MARK.h}`}
      height={size}
      width={Math.round((size * MARK.w) / MARK.h)}
      aria-hidden="true"
      focusable="false"
      style={{ flex: "none" }}
    >
      <path d={MARK.d} fill={color} />
    </svg>
  );
}

/** 워드마크 — MAKKINA 또는 DRAGON. height 는 대문자 높이(px) */
export function Wordmark({
  word = "makkina",
  height = 20,
  color = "currentColor",
  title,
}: {
  word?: "makkina" | "dragon";
  height?: number;
  color?: string;
  /** 있으면 읽어 주고, 없으면 장식으로 숨긴다 */
  title?: string;
}) {
  const w = word === "dragon" ? DRAGON_WORD : WORDMARK;
  return (
    <svg
      viewBox={`0 0 ${w.w} ${w.h}`}
      height={height}
      width={Math.round((height * w.w) / w.h)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      style={{ flex: "none", maxWidth: "100%", height: "auto" }}
    >
      <path d={w.d} fill={color} />
    </svg>
  );
}
