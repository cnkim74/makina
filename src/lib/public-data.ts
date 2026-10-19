import "server-only";
import { videos as staticVideos, type Video } from "@/data/content";
import { site as staticSite } from "@/data/site";
import { all, readyDb } from "./db";
import { getSetting } from "./settings";
import { telHref, type PublicData, type SnsLink, type SnsPlatform } from "./types";

const TONES = ["#7c7a52", "#5f6a44", "#8a7d5a", "#6b6a43", "#5f6670"];

type VideoRow = {
  id: number;
  youtube_id: string;
  title: string;
  caption: string;
  kind: string;
  tags: string;
  published_on: string;
};

/**
 * 공개 홈페이지에 필요한 데이터.
 * DB 가 연결되어 있으면 관리자 화면에서 고친 값을, 아니면 src/data 의 기본값을 쓴다.
 * DB 에 문제가 있어도 사이트는 기본값으로 그대로 뜬다.
 */
export async function getPublicData(): Promise<PublicData> {
  const db = await readyDb();

  const [contact, integrations, hero] = await Promise.all([
    getSetting(db, "contact"),
    getSetting(db, "integrations"),
    getSetting(db, "hero"),
  ]);

  let videos: Video[] = staticVideos;
  let sns: SnsLink[] = [];

  if (db) {
    try {
      const rows = await all<VideoRow>(
        db,
        "SELECT id, youtube_id, title, caption, kind, tags, published_on FROM videos WHERE visible = 1 ORDER BY sort ASC, published_on DESC, id DESC LIMIT 24",
      );
      if (rows.length) {
        videos = rows.map((r, i) => ({
          id: `yt-${r.id}`,
          youtubeId: r.youtube_id,
          title: r.title,
          caption: r.caption || r.title,
          kind: r.kind,
          tags: safeTags(r.tags),
          date: r.published_on.replaceAll("-", "."),
          tone: TONES[i % TONES.length],
        }));
      }
      sns = await all<{ id: number; platform: SnsPlatform; label: string; url: string }>(
        db,
        "SELECT id, platform, label, url FROM sns_links WHERE visible = 1 ORDER BY sort ASC, id ASC",
      );
    } catch {
      /* 표가 비었거나 문제가 있으면 기본값 */
    }
  }

  const youtube = sns.find((s) => s.platform === "youtube");

  return {
    site: {
      ...staticSite,
      tagline: hero.tagline || staticSite.tagline,
      slogan: hero.slogan || staticSite.slogan,
      phone: contact.phone,
      phoneHref: telHref(contact.phone),
      hours: contact.hours,
      address: contact.address,
      fax: contact.fax,
      ceo: contact.ceo,
      bizNo: contact.bizNo,
      kakaoHref: contact.kakaoUrl || "#inquiry",
      mapHref: contact.mapUrl || staticSite.mapHref,
      youtubeHref: youtube?.url ?? "#videos",
    },
    hero: { video: hero.mode === "video" ? hero.video : null, story: hero.story },
    videos,
    sns,
    integrations: { gaId: integrations.gaId, channelTalkKey: integrations.channelTalkKey },
  };
}

function safeTags(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
