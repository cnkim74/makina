import { getCloudflareContext } from "@opennextjs/cloudflare";
import { clean, first, readyDb, run } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { INQUIRY_CATEGORIES } from "@/lib/types";

/** 홈페이지 "문의 남기기" 접수 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "보낸 내용을 읽지 못했습니다. 다시 시도해 주세요." }, { status: 400 });
  }

  // 사람에게는 보이지 않는 칸 — 채워져 있으면 자동 등록 프로그램
  if (clean(body.company)) return Response.json({ ok: true });

  const name = clean(body.name, 40);
  const phone = clean(body.phone, 30);
  const email = clean(body.email, 120);
  const category = clean(body.category, 30);
  const message = clean(body.message, 2000);

  if (!name || !phone || !message) {
    return Response.json({ error: "이름, 연락처, 문의 내용을 적어 주세요." }, { status: 400 });
  }
  if (!/^[0-9+\-\s()]{8,}$/.test(phone)) {
    return Response.json({ error: "연락처를 숫자로 적어 주세요. 예: 010-1234-5678" }, { status: 400 });
  }
  if (!body.agree) {
    return Response.json({ error: "개인정보 수집·이용에 동의해 주세요." }, { status: 400 });
  }
  const cat = (INQUIRY_CATEGORIES as readonly string[]).includes(category) ? category : "기타";

  const db = await readyDb();
  if (!db) {
    return Response.json(
      { error: "온라인 접수를 준비하고 있습니다. 전화로 연락 주시면 바로 도와드리겠습니다." },
      { status: 503 },
    );
  }

  // 같은 곳에서 10분에 3건까지
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "local";
  const day = new Date().toISOString().slice(0, 10);
  const clientKey = await hash(`${ip}|${day}`);
  const recent = await first<{ n: number }>(
    db,
    "SELECT COUNT(*) AS n FROM inquiries WHERE client_key = ? AND created_at > datetime('now', '-10 minutes')",
    clientKey,
  );
  if ((recent?.n ?? 0) >= 3) {
    return Response.json({ error: "잠시 후 다시 보내 주세요. 급하시면 전화 주세요." }, { status: 429 });
  }

  await run(
    db,
    "INSERT INTO inquiries (name, phone, email, category, message, client_key) VALUES (?, ?, ?, ?, ?, ?)",
    name,
    phone,
    email,
    cat,
    message,
    clientKey,
  );

  // 알림 웹훅 (응답을 기다리지 않는다)
  const { inquiryWebhook } = await getSetting(db, "integrations");
  if (inquiryWebhook) {
    const notify = sendWebhook(inquiryWebhook, { name, phone, category: cat, message });
    try {
      const { ctx } = await getCloudflareContext({ async: true });
      ctx.waitUntil(notify);
    } catch {
      await notify;
    }
  }

  return Response.json({ ok: true });
}

async function hash(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return btoa(String.fromCharCode(...new Uint8Array(d))).slice(0, 32);
}

async function sendWebhook(url: string, q: { name: string; phone: string; category: string; message: string }) {
  const text = `[성원마끼나] 새 문의 · ${q.category}\n${q.name} (${q.phone})\n${q.message.slice(0, 300)}`;
  const payload = url.includes("hooks.slack.com")
    ? { text }
    : url.includes("discord.com/api/webhooks")
      ? { content: text }
      : { type: "inquiry", ...q, text };
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* 알림 실패는 접수에 영향을 주지 않는다 */
  }
}
