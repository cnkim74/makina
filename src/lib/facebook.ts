import "server-only";
import { secretOf } from "./cf";
import type { D1Database } from "./cf";
import { getSetting, setSetting } from "./settings";
import { open, seal } from "./secret";

/*
 * 페이스북 페이지 게시 (cnbizpartners.com 과 같은 방식).
 * 관리자 → "SNS 연결"에서 앱 ID 를 넣고 [페이스북 연결] → 로그인·권한 → 돌아오면 장기 토큰으로 바꿔
 * 관리하는 페이지 하나를 고른다. 페이지 토큰은 만료되지 않으며, 암호화해 settings.social 에 둔다.
 */
export const FB_GRAPH = "https://graph.facebook.com/v23.0";
export const FB_SCOPES = ["pages_show_list", "pages_manage_posts", "pages_read_engagement"].join(",");
export const fbRedirect = (origin: string) => `${origin}/api/admin/facebook/callback`;

type GraphError = { error?: { message?: string } };

async function graph<T>(url: string, params: Record<string, string>, method: "GET" | "POST" = "GET"): Promise<T> {
  const u = new URL(url);
  const init: RequestInit = { method, signal: AbortSignal.timeout(15000) };
  if (method === "GET") Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  else init.body = new URLSearchParams(params);
  const r = await fetch(u, init);
  const j = (await r.json()) as T & GraphError;
  if (!r.ok || j.error) throw new Error(j.error?.message || `페이스북 응답 ${r.status}`);
  return j;
}

export type FbPage = { id: string; name: string; access_token: string };

/** OAuth 코드 → 단기 토큰 → 장기 사용자 토큰 → 페이지 목록 */
export async function pagesFromCode(db: D1Database, code: string, origin: string): Promise<FbPage[]> {
  const social = await getSetting(db, "social");
  const appSecret = await secretOf("FB_APP_SECRET");
  if (!social.fbAppId || !appSecret) throw new Error("페이스북 앱 ID 와 앱 시크릿(FB_APP_SECRET)이 필요합니다.");
  const short = await graph<{ access_token: string }>(`${FB_GRAPH}/oauth/access_token`, {
    client_id: social.fbAppId,
    client_secret: appSecret,
    redirect_uri: fbRedirect(origin),
    code,
  });
  const long = await graph<{ access_token: string }>(`${FB_GRAPH}/oauth/access_token`, {
    grant_type: "fb_exchange_token",
    client_id: social.fbAppId,
    client_secret: appSecret,
    fb_exchange_token: short.access_token,
  });
  const res = await graph<{ data: FbPage[] }>(`${FB_GRAPH}/me/accounts`, {
    fields: "id,name,access_token",
    limit: "100",
    access_token: long.access_token,
  });
  return res.data ?? [];
}

/** 페이지가 여럿이면 고를 때까지 암호화해 담아 둔다 */
export async function holdPages(db: D1Database, pages: FbPage[]) {
  const social = await getSetting(db, "social");
  await setSetting(db, "social", { ...social, fbPending: await seal(JSON.stringify(pages), await secretOf("FB_APP_SECRET")) });
}

export async function pendingPages(db: D1Database): Promise<FbPage[]> {
  const social = await getSetting(db, "social");
  if (!social.fbPending) return [];
  const raw = await open(social.fbPending, await secretOf("FB_APP_SECRET"));
  try {
    return raw ? (JSON.parse(raw) as FbPage[]) : [];
  } catch {
    return [];
  }
}

export async function savePage(db: D1Database, page: FbPage) {
  const appSecret = await secretOf("FB_APP_SECRET");
  const social = await getSetting(db, "social");
  await setSetting(db, "social", {
    ...social,
    fbPageId: page.id,
    fbPageName: page.name,
    fbPageToken: await seal(page.access_token, appSecret),
    fbConnectedAt: new Date().toISOString(),
    fbPending: "",
  });
}

/** 페이지에 링크 게시 — 페이스북이 글 주소의 미리보기(제목·요약·표지)를 붙인다 */
export async function postLinkToPage(db: D1Database, message: string, link: string): Promise<{ id: string; permalink: string }> {
  const social = await getSetting(db, "social");
  const token = social.fbPageToken ? await open(social.fbPageToken, await secretOf("FB_APP_SECRET")) : null;
  if (!social.fbPageId || !token) throw new Error("페이스북 페이지가 연결되지 않았습니다. SNS 연결에서 다시 연결해 주세요.");
  const r = await graph<{ id: string }>(`${FB_GRAPH}/${social.fbPageId}/feed`, { message, link, access_token: token }, "POST");
  let permalink = "";
  try {
    const m = await graph<{ permalink_url?: string }>(`${FB_GRAPH}/${r.id}`, { fields: "permalink_url", access_token: token });
    permalink = m.permalink_url ?? "";
  } catch {
    /* 링크를 못 받아도 게시는 됐다 */
  }
  return { id: r.id, permalink };
}
