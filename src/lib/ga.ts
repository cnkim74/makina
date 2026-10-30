import "server-only";
import { getEnv } from "./cf";

/*
 * GA4 Data API 로 관리자 "접속 정보" 화면에 보고서를 가져온다.
 * 서비스 계정 키(GA_SA_EMAIL, GA_SA_KEY)는 Workers 비밀 값에서만 읽는다. 속성 ID 는 설정(integrations.gaPropertyId).
 */

export type GaRow = { name: string; v: number };
export type GaReport =
  | {
      ok: true;
      daily: { day: string; users: number; sessions: number; views: number }[];
      totals: { users: number; newUsers: number; sessions: number; views: number; avgSec: number };
      pages: GaRow[];
      channels: GaRow[];
      devices: GaRow[];
      cities: GaRow[];
    }
  | { ok: false; reason: "no-property" | "no-secret" | "error"; detail?: string };

const enc = new TextEncoder();
const b64url = (b: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof b === "string" ? enc.encode(b) : b instanceof Uint8Array ? b : new Uint8Array(b);
  let s = "";
  for (const x of bytes) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

let cached: { token: string; exp: number } | null = null;

async function accessToken(email: string, keyPem: string) {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp - 60 > now) return cached.token;
  const body = keyPem.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const sig = b64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(`${head}.${claim}`)));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claim}.${sig}` }),
  });
  const j = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string; error?: string };
  if (!j.access_token) throw new Error(j.error_description || j.error || `token ${res.status}`);
  cached = { token: j.access_token, exp: now + (j.expires_in ?? 3600) };
  return j.access_token;
}

type ApiReport = { rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[] };

export async function gaReport(propertyId: string, days = 28): Promise<GaReport> {
  if (!propertyId) return { ok: false, reason: "no-property" };
  const env = await getEnv();
  const email = env?.GA_SA_EMAIL || process.env.GA_SA_EMAIL || "";
  const key = env?.GA_SA_KEY || process.env.GA_SA_KEY || "";
  if (!email || !key) return { ok: false, reason: "no-secret" };
  try {
    const token = await accessToken(email, key);
    const dateRanges = [{ startDate: `${days - 1}daysAgo`, endDate: "today" }];
    const top = (dim: string, metric: string, limit: number) => ({
      dateRanges,
      dimensions: [{ name: dim }],
      metrics: [{ name: metric }],
      orderBys: [{ metric: { metricName: metric }, desc: true }],
      limit,
    });
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            dateRanges,
            dimensions: [{ name: "date" }],
            metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }, { name: "newUsers" }, { name: "userEngagementDuration" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
          },
          top("pagePath", "screenPageViews", 10),
          top("sessionDefaultChannelGroup", "sessions", 8),
          top("deviceCategory", "activeUsers", 4),
          top("city", "activeUsers", 8),
        ],
      }),
    });
    const j = (await res.json()) as { reports?: ApiReport[]; error?: { message?: string } };
    if (!res.ok || !j.reports) return { ok: false, reason: "error", detail: j.error?.message || `GA ${res.status}` };
    const [d, p, c, dv, ci] = j.reports;
    const n = (r: { metricValues?: { value: string }[] }, i: number) => Number(r.metricValues?.[i]?.value ?? 0);
    const dim = (r: { dimensionValues?: { value: string }[] }) => r.dimensionValues?.[0]?.value ?? "";
    const daily = (d.rows ?? []).map((r) => {
      const v = dim(r);
      return { day: `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`, users: n(r, 0), sessions: n(r, 1), views: n(r, 2) };
    });
    const sum = (i: number) => (d.rows ?? []).reduce((s, r) => s + n(r, i), 0);
    const users = sum(0);
    const rows = (rep: ApiReport) => (rep.rows ?? []).map((r) => ({ name: dim(r) || "(없음)", v: n(r, 0) }));
    return {
      ok: true,
      daily,
      // 날짜별 활성 사용자를 더한 값이라 같은 사람이 여러 날 오면 여러 번 셈 (GA 화면의 "사용자"보다 클 수 있음)
      totals: { users, newUsers: sum(3), sessions: sum(1), views: sum(2), avgSec: users ? sum(4) / users : 0 },
      pages: rows(p),
      channels: rows(c),
      devices: rows(dv),
      cities: rows(ci),
    };
  } catch (e) {
    return { ok: false, reason: "error", detail: e instanceof Error ? e.message : String(e) };
  }
}
