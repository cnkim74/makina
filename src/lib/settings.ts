import "server-only";
import { heroStory, heroVideo as defaultHeroVideo } from "@/data/content";
import { site as staticSite } from "@/data/site";
import type { D1Database } from "./cf";
import { first, run } from "./db";
import type { ContactSettings, HeroSettings, IntegrationSettings } from "./types";

/* 설정은 settings 테이블에 그룹별 JSON 으로 저장한다: contact / integrations / hero */

export const DEFAULT_CONTACT: ContactSettings = {
  phone: staticSite.phone,
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
};

export const DEFAULT_HERO: HeroSettings = {
  mode: defaultHeroVideo ? "video" : "sketch",
  video: defaultHeroVideo ?? {
    desktop: { mp4: "/videos/hero-1600.mp4", webm: "/videos/hero-1600.webm" },
    mobile: { mp4: "/videos/hero-960.mp4", webm: "/videos/hero-960.webm" },
    poster: "/images/hero/hero-poster.webp",
    still: "/images/hero/hero-still.webp",
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
};

const DEFAULTS: Groups = {
  contact: DEFAULT_CONTACT,
  integrations: DEFAULT_INTEGRATIONS,
  hero: DEFAULT_HERO,
};

export async function getSetting<K extends keyof Groups>(db: D1Database | null, key: K): Promise<Groups[K]> {
  if (!db) return DEFAULTS[key];
  try {
    const row = await first<{ value: string }>(db, "SELECT value FROM settings WHERE key = ?", key);
    if (!row) return DEFAULTS[key];
    const parsed = JSON.parse(row.value) as Partial<Groups[K]>;
    return { ...DEFAULTS[key], ...parsed };
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
