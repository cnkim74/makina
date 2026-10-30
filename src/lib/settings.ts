import "server-only";
import { heroStory, heroVideo as defaultHeroVideo } from "@/data/content";
import { site as staticSite } from "@/data/site";
import type { D1Database } from "./cf";
import { first, run } from "./db";
import type { PriceItem } from "./biz";
import { LANDING_SECTIONS, type ContactSettings, type HeroSettings, type IntegrationSettings, type LandingSettings } from "./types";

/* 설정은 settings 테이블에 그룹별 JSON 으로 저장한다: contact / integrations / hero / landing / pricebook */

export const DEFAULT_CONTACT: ContactSettings = {
  phone: staticSite.phone,
  phone2: staticSite.phone2,
  hours: staticSite.hours,
  address: staticSite.address,
  fax: staticSite.fax,
  ceo: staticSite.ceo,
  bizNo: staticSite.bizNo,
  kakaoUrl: staticSite.kakaoHref === "#" ? "" : staticSite.kakaoHref,
  mapUrl: staticSite.mapHref === "#" ? "" : staticSite.mapHref,
};

export const DEFAULT_INTEGRATIONS: IntegrationSettings = {
  gaId: "",
  channelTalkKey: "",
  inquiryWebhook: "",
  gaPropertyId: "",
};

export const DEFAULT_LANDING: LandingSettings = {
  sections: LANDING_SECTIONS.map((s) => ({ id: s.id, visible: true })),
};

export const DEFAULT_PRICEBOOK: { items: PriceItem[] } = { items: [] };

export const DEFAULT_HERO: HeroSettings = {
  rev: "2026-10-28",
  mode: defaultHeroVideo ? "video" : "sketch",
  video: defaultHeroVideo ?? {
    desktop: { mp4: "/videos/hero-dragon-1600.mp4", webm: "/videos/hero-dragon-1600.webm" },
    mobile: { mp4: "/videos/hero-dragon-960.mp4", webm: "/videos/hero-dragon-960.webm" },
    poster: "/images/hero/hero-dragon-poster.webp",
    still: "/images/hero/hero-dragon-still.webp",
    end: 0.9,
  },
  story: heroStory,
  tagline: staticSite.tagline,
  slogan: staticSite.slogan,
};

type Groups = {
  contact: ContactSettings;
  integrations: IntegrationSettings;
  hero: HeroSettings;
  landing: LandingSettings;
  pricebook: { items: PriceItem[] };
};

const DEFAULTS: Groups = {
  contact: DEFAULT_CONTACT,
  integrations: DEFAULT_INTEGRATIONS,
  hero: DEFAULT_HERO,
  landing: DEFAULT_LANDING,
  pricebook: DEFAULT_PRICEBOOK,
};

/** 저장된 섹션 목록에 새로 생긴 섹션을 뒤에 붙이고, 없어진 섹션은 뺀다 */
function normalizeLanding(v: LandingSettings): LandingSettings {
  const known = new Set<string>(LANDING_SECTIONS.map((s) => s.id));
  const seen = new Set<string>();
  const sections = (Array.isArray(v.sections) ? v.sections : []).filter((s) => known.has(s.id) && !seen.has(s.id) && seen.add(s.id));
  for (const s of LANDING_SECTIONS) if (!seen.has(s.id)) sections.push({ id: s.id, visible: true });
  return { ...v, sections };
}

export async function getSetting<K extends keyof Groups>(db: D1Database | null, key: K): Promise<Groups[K]> {
  if (!db) return DEFAULTS[key];
  try {
    const row = await first<{ value: string }>(db, "SELECT value FROM settings WHERE key = ?", key);
    if (!row) return DEFAULTS[key];
    const parsed = JSON.parse(row.value) as Partial<Groups[K]>;
    // 히어로는 기본값 판(rev)이 바뀌면 예전에 저장한 영상·캡션·슬로건 대신 새 기본값을 쓴다. 관리자에서 다시 저장하면 그 값이 이긴다
    if (key === "hero" && (parsed as Partial<HeroSettings>).rev !== DEFAULT_HERO.rev) return DEFAULTS[key];
    const merged = { ...DEFAULTS[key], ...parsed } as Groups[K];
    return key === "landing" ? (normalizeLanding(merged as LandingSettings) as Groups[K]) : merged;
  } catch {
    return DEFAULTS[key];
  }
}

export async function setSetting<K extends keyof Groups>(db: D1Database, key: K, value: Groups[K]) {
  await run(
    db,
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    key,
    JSON.stringify(value),
  );
}
