import "server-only";
import { Marked } from "marked";
import type { D1Database } from "./cf";
import { all, first, run } from "./db";
import { fromRow, headingId, type BlogPost, type BlogRow } from "./blog";

/* 블로그 글 저장소 + 마크다운 렌더 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// 링크·이미지는 http(s)·사이트 안 주소·전화·메일만 (javascript: 등 막기)
const safeUrl = (u: string) => (/^(https?:\/\/|\/(?!\/)|#|tel:|mailto:)/i.test(u.trim()) ? u.trim() : "");

const md = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    // 본문에 HTML 을 그대로 넣지 않는다 (AI·직원이 쓴 글이라도 글자로 보인다)
    html({ text }) {
      return esc(text);
    },
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const plain = tokens.map((t) => ("text" in t ? String(t.text) : "")).join("");
      return `<h${depth} id="${esc(headingId(plain))}">${text}</h${depth}>\n`;
    },
    link({ href, title, tokens }) {
      const url = safeUrl(href);
      const text = this.parser.parseInline(tokens);
      if (!url) return text;
      const ext = /^https?:\/\//i.test(url);
      return `<a href="${esc(url)}"${title ? ` title="${esc(title)}"` : ""}${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    },
    image({ href, title, text }) {
      const url = safeUrl(href);
      if (!url) return "";
      const cap = title || "";
      return `<figure class="blog-figure"><img src="${esc(url)}" alt="${esc(text)}" loading="lazy" />${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
    },
  },
});

export function renderMarkdown(src: string): string {
  return md.parse(src, { async: false }) as string;
}

export async function getPublishedPosts(db: D1Database | null, limit = 60): Promise<BlogPost[]> {
  if (!db) return [];
  try {
    const rows = await all<BlogRow>(
      db,
      "SELECT * FROM blog_posts WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC LIMIT ?",
      limit,
    );
    return rows.map(fromRow);
  } catch {
    return [];
  }
}

export async function getPublishedBySlug(db: D1Database | null, slug: string): Promise<BlogPost | null> {
  if (!db) return null;
  try {
    const r = await first<BlogRow>(db, "SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'", slug);
    return r ? fromRow(r) : null;
  } catch {
    return null;
  }
}

export async function getPost(db: D1Database, id: number): Promise<BlogPost | null> {
  const r = await first<BlogRow>(db, "SELECT * FROM blog_posts WHERE id = ?", id);
  return r ? fromRow(r) : null;
}

export async function listPosts(db: D1Database): Promise<BlogPost[]> {
  return (await all<BlogRow>(db, "SELECT * FROM blog_posts ORDER BY id DESC LIMIT 500")).map(fromRow);
}

export async function countView(db: D1Database | null, id: number) {
  if (!db) return;
  try {
    await run(db, "UPDATE blog_posts SET views = views + 1 WHERE id = ?", id);
  } catch {
    /* 조회수는 실패해도 화면에 영향 없음 */
  }
}
