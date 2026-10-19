/** 유튜브 주소에서 영상 ID 꺼내기 (watch, youtu.be, shorts, embed, live, ID 그대로) */
export function youtubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1, 12) || null;
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/\/(shorts|embed|live|v)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {
    /* 주소가 아님 */
  }
  return null;
}

export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const ytWatch = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const ytEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;

/** 영상 제목 가져오기 (API 키 없이 oEmbed). 실패하면 null */
export async function youtubeTitle(id: string): Promise<string | null> {
  try {
    const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(ytWatch(id))}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { title?: string };
    return j.title ?? null;
  } catch {
    return null;
  }
}
