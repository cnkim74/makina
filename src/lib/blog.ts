/* 블로그 — 서버·클라이언트가 함께 쓰는 모양과 계산 (cnbizpartners.com 인사이트 블로그 방식) */

export type BlogFaq = { q: string; a: string };

/** 표지 카드. 이미지를 만들지 않고 화면에서 그린다(Workers 번들을 가볍게). photo 는 올린 사진 위에 제목 */
export const COVER_TEMPLATES = [
  { id: "soil", label: "흙먹", desc: "어두운 바탕에 건초금, 기본형" },
  { id: "cream", label: "볏짚", desc: "밝은 바탕, 정보·체크리스트형" },
  { id: "gold", label: "건초금", desc: "금색 바탕에 검은 글자, 눈에 띄는 홍보형" },
  { id: "keyword", label: "키워드", desc: "검색 키워드를 크게" },
  { id: "photo", label: "사진", desc: "올린 사진 위에 제목 (사진 필요)" },
] as const;
export type CoverTemplate = (typeof COVER_TEMPLATES)[number]["id"];

export type BlogCover = { template: CoverTemplate; eyebrow: string; image: string };

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  keyword: string;
  tags: string[];
  faq: BlogFaq[];
  cover: BlogCover;
  youtube_id: string;
  status: "draft" | "published";
  source: string;
  published_at: string | null;
  views: number;
  fb_post_id: string;
  fb_permalink: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type BlogRow = Omit<BlogPost, "tags" | "faq" | "cover"> & { tags: string; faq: string; cover: string };

const TEMPLATE_IDS = COVER_TEMPLATES.map((t) => t.id) as readonly string[];

export function cleanCover(raw: unknown): BlogCover {
  const c = (raw ?? {}) as Record<string, unknown>;
  const image = typeof c.image === "string" && /^(https:\/\/|\/media\/|\/images\/)[^\s"'<>]+$/.test(c.image) ? c.image : "";
  let template = (TEMPLATE_IDS.includes(String(c.template)) ? c.template : "soil") as CoverTemplate;
  if (template === "photo" && !image) template = "soil";
  return { template, eyebrow: typeof c.eyebrow === "string" ? c.eyebrow.slice(0, 20) : "", image };
}

function json<T>(s: string, dflt: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return dflt;
  }
}

export function fromRow(r: BlogRow): BlogPost {
  const tags = json<unknown>(r.tags, []);
  const faq = json<unknown>(r.faq, []);
  return {
    ...r,
    tags: Array.isArray(tags) ? tags.map(String).filter(Boolean) : [],
    faq: Array.isArray(faq)
      ? faq.filter((f) => f && typeof f === "object" && "q" in f && "a" in f).map((f) => ({ q: String(f.q), a: String(f.a) }))
      : [],
    cover: cleanCover(json(r.cover, {})),
  };
}

/** 영문 소문자·숫자·하이픈. 한글 제목이면 비워 두고 저장할 때 날짜로 만든다 */
export function cleanSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function readingMinutes(src: string) {
  return Math.max(1, Math.round(src.replace(/\s+/g, "").length / 600));
}

/** 목차용 ## 제목 */
export function headings(src: string) {
  return src
    .split("\n")
    .filter((l) => /^##\s+/.test(l))
    .map((l) => l.replace(/^##\s+/, "").trim());
}

export function headingId(text: string) {
  return text
    .replace(/[*_`~]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .toLowerCase();
}

/** "2026-11-12 03:00:00"(UTC) → "2026. 11. 12." */
export function postDate(utc: string | null) {
  if (!utc) return "";
  const t = Date.parse(utc.replace(" ", "T") + (utc.includes("Z") ? "" : "Z"));
  if (Number.isNaN(t)) return utc.slice(0, 10);
  return new Date(t + 9 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, ". ") + ".";
}
