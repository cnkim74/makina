import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { dragon, otherMachines, products } from "@/data/content";
import { site } from "@/data/site";
import { secretOf } from "./cf";
import type { BlogSettings } from "./types";
import { COVER_TEMPLATES, cleanSlug, type BlogCover, type BlogFaq } from "./blog";

/*
 * 블로그 AI 초안 (Claude API) — cnbizpartners.com 블로그 자동 작성과 같은 규칙.
 * 키는 Workers 비밀 값 ANTHROPIC_API_KEY. 결과는 JSON 스키마로 받아 관리자가 고친 뒤 발행한다.
 */

const MODEL = "claude-opus-5-5";

export type BlogDraft = {
  title: string;
  slug: string;
  keyword: string;
  summary: string;
  body: string;
  tags: string[];
  faq: BlogFaq[];
  cover: Pick<BlogCover, "template" | "eyebrow">;
  facebook: string;
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "slug", "keyword", "summary", "body", "tags", "faq", "cover", "facebook"],
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    keyword: { type: "string" },
    summary: { type: "string" },
    body: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    faq: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["q", "a"],
        properties: { q: { type: "string" }, a: { type: "string" } },
      },
    },
    cover: {
      type: "object",
      additionalProperties: false,
      required: ["template", "eyebrow"],
      properties: {
        template: { type: "string", enum: COVER_TEMPLATES.filter((t) => t.id !== "photo").map((t) => t.id) },
        eyebrow: { type: "string" },
      },
    },
    facebook: { type: "string" },
  },
} as const;

/** 회사·제품 사실 — 글에는 이 안의 사실만 쓴다 */
function companyFacts() {
  const lineup = products
    .map((p) => {
      const s = (p as { specs?: Record<string, string> }).specs ?? {};
      return `- ${p.name}: ${Object.entries(s)
        .map(([k, v]) => `${{ width: "작업 폭", hp: "적용 마력", blades: "칼날", weight: "무게", pto: "PTO" }[k] ?? k} ${v}`)
        .join(", ")}`;
    })
    .join("\n");
  return `[회사] ${site.name}(${site.nameEn}) — ${site.address}. 전화 ${site.phone}. "${site.tagline}". 조사료 작업기를 직접 만들고 고치는 제조사.
[주력 제품] ${dragon.name} ${dragon.label} — ${dragon.kmower}. ${dragon.range}. "${dragon.catch}" ${dragon.copy}
[작동·효과] ${dragon.story.map((s) => `${s.step}: ${s.copy}`).join(" ")}
[제품 특징] ${dragon.features.map((f) => `${f.name}: ${f.copy}`).join(" / ")}
[그 밖의 효과] ${dragon.more.join(" ")}
[라인업 사양]
${lineup}
[다른 작업기] ${otherMachines.map((m) => `${m.name}(${m.label})`).join(", ")}`;
}

function system(settings: BlogSettings) {
  return `당신은 한국 농업·축산 분야 검색(네이버·구글) 유입을 잘 아는 콘텐츠 마케터입니다. ${site.name} 홈페이지 블로그 글을 씁니다.
독자는 한우·낙농 농가와 조사료 작업을 하는 농민입니다. 나이가 많은 분이 많으니 쉬운 말로, 짧은 문장으로 씁니다.

[글 규칙]
- keyword: 농민이 실제로 검색할 핵심 키워드 1개(예: "수단그라스 수확 시기", "모우어 컨디셔너").
- title: 키워드를 앞쪽에 넣은 40자 이내 제목. 과장·낚시 금지.
- slug: 영문 소문자와 하이픈만, 5단어 이내(예: sudangrass-harvest-guide).
- summary: 검색 결과에 보일 100~140자 요약.
- 말투: 정중한 존댓말("~합니다" 기본, "~해요" 조금). 반말·음슴체 금지. 회사는 "저희" 또는 "${site.name}".
- body: 마크다운. 1,500~2,200자. 도입(농가의 고민 공감) → "## 소제목" 4~5개 → "## 마무리". 필요하면 목록·간단한 표.
  · 위 [회사]~[다른 작업기]에 없는 사양·수치·실적·고객 사례는 지어내지 말 것. 모르는 것은 "전화로 안내해 드립니다"로.
  · 가격·할인·금액 숫자는 절대 쓰지 말 것. 다른 회사·수입 제품 이름도 쓰지 말 것.
  · 마무리에서 2~3문장으로 정리하고, 상담이 필요하면 [전화 상담 ${site.phone}](tel:${site.phone.replace(/-/g, "")}) 또는 [문의 남기기](/#inquiry) 링크 1개.
  · 관련 있으면 [DRAGON 라인업](/#products) 링크를 본문에 1개까지.
  · HTML·이미지 문법·H1(#) 금지.
- tags: 관련 키워드 5개(# 없이).
- faq: 독자가 이어서 궁금해할 질문 3개와 2~3문장 답.
- cover.template: soil(차분한 정보형) | cream(체크리스트·가이드형) | gold(홍보·신제품형) | keyword(검색 키워드 강조형). cover.eyebrow: 제목 위 라벨 10자 이내(예: GUIDE, 수확 가이드).
- facebook: 페이스북 페이지에 링크와 함께 올릴 소개 글 200자 이내. 존댓말, 첫 줄에 관심을 끄는 질문이나 핵심, 해시태그 2~3개는 맨 끝에.
${settings.guide.trim() ? `\n[추가 지시]\n${settings.guide.trim()}` : ""}`;
}

export async function hasAiKey() {
  return !!(await secretOf("ANTHROPIC_API_KEY"));
}

export async function writeDraft(input: { topic: string; recentTitles: string[]; settings: BlogSettings; video?: string }): Promise<BlogDraft> {
  const apiKey = await secretOf("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("AI 키(ANTHROPIC_API_KEY)가 아직 없습니다. 관리자 → 블로그 → AI·SNS 설정의 안내대로 넣어 주세요.");
  const client = new Anthropic({ apiKey });

  const recent = input.recentTitles.length ? `\n\n[이미 쓴 글 — 주제가 겹치지 않게]\n${input.recentTitles.map((t) => `- ${t}`).join("\n")}` : "";
  const topic =
    input.topic.trim() ||
    `아래 주제 방향 중 하나를 골라, 농가가 많이 검색할 만한 구체적인 주제로 쓰세요.\n${input.settings.topics}`;
  const video = input.video ? `\n\n[함께 붙일 유튜브 영상] "${input.video}" — 본문에서 "아래 영상"처럼 한 번 자연스럽게 언급해도 됩니다.` : "";

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    system: system(input.settings),
    messages: [{ role: "user", content: `${companyFacts()}${recent}\n\n[이번 글 주제]\n${topic}${video}` }],
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === "refusal") throw new Error("AI 가 이 주제로는 글을 쓰지 않았습니다. 주제를 바꿔 다시 시도해 주세요.");
  if (msg.stop_reason === "max_tokens") throw new Error("글이 너무 길어져 중간에 끊겼습니다. 다시 시도해 주세요.");
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  let d: BlogDraft;
  try {
    d = JSON.parse(text) as BlogDraft;
  } catch {
    throw new Error("AI 응답을 읽지 못했습니다. 다시 시도해 주세요.");
  }
  if (!d.title || !d.body) throw new Error("AI 초안이 비어 있습니다. 다시 시도해 주세요.");
  return {
    ...d,
    slug: cleanSlug(d.slug),
    body: d.body.replace(/^#\s.+\n/, "").trim(),
    tags: d.tags.map((t) => t.replace(/^#/, "").trim()).filter(Boolean).slice(0, 8),
    faq: d.faq.filter((f) => f.q && f.a).slice(0, 5),
  };
}
