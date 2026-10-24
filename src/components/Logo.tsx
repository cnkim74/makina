import { DRAGON_WORD, MARK, WORDMARK } from "./logo-paths";

/*
 * 성원마끼나 로고 (발톱 안). 모양은 scripts/logo.mjs 가 만든 logo-paths.ts 에서 온다.
 * 심볼은 건초금, 글자는 currentColor — 밝은 바탕엔 흙먹, 어두운 바탕엔 짚크림이 되도록 부모 색을 따른다.
 */

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
