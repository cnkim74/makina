import "server-only";
import { site } from "@/data/site";
import { secretOf } from "./cf";
import { ytWatch } from "./youtube";

/*
 * 유튜브 채널 실적 — 블로그 AI 초안의 재료.
 * - 키가 없으면 채널 RSS(최근 영상 15개, 조회수·좋아요)만 읽는다.
 * - Workers 비밀 값 YOUTUBE_API_KEY 가 있으면 Data API 로 전체 영상·구독자·댓글까지 읽는다.
 */

export type YtVideo = {
  id: string;
  title: string;
  published: string; // ISO
  views: number;
  likes: number;
  comments: number | null; // RSS 에는 없다
  url: string;
};

export type YtStats = {
  source: "rss" | "api";
  channelId: string;
  channelTitle: string;
  subscribers: number | null;
  totalViews: number | null;
  videoCount: number | null;
  videos: YtVideo[]; // 조회수 많은 순
  comments: { video: string; text: string; likes: number }[]; // 키가 있을 때만, 인기 영상 댓글
  fetchedAt: string;
};

export type YtAngle = "top" | "scene" | "numbers" | "comments";

export const YT_ANGLES: { id: YtAngle; label: string; desc: string; needsKey?: boolean }[] = [
  { id: "top", label: "인기 영상 TOP 3", desc: "조회수 순위와 왜 많이 봤는지 쉽게 풀어 쓴 글" },
  { id: "scene", label: "1등 영상 장면 해설", desc: "가장 많이 본 영상을 장면별로 짚으며 베면서 부수는 원리를 설명" },
  { id: "numbers", label: "숫자로 본 우리 채널", desc: "조회수·좋아요 같은 실제 숫자를 재미있게 풀어 쓴 글" },
  { id: "comments", label: "댓글로 물어보신 것", desc: "영상 댓글 질문을 모아 묻고 답하기로 정리", needsKey: true },
];

const UA = { "User-Agent": "Mozilla/5.0 (compatible; makkina-site/1.0)", "Accept-Language": "ko-KR,ko;q=0.9" };

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
};
const attr = (xml: string, name: string, at: string) => {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*\\s${at}="([^"]*)"`));
  return m ? m[1] : "";
};

/** 채널 RSS (키 없이). 최근 영상 15개 */
async function fromRss(channelId: string): Promise<YtStats> {
  const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { headers: UA, signal: AbortSignal.timeout(8000) }).catch(() => {
    throw new Error("유튜브에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
  });
  if (!r.ok) throw new Error(`유튜브 채널 정보를 읽지 못했습니다(${r.status}). 잠시 뒤 다시 시도해 주세요.`);
  const xml = await r.text();
  const entries = xml.split("<entry>").slice(1);
  const videos: YtVideo[] = entries
    .map((e) => {
      const id = tag(e, "yt:videoId");
      return {
        id,
        title: tag(e, "title"),
        published: tag(e, "published"),
        views: Number(attr(e, "media:statistics", "views")) || 0,
        likes: Number(attr(e, "media:starRating", "count")) || 0,
        comments: null,
        url: ytWatch(id),
      };
    })
    .filter((v) => v.id);
  const head = xml.split("<entry>")[0];
  return {
    source: "rss",
    channelId,
    channelTitle: tag(head, "title") || site.name,
    subscribers: null,
    totalViews: null,
    videoCount: null,
    videos: videos.sort((a, b) => b.views - a.views),
    comments: [],
    fetchedAt: new Date().toISOString(),
  };
}

type ApiList<T> = { items?: T[]; nextPageToken?: string; error?: { message?: string } };

async function api<T>(path: string, key: string): Promise<ApiList<T>> {
  const r = await fetch(`https://www.googleapis.com/youtube/v3/${path}&key=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(8000) });
  const j = (await r.json()) as ApiList<T>;
  if (!r.ok) throw new Error(`유튜브 API 오류: ${j.error?.message ?? r.status}`);
  return j;
}

/** Data API (키 있음). 전체 영상(최대 100개)·구독자·인기 영상 댓글 */
async function fromApi(channelId: string, key: string): Promise<YtStats> {
  const ch = await api<{
    snippet: { title: string };
    statistics: { subscriberCount?: string; viewCount?: string; videoCount?: string; hiddenSubscriberCount?: boolean };
    contentDetails: { relatedPlaylists: { uploads: string } };
  }>(`channels?part=snippet,statistics,contentDetails&id=${channelId}`, key);
  const c = ch.items?.[0];
  if (!c) throw new Error("유튜브 채널을 찾지 못했습니다.");

  const ids: string[] = [];
  let page = "";
  for (let i = 0; i < 2; i++) {
    const pl = await api<{ contentDetails: { videoId: string } }>(
      `playlistItems?part=contentDetails&maxResults=50&playlistId=${c.contentDetails.relatedPlaylists.uploads}${page ? `&pageToken=${page}` : ""}`,
      key,
    );
    ids.push(...(pl.items ?? []).map((x) => x.contentDetails.videoId));
    if (!pl.nextPageToken) break;
    page = pl.nextPageToken;
  }

  const videos: YtVideo[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const vs = await api<{
      id: string;
      snippet: { title: string; publishedAt: string };
      statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
    }>(`videos?part=snippet,statistics&id=${ids.slice(i, i + 50).join(",")}`, key);
    for (const v of vs.items ?? []) {
      videos.push({
        id: v.id,
        title: v.snippet.title,
        published: v.snippet.publishedAt,
        views: Number(v.statistics.viewCount) || 0,
        likes: Number(v.statistics.likeCount) || 0,
        comments: Number(v.statistics.commentCount) || 0,
        url: ytWatch(v.id),
      });
    }
  }
  videos.sort((a, b) => b.views - a.views);

  // 댓글 많은 영상 3개에서 댓글 모으기 (댓글을 막은 영상은 건너뛴다)
  const comments: YtStats["comments"] = [];
  for (const v of [...videos].sort((a, b) => (b.comments ?? 0) - (a.comments ?? 0)).filter((v) => v.comments).slice(0, 3)) {
    try {
      const ct = await api<{ snippet: { topLevelComment: { snippet: { textOriginal: string; likeCount: number } } } }>(
        `commentThreads?part=snippet&order=relevance&maxResults=20&textFormat=plainText&videoId=${v.id}`,
        key,
      );
      for (const t of ct.items ?? []) {
        const s = t.snippet.topLevelComment.snippet;
        comments.push({ video: v.title, text: s.textOriginal.slice(0, 300), likes: s.likeCount });
      }
    } catch {
      /* 댓글 사용 안 함 */
    }
  }

  return {
    source: "api",
    channelId,
    channelTitle: c.snippet.title,
    subscribers: c.statistics.hiddenSubscriberCount ? null : Number(c.statistics.subscriberCount) || 0,
    totalViews: Number(c.statistics.viewCount) || 0,
    videoCount: Number(c.statistics.videoCount) || 0,
    videos,
    comments,
    fetchedAt: new Date().toISOString(),
  };
}

export async function hasYoutubeKey() {
  return !!(await secretOf("YOUTUBE_API_KEY"));
}

export async function channelStats(): Promise<YtStats> {
  const key = await secretOf("YOUTUBE_API_KEY");
  if (key) {
    try {
      return await fromApi(site.youtubeChannelId, key);
    } catch (e) {
      // 키가 틀렸거나 할당량을 넘었으면 RSS 로라도 쓴다
      const rss = await fromRss(site.youtubeChannelId);
      console.warn("youtube api failed, using rss:", e instanceof Error ? e.message : e);
      return rss;
    }
  }
  return fromRss(site.youtubeChannelId);
}

const n = (x: number) => x.toLocaleString("ko-KR");
const day = (iso: string) => iso.slice(0, 10);

/** AI 에게 줄 실적 표 (실제 숫자) */
export function statsFacts(st: YtStats): string {
  const lines = [
    `[유튜브 채널 실적 — ${day(st.fetchedAt)} 기준 실제 숫자] 채널 "${st.channelTitle}" (https://www.youtube.com/channel/${st.channelId})`,
    st.source === "rss" ? `· 범위: 최근 올린 영상 ${st.videos.length}개만 (채널 전체 아님)` : `· 범위: 채널 전체 영상 ${st.videos.length}개`,
  ];
  if (st.subscribers != null) lines.push(`· 구독자 ${n(st.subscribers)}명`);
  if (st.totalViews != null) lines.push(`· 채널 누적 조회수 ${n(st.totalViews)}회, 영상 ${n(st.videoCount ?? 0)}개`);
  const sum = st.videos.reduce((s, v) => s + v.views, 0);
  lines.push(`· 아래 영상 조회수 합계 ${n(sum)}회, 좋아요 합계 ${n(st.videos.reduce((s, v) => s + v.likes, 0))}개`);
  lines.push("· 영상 (조회수 많은 순):");
  st.videos.slice(0, 15).forEach((v, i) => {
    lines.push(
      `  ${i + 1}. "${v.title}" — 조회 ${n(v.views)}회, 좋아요 ${n(v.likes)}${v.comments != null ? `, 댓글 ${n(v.comments)}` : ""}, 올린 날 ${day(v.published)}, ${v.url}`,
    );
  });
  if (st.comments.length) {
    lines.push("· 시청자 댓글 (원문, 개인 이름은 쓰지 말 것):");
    st.comments.slice(0, 40).forEach((c) => lines.push(`  - [${c.video}] ${c.text.replace(/\s+/g, " ")}`));
  }
  return lines.join("\n");
}

/** 각도별 이번 글 주제 */
export function angleTopic(angle: YtAngle, st: YtStats): string {
  const top = st.videos[0];
  const common = `유튜브 채널 실적을 바탕으로, 농가가 읽으면서 피식 웃을 만큼 재미있고 친근하게 씁니다. 숫자는 위 [유튜브 채널 실적]의 실제 값만 쓰고(반올림은 "약"을 붙여서), 없는 숫자·순위·시청자 반응은 지어내지 마세요. 시청자 고맙다는 인사를 한 번 넣고, 채널 구독 링크를 본문에 한 번 넣으세요.`;
  switch (angle) {
    case "top":
      return `「${site.name} 유튜브 인기 영상 TOP 3」 — 조회수 1~3위 영상을 순위 발표처럼 소개합니다. 각 영상마다 "## 3위 …" 식 소제목, 조회수, 무엇을 볼 수 있는 영상인지(제목에 나온 모델·작물·지역만), 왜 농가가 많이 봤을지 짐작(짐작임을 드러내서), 영상 링크. ${common}`;
    case "scene":
      return `가장 많이 본 영상 "${top?.title ?? ""}"을 같이 보며 해설하는 글. 영상 제목에 나온 모델·작물·지역과 회사 자료의 작동 원리(벤다 → 부순다 → 펼친다)를 엮어 "이 장면에서는 이런 일이 일어납니다" 식으로 풉니다. 영상에 실제로 무엇이 나오는지는 제목 말고는 모르니, 장면을 단정하지 말고 "영상에서 확인해 보세요"처럼 쓰세요. ${common}`;
    case "numbers":
      return `「숫자로 본 ${site.name} 유튜브」 — 조회수 합계, 1등 영상, 좋아요 수 같은 숫자를 농가에 익숙한 것에 빗대어(예: 마을 잔치 손님, 곤포 사일리지 수) 재미있게 풀어 쓴 글. 빗댈 때 계산은 간단하고 정확하게, 비유임을 분명히. ${st.source === "rss" ? "범위가 최근 영상뿐이라는 점을 한 줄로 밝힙니다. " : ""}${common}`;
    case "comments":
      return `「댓글로 물어보신 것, 답해 드립니다」 — 위 시청자 댓글 가운데 질문·궁금증을 골라 묻고 답하기 형식으로 씁니다. 댓글 단 사람 이름은 쓰지 말고 질문은 다듬어 옮기세요. 답은 회사 자료에 있는 사실로만, 모르는 것은 "전화로 안내해 드립니다". 질문 댓글이 거의 없으면 많이 본 영상 위주로 "많이들 궁금해하시는 것" 형식으로 바꿉니다. ${common}`;
  }
}
