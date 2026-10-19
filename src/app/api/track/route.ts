import { clean, readyDb, run } from "@/lib/db";

const TYPES = new Set(["page_view", "call_click", "kakao_click", "inquiry_submit", "video_play", "cta_click"]);

/** 자체 분석 이벤트 기록. 개인정보는 받지 않는다 (종류·라벨·경로만) */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const type = clean(body.type, 30);
    const path = clean(body.path, 120);
    if (!TYPES.has(type) || path.startsWith("/admin")) return new Response(null, { status: 204 });
    const db = await readyDb();
    if (db) await run(db, "INSERT INTO events (type, label, path) VALUES (?, ?, ?)", type, clean(body.label, 80), path);
  } catch {
    /* 무시 */
  }
  return new Response(null, { status: 204 });
}
