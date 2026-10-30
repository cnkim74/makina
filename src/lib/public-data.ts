import "server-only";
import { videos as staticVideos, type Video } from "@/data/content";
import { mapEmbedSrc, site as staticSite } from "@/data/site";
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

  const [contact, integrations, hero, landing] = await Promise.all([
    getSetting(db, "contact"),
    getSetting(db, "integrations"),
    getSetting(db, "hero"),
    getSetting(db, "landing"),
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

  // SNS 를 하나도 등록하지 않았으면 회사 유튜브 채널을 기본으로 보여 준다
  if (!sns.length) sns = [{ id: 0, platform: "youtube", label: "성원마끼나 유튜브", url: staticSite.youtubeHref }];
  const youtube = sns.find((s) => s.platform === "youtube");
  // 주소를 관리자에서 바꿨으면 지도·길찾기도 새 주소로 검색한다. 그대로면 카카오맵에 등록된 공장으로 바로 간다
  const sameAddress = contact.address === staticSite.address;
  const searchAddress = contact.address.replace(/\s*\(.*?\)\s*/g, " ").trim();

  return {
    site: {
      ...staticSite,
      tagline: hero.tagline || staticSite.tagline,
      slogan: hero.slogan || staticSite.slogan,
      phone: contact.phone,
      phoneHref: telHref(contact.phone),
      phone2: contact.phone2,
      phone2Href: contact.phone2 ? telHref(contact.phone2) : "",
      hours: contact.hours,
      address: contact.address,
      fax: contact.fax,
      ceo: contact.ceo,
      bizNo: contact.bizNo,
      kakaoHref: contact.kakaoUrl || "#inquiry",
      // 예전 기본값(카카오맵 주소 검색 링크)이 저장돼 있으면 등록된 공장 페이지로 바꿔 보여 준다
      mapHref:
        contact.mapUrl && !(sameAddress && contact.mapUrl.startsWith("https://map.kakao.com/link/search/"))
          ? contact.mapUrl
          : staticSite.mapHref,
      routeHref: sameAddress
        ? staticSite.routeHref
        : "https://map.kakao.com/link/search/" + encodeURIComponent(searchAddress),
      naverMapHref: sameAddress
        ? staticSite.naverMapHref
        : "https://map.naver.com/p/search/" + encodeURIComponent(searchAddress),
      mapEmbed: sameAddress ? staticSite.mapEmbed : mapEmbedSrc(contact.address),
      youtubeHref: youtube?.url ?? staticSite.youtubeHref,
    },
    hero: { video: hero.mode === "video" ? hero.video : null, story: hero.story },
    videos,
    sns,
    integrations: { gaId: integrations.gaId, channelTalkKey: integrations.channelTalkKey },
    landing,
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
