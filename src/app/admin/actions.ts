"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearFailures,
  createSession,
  currentUser,
  destroySession,
  hashPassword,
  isLocked,
  passwordProblem,
  recordFailure,
  requireUser,
  verifyPassword,
  type Role,
} from "@/lib/auth";
import { getBucket } from "@/lib/cf";
import { all, clean, first, readyDb, run } from "@/lib/db";
import { DEFAULT_HERO, getSetting, setSetting } from "@/lib/settings";
import { SNS_PLATFORMS, type HeroCaption } from "@/lib/types";
import { youtubeId, youtubeTitle } from "@/lib/youtube";

export type FormState = { error?: string; ok?: string };

async function db() {
  const d = await readyDb();
  if (!d) redirect("/admin");
  return d;
}

function back(path: string, msg: string): never {
  revalidatePath(path);
  revalidatePath("/");
  redirect(`${path}?msg=${encodeURIComponent(msg)}`);
}

const num = (v: FormDataEntryValue | null) => Number(v ?? NaN);
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isUrl = (s: string) => /^https?:\/\/[^\s]+$/.test(s);
const isLocalPath = (s: string) => /^\/(videos|images|media)\/[\w./\-]+$/.test(s);

/* ───────────── 로그인 · 가입 ───────────── */

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const d = await readyDb();
  if (!d) return { error: "데이터베이스가 아직 연결되지 않았습니다." };
  const email = clean(fd.get("email"), 120).toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "이메일과 비밀번호를 입력해 주세요." };
  if (await isLocked(d, email)) return { error: "여러 번 틀려서 15분 동안 잠겼습니다. 잠시 후 다시 시도해 주세요." };

  const u = await first<{ id: number; password_hash: string; password_salt: string; status: string }>(
    d,
    "SELECT id, password_hash, password_salt, status FROM users WHERE email = ?",
    email,
  );
  if (!u || !(await verifyPassword(password, u.password_hash, u.password_salt))) {
    await recordFailure(d, email);
    return { error: "이메일 또는 비밀번호가 맞지 않습니다." };
  }
  if (u.status === "pending") return { error: "가입 승인을 기다리는 중입니다. 관리자에게 승인을 요청해 주세요." };
  if (u.status === "disabled") return { error: "사용이 중지된 계정입니다. 관리자에게 문의해 주세요." };

  await clearFailures(d, email);
  await createSession(d, u.id);
  redirect("/admin");
}

export async function signupAction(_: FormState, fd: FormData): Promise<FormState> {
  const d = await readyDb();
  if (!d) return { error: "데이터베이스가 아직 연결되지 않았습니다." };
  const name = clean(fd.get("name"), 40);
  const email = clean(fd.get("email"), 120).toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!name) return { error: "이름을 입력해 주세요." };
  if (!isEmail(email)) return { error: "이메일 주소를 확인해 주세요." };
  const pwErr = passwordProblem(password);
  if (pwErr) return { error: pwErr };
  if (password !== String(fd.get("password2") ?? "")) return { error: "비밀번호 확인이 일치하지 않습니다." };

  const exists = await first(d, "SELECT id FROM users WHERE email = ?", email);
  if (exists) return { error: "이미 가입된 이메일입니다. 로그인해 주세요." };

  const count = (await first<{ n: number }>(d, "SELECT COUNT(*) AS n FROM users"))?.n ?? 0;
  const firstUser = count === 0;
  const { hash, salt } = await hashPassword(password);
  const r = await run(
    d,
    "INSERT INTO users (email, name, password_hash, password_salt, role, status) VALUES (?, ?, ?, ?, ?, ?)",
    email,
    name,
    hash,
    salt,
    firstUser ? "owner" : "editor",
    firstUser ? "active" : "pending",
  );

  if (firstUser) {
    await createSession(d, Number(r.meta.last_row_id));
    redirect("/admin?msg=" + encodeURIComponent("첫 관리자 계정이 만들어졌습니다. 환영합니다."));
  }
  return { ok: "가입 신청이 접수되었습니다. 관리자가 승인하면 로그인할 수 있습니다." };
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser();
  const d = await db();
  const row = await first<{ password_hash: string; password_salt: string }>(
    d,
    "SELECT password_hash, password_salt FROM users WHERE id = ?",
    me.id,
  );
  if (!row || !(await verifyPassword(String(fd.get("current") ?? ""), row.password_hash, row.password_salt))) {
    return { error: "지금 비밀번호가 맞지 않습니다." };
  }
  const next = String(fd.get("next") ?? "");
  const err = passwordProblem(next);
  if (err) return { error: err };
  if (next !== String(fd.get("next2") ?? "")) return { error: "새 비밀번호 확인이 일치하지 않습니다." };
  const { hash, salt } = await hashPassword(next);
  await run(d, "UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", hash, salt, me.id);
  await run(d, "DELETE FROM sessions WHERE user_id = ?", me.id);
  await createSession(d, me.id);
  return { ok: "비밀번호를 바꿨습니다. 다른 기기에서는 다시 로그인해야 합니다." };
}

/* ───────────── 문의 ───────────── */

export async function updateInquiry(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const status = clean(fd.get("status"), 20);
  if (!["new", "in_progress", "done"].includes(status)) back("/admin/inquiries", "상태 값이 올바르지 않습니다.");
  await run(
    d,
    "UPDATE inquiries SET status = ?, memo = ?, updated_at = datetime('now') WHERE id = ?",
    status,
    clean(fd.get("memo"), 2000),
    num(fd.get("id")),
  );
  back("/admin/inquiries", "문의를 저장했습니다.");
}

export async function deleteInquiry(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  await run(d, "DELETE FROM inquiries WHERE id = ?", num(fd.get("id")));
  back("/admin/inquiries", "문의를 지웠습니다.");
}

/* ───────────── 유튜브 영상 ───────────── */

function parseTags(s: string) {
  return JSON.stringify(
    s
      .split(/[,\s#]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8),
  );
}

export async function addVideo(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const id = youtubeId(clean(fd.get("url"), 300));
  if (!id) back("/admin/videos", "유튜브 주소를 확인해 주세요. 예: https://youtu.be/영상ID");
  const title = clean(fd.get("title"), 120) || (await youtubeTitle(id)) || "새 작업 영상";
  const kind = clean(fd.get("kind"), 20) || "작업 영상";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(fd.get("date"))) ? String(fd.get("date")) : new Date().toISOString().slice(0, 10);
  const maxSort = (await first<{ m: number }>(d, "SELECT COALESCE(MAX(sort), 0) AS m FROM videos"))?.m ?? 0;
  await run(
    d,
    "INSERT INTO videos (youtube_id, title, caption, kind, tags, published_on, sort) VALUES (?, ?, ?, ?, ?, ?, ?)",
    id,
    title,
    clean(fd.get("caption"), 80),
    kind,
    parseTags(clean(fd.get("tags"), 200)),
    date,
    maxSort + 1,
  );
  back("/admin/videos", `“${title}” 영상을 올렸습니다.`);
}

export async function updateVideo(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const date = String(fd.get("date"));
  await run(
    d,
    `UPDATE videos SET title = ?, caption = ?, kind = ?, tags = ?, published_on = ?, visible = ?, updated_at = datetime('now')
      WHERE id = ?`,
    clean(fd.get("title"), 120) || "작업 영상",
    clean(fd.get("caption"), 80),
    clean(fd.get("kind"), 20) || "작업 영상",
    parseTags(clean(fd.get("tags"), 200)),
    /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10),
    fd.get("visible") === "on" ? 1 : 0,
    num(fd.get("id")),
  );
  back("/admin/videos", "영상 정보를 저장했습니다.");
}

export async function moveVideo(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  await reorder(d, "videos", num(fd.get("id")), fd.get("dir") === "up" ? -1 : 1);
  back("/admin/videos", "순서를 바꿨습니다.");
}

export async function deleteVideo(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  await run(d, "DELETE FROM videos WHERE id = ?", num(fd.get("id")));
  back("/admin/videos", "영상을 목록에서 뺐습니다.");
}

/* ───────────── SNS ───────────── */

export async function addSns(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const platform = clean(fd.get("platform"), 20);
  const url = clean(fd.get("url"), 300);
  if (!SNS_PLATFORMS.some((p) => p.id === platform)) back("/admin/sns", "채널 종류를 골라 주세요.");
  if (!isUrl(url)) back("/admin/sns", "주소는 https:// 로 시작해야 합니다.");
  const label = clean(fd.get("label"), 30) || SNS_PLATFORMS.find((p) => p.id === platform)!.label;
  const maxSort = (await first<{ m: number }>(d, "SELECT COALESCE(MAX(sort), 0) AS m FROM sns_links"))?.m ?? 0;
  await run(d, "INSERT INTO sns_links (platform, label, url, sort) VALUES (?, ?, ?, ?)", platform, label, url, maxSort + 1);
  back("/admin/sns", `${label} 채널을 추가했습니다.`);
}

export async function updateSns(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const url = clean(fd.get("url"), 300);
  if (!isUrl(url)) back("/admin/sns", "주소는 https:// 로 시작해야 합니다.");
  await run(
    d,
    "UPDATE sns_links SET label = ?, url = ?, visible = ? WHERE id = ?",
    clean(fd.get("label"), 30),
    url,
    fd.get("visible") === "on" ? 1 : 0,
    num(fd.get("id")),
  );
  back("/admin/sns", "채널을 저장했습니다.");
}

export async function moveSns(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  await reorder(d, "sns_links", num(fd.get("id")), fd.get("dir") === "up" ? -1 : 1);
  back("/admin/sns", "순서를 바꿨습니다.");
}

export async function deleteSns(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  await run(d, "DELETE FROM sns_links WHERE id = ?", num(fd.get("id")));
  back("/admin/sns", "채널을 지웠습니다.");
}

async function reorder(d: Awaited<ReturnType<typeof db>>, table: "videos" | "sns_links", id: number, dir: -1 | 1) {
  const rows = await all<{ id: number }>(d, `SELECT id FROM ${table} ORDER BY sort ASC, id ASC`);
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= rows.length) return;
  [rows[i], rows[j]] = [rows[j], rows[i]];
  await d.batch(rows.map((r, k) => d.prepare(`UPDATE ${table} SET sort = ? WHERE id = ?`).bind(k + 1, r.id)));
}

/* ───────────── 히어로 ───────────── */

export async function saveHero(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const cur = await getSetting(d, "hero");
  const path = (k: string, fallback: string) => {
    const v = clean(fd.get(k), 300);
    return v && (isLocalPath(v) || isUrl(v)) ? v : fallback;
  };
  const story: HeroCaption[] = [];
  for (let i = 0; i < 6; i++) {
    const word = clean(fd.get(`word_${i}`), 16).toUpperCase();
    const ko = clean(fd.get(`ko_${i}`), 40);
    if (!word) continue;
    story.push({ word, ko, from: 0, to: 0 });
  }
  // 캡션은 영상 구간(0.05~end)을 고르게 나눠 가진다
  const end = Math.min(0.95, Math.max(0.5, Number(fd.get("end")) || cur.video.end));
  const span = (end - 0.05) / Math.max(1, story.length);
  story.forEach((c, i) => {
    c.from = +(0.05 + span * i).toFixed(3);
    c.to = +(0.05 + span * (i + 1)).toFixed(3);
  });

  await setSetting(d, "hero", {
    rev: DEFAULT_HERO.rev,
    mode: fd.get("mode") === "sketch" ? "sketch" : "video",
    tagline: clean(fd.get("tagline"), 40) || cur.tagline,
    slogan: clean(fd.get("slogan"), 40) || cur.slogan,
    story: story.length ? story : cur.story,
    video: {
      desktop: { mp4: path("desktop_mp4", cur.video.desktop.mp4), webm: path("desktop_webm", cur.video.desktop.webm) },
      mobile: { mp4: path("mobile_mp4", cur.video.mobile.mp4), webm: path("mobile_webm", cur.video.mobile.webm) },
      poster: path("poster", cur.video.poster),
      still: path("still", cur.video.still),
      end,
    },
  });
  back("/admin/hero", "히어로를 저장했습니다. 홈페이지에 바로 반영됩니다.");
}

export async function resetHero() {
  await requireUser("admin");
  const d = await db();
  await run(d, "DELETE FROM settings WHERE key = 'hero'");
  back("/admin/hero", "히어로를 처음 설정으로 되돌렸습니다.");
}

export async function deleteMedia(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const id = num(fd.get("id"));
  const m = await first<{ r2_key: string }>(d, "SELECT r2_key FROM media WHERE id = ?", id);
  if (m) {
    const bucket = await getBucket();
    await bucket?.delete(m.r2_key);
    await run(d, "DELETE FROM media WHERE id = ?", id);
  }
  back("/admin/hero", "파일을 지웠습니다.");
}

/* ───────────── 고객지원 · 연결 ───────────── */

export async function saveContact(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const kakao = clean(fd.get("kakaoUrl"), 300);
  const map = clean(fd.get("mapUrl"), 500);
  if (kakao && !isUrl(kakao)) back("/admin/support", "카카오톡 채널 주소는 https:// 로 시작해야 합니다.");
  if (map && !isUrl(map)) back("/admin/support", "지도 주소는 https:// 로 시작해야 합니다.");
  const phone = clean(fd.get("phone"), 30);
  if (!/^[0-9+\-\s()]{8,}$/.test(phone)) back("/admin/support", "대표 전화번호를 확인해 주세요.");
  const phone2 = clean(fd.get("phone2"), 30);
  if (phone2 && !/^[0-9+\-\s()]{8,}$/.test(phone2)) back("/admin/support", "두 번째 전화번호를 확인해 주세요.");
  await setSetting(d, "contact", {
    phone,
    phone2,
    hours: clean(fd.get("hours"), 120),
    address: clean(fd.get("address"), 200),
    fax: clean(fd.get("fax"), 30),
    ceo: clean(fd.get("ceo"), 30),
    bizNo: clean(fd.get("bizNo"), 30),
    kakaoUrl: kakao,
    mapUrl: map,
  });
  back("/admin/support", "연락처를 저장했습니다.");
}

/** 분석·고객지원 화면 양쪽에서 쓴다. 폼에 있는 칸만 바꾼다 */
export async function saveIntegrations(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const cur = await getSetting(d, "integrations");
  const from = clean(fd.get("from"), 40) === "analytics" ? "/admin/analytics" : "/admin/support";
  const next = { ...cur };
  if (fd.has("gaId")) {
    const ga = clean(fd.get("gaId"), 30).toUpperCase();
    if (ga && !/^G-[A-Z0-9]{4,}$/.test(ga)) back(from, "측정 ID는 G- 로 시작합니다. 예: G-AB12CD34EF");
    next.gaId = ga;
  }
  if (fd.has("channelTalkKey")) {
    const k = clean(fd.get("channelTalkKey"), 80);
    if (k && !/^[\w-]{8,}$/.test(k)) back(from, "채널톡 플러그인 키 형식을 확인해 주세요.");
    next.channelTalkKey = k;
  }
  if (fd.has("inquiryWebhook")) {
    const w = clean(fd.get("inquiryWebhook"), 400);
    if (w && !/^https:\/\//.test(w)) back(from, "알림 주소는 https:// 로 시작해야 합니다.");
    next.inquiryWebhook = w;
  }
  if (fd.has("gaPropertyId")) {
    const p = clean(fd.get("gaPropertyId"), 20).replace(/^properties\//, "");
    if (p && !/^\d{6,12}$/.test(p)) back(from, "GA4 속성 ID는 숫자입니다. 예: 412345678");
    next.gaPropertyId = p;
  }
  await setSetting(d, "integrations", next);
  back(from, "연결 설정을 저장했습니다.");
}

/* ───────────── 회원 ───────────── */

export async function updateMember(fd: FormData) {
  const me = await requireUser("admin");
  const d = await db();
  const id = num(fd.get("id"));
  if (id === me.id) back("/admin/users", "자기 계정의 권한·상태는 바꿀 수 없습니다.");
  const target = await first<{ role: Role }>(d, "SELECT role FROM users WHERE id = ?", id);
  if (!target) back("/admin/users", "회원을 찾지 못했습니다.");

  const role = clean(fd.get("role"), 10) as Role;
  const status = clean(fd.get("status"), 10);
  if (!["owner", "admin", "editor"].includes(role) || !["pending", "active", "disabled"].includes(status)) {
    back("/admin/users", "값이 올바르지 않습니다.");
  }
  // 관리자(admin)는 편집자만 다룰 수 있고, 대표(owner) 권한은 대표만 줄 수 있다
  if (me.role !== "owner" && (target.role !== "editor" || role !== "editor")) {
    back("/admin/users", "관리자·대표 권한은 대표 계정만 바꿀 수 있습니다.");
  }
  await run(d, "UPDATE users SET role = ?, status = ? WHERE id = ?", role, status, id);
  if (status !== "active") await run(d, "DELETE FROM sessions WHERE user_id = ?", id);
  back("/admin/users", "회원 정보를 저장했습니다.");
}

export async function deleteMember(fd: FormData) {
  const me = await requireUser("owner");
  const d = await db();
  const id = num(fd.get("id"));
  if (id === me.id) back("/admin/users", "자기 계정은 지울 수 없습니다.");
  await run(d, "DELETE FROM users WHERE id = ?", id);
  back("/admin/users", "회원을 지웠습니다.");
}

/** 로그인 여부만 확인 (로그인·가입 화면에서 이미 로그인했으면 대시보드로) */
export async function redirectIfLoggedIn() {
  if (await currentUser()) redirect("/admin");
}
