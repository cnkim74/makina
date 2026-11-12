"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { all, clean, first, readyDb, run } from "@/lib/db";
import { cleanCover, cleanSlug, type BlogFaq } from "@/lib/blog";
import { getPost } from "@/lib/blog-server";
import { writeDraft } from "@/lib/blog-ai";
import { pendingPages, postLinkToPage, savePage } from "@/lib/facebook";
import { getSetting, setSetting } from "@/lib/settings";
import { kstToday } from "@/lib/time";
import { youtubeId } from "@/lib/youtube";

/* 블로그 서버 동작: 글 저장·발행·삭제, AI 초안, 페이스북 게시, AI·SNS 설정 */

async function db() {
  const d = await readyDb();
  if (!d) redirect("/admin");
  return d;
}

function back(path: string, msg: string): never {
  revalidatePath(path);
  revalidatePath("/blog");
  redirect(`${path}${path.includes("?") ? "&" : "?"}msg=${encodeURIComponent(msg)}`);
}

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
}

/** 줄마다 "질문 | 답" */
function parseFaq(s: string): BlogFaq[] {
  return s
    .split("\n")
    .map((l) => l.split("|").map((x) => x.trim()))
    .filter((p) => p[0] && p[1])
    .slice(0, 8)
    .map(([q, ...a]) => ({ q: q.replace(/^Q[.:]\s*/i, "").slice(0, 200), a: a.join(" | ").slice(0, 800) }));
}

const parseTags = (s: string) =>
  JSON.stringify(
    s
      .split(/[,\n#]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10),
  );

/** 겹치지 않는 주소 이름 (같은 이름이 있으면 -2, -3 …) */
async function uniqueSlug(d: Awaited<ReturnType<typeof db>>, want: string, id: number) {
  const base = cleanSlug(want) || `post-${kstToday().replace(/-/g, "")}`;
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const hit = await first<{ id: number }>(d, "SELECT id FROM blog_posts WHERE slug = ? AND id <> ?", slug, id);
    if (!hit) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** 발행된 글을 페이스북 페이지에 올린다. 실패하면 이유를 돌려준다 */
async function shareToFacebook(d: Awaited<ReturnType<typeof db>>, id: number): Promise<string> {
  const post = await getPost(d, id);
  if (!post || post.status !== "published") return "발행한 글만 페이스북에 올릴 수 있습니다.";
  const message = [post.summary, post.tags.slice(0, 3).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")].filter(Boolean).join("\n\n");
  try {
    const r = await postLinkToPage(d, message, `${await origin()}/blog/${post.slug}`);
    await run(d, "UPDATE blog_posts SET fb_post_id = ?, fb_permalink = ? WHERE id = ?", r.id, r.permalink, id);
    return "";
  } catch (e) {
    return e instanceof Error ? e.message : "페이스북 게시에 실패했습니다.";
  }
}

export async function saveBlogPost(fd: FormData) {
  const user = await requireUser("editor");
  const d = await db();
  const id = Number(fd.get("id")) || 0;
  const path = id ? `/admin/blog/${id}` : "/admin/blog/new";
  const title = clean(fd.get("title"), 120);
  if (!title) back(path, "제목을 적어 주세요.");
  const intent = String(fd.get("intent") ?? "save");
  const ytRaw = clean(fd.get("youtube"), 300) || clean(fd.get("youtube_pick"), 20);
  const yt = ytRaw ? youtubeId(ytRaw) : "";
  if (ytRaw && !yt) back(path, "유튜브 주소를 확인해 주세요. 예: https://youtu.be/영상ID");
  const cover = cleanCover({ template: fd.get("cover_template"), eyebrow: clean(fd.get("cover_eyebrow"), 20), image: clean(fd.get("cover_image"), 400) });
  const old = id ? await getPost(d, id) : null;
  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (old?.status ?? "draft");
  const slug = await uniqueSlug(d, clean(fd.get("slug"), 80) || old?.slug || "", id);
  const vals = [
    slug,
    title,
    clean(fd.get("summary"), 300),
    clean(fd.get("body"), 40000),
    clean(fd.get("keyword"), 40),
    parseTags(clean(fd.get("tags"), 400)),
    JSON.stringify(parseFaq(clean(fd.get("faq"), 6000))),
    JSON.stringify(cover),
    yt ?? "",
    status,
  ];

  let postId = id;
  if (id) {
    await run(
      d,
      `UPDATE blog_posts SET slug = ?, title = ?, summary = ?, body = ?, keyword = ?, tags = ?, faq = ?, cover = ?, youtube_id = ?, status = ?,
        published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') ELSE published_at END,
        updated_at = datetime('now') WHERE id = ?`,
      ...vals,
      status,
      id,
    );
  } else {
    const r = await run(
      d,
      `INSERT INTO blog_posts (slug, title, summary, body, keyword, tags, faq, cover, youtube_id, status, published_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN datetime('now') END, ?)`,
      ...vals,
      status,
      user.name,
    );
    postId = Number(r.meta.last_row_id);
  }

  let msg = intent === "publish" ? "글을 발행했습니다. 블로그에 바로 보입니다." : intent === "unpublish" ? "발행을 내렸습니다(작성 중)." : "저장했습니다.";
  // 처음 발행할 때 "자동 게시"가 켜져 있으면 페이스북에도 올린다
  if (intent === "publish" && !old?.fb_post_id) {
    const social = await getSetting(d, "social");
    if (social.fbAutoPost && social.fbPageId) {
      const err = await shareToFacebook(d, postId);
      msg += err ? ` 페이스북 게시는 실패했습니다: ${err}` : ` 페이스북 페이지 “${social.fbPageName}”에도 올렸습니다.`;
    }
  }
  back(`/admin/blog/${postId}`, msg);
}

export async function deleteBlogPost(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  await run(d, "DELETE FROM blog_posts WHERE id = ?", Number(fd.get("id")));
  back("/admin/blog", "글을 지웠습니다. 페이스북에 올린 글은 페이스북에서 따로 지워 주세요.");
}

export async function shareBlogToFacebook(fd: FormData) {
  await requireUser("editor");
  const d = await db();
  const id = Number(fd.get("id"));
  const err = await shareToFacebook(d, id);
  back(`/admin/blog/${id}`, err ? `페이스북 게시 실패: ${err}` : "페이스북 페이지에 올렸습니다.");
}

/** AI 가 새 글 초안을 써서 "작성 중"으로 저장한다 (1~2분) */
export async function aiDraftPost(fd: FormData) {
  const user = await requireUser("editor");
  const d = await db();
  const settings = await getSetting(d, "blog");
  const pick = clean(fd.get("video"), 20);
  const video = pick ? await first<{ youtube_id: string; title: string }>(d, "SELECT youtube_id, title FROM videos WHERE youtube_id = ?", pick) : null;
  const recent = await all<{ title: string }>(d, "SELECT title FROM blog_posts ORDER BY id DESC LIMIT 20");
  let draft;
  try {
    draft = await writeDraft({ topic: clean(fd.get("topic"), 500), recentTitles: recent.map((r) => r.title), settings, video: video?.title });
  } catch (e) {
    back("/admin/blog", e instanceof Error ? e.message : "AI 초안 작성에 실패했습니다.");
  }
  const slug = await uniqueSlug(d, draft.slug, 0);
  const r = await run(
    d,
    `INSERT INTO blog_posts (slug, title, summary, body, keyword, tags, faq, cover, youtube_id, status, source, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'ai', ?)`,
    slug,
    draft.title.slice(0, 120),
    draft.summary.slice(0, 300),
    draft.body,
    draft.keyword.slice(0, 40),
    JSON.stringify(draft.tags),
    JSON.stringify(draft.faq),
    JSON.stringify(cleanCover(draft.cover)),
    video?.youtube_id ?? "",
    user.name,
  );
  back(`/admin/blog/${r.meta.last_row_id}`, "AI 초안을 만들었습니다. 사실과 다른 곳이 없는지 읽고 고친 뒤 발행해 주세요.");
}

/* ───────────── AI · SNS 설정 ───────────── */

export async function saveBlogSettings(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  await setSetting(d, "blog", { topics: clean(fd.get("topics"), 2000), guide: clean(fd.get("guide"), 2000) });
  back("/admin/blog/settings", "AI 글쓰기 설정을 저장했습니다.");
}

export async function saveSocialSettings(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const cur = await getSetting(d, "social");
  const appId = clean(fd.get("fbAppId"), 30);
  if (appId && !/^\d{6,20}$/.test(appId)) back("/admin/blog/settings", "페이스북 앱 ID 는 숫자입니다.");
  await setSetting(d, "social", { ...cur, fbAppId: appId, fbAutoPost: fd.get("fbAutoPost") === "on" });
  back("/admin/blog/settings", "SNS 연결 설정을 저장했습니다.");
}

export async function choosePage(fd: FormData) {
  await requireUser("admin");
  const d = await db();
  const page = (await pendingPages(d)).find((p) => p.id === String(fd.get("pageId")));
  if (!page) back("/admin/blog/settings", "페이지를 찾지 못했습니다. 다시 연결해 주세요.");
  await savePage(d, page);
  back("/admin/blog/settings", `페이스북 페이지 “${page.name}”를 연결했습니다.`);
}

export async function disconnectFacebook() {
  await requireUser("admin");
  const d = await db();
  const cur = await getSetting(d, "social");
  await setSetting(d, "social", { ...cur, fbPageId: "", fbPageName: "", fbPageToken: "", fbPending: "", fbConnectedAt: "", fbAutoPost: false });
  back("/admin/blog/settings", "페이스북 연결을 끊었습니다.");
}
