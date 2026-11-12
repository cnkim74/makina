import { notFound, redirect } from "next/navigation";
import BlogCover from "@/components/BlogCover";
import { requireUser } from "@/lib/auth";
import { readyDb } from "@/lib/db";
import { headingId, headings, postDate, readingMinutes } from "@/lib/blog";
import { getPost, renderMarkdown } from "@/lib/blog-server";
import s from "@/app/blog/blog.module.css";

export const dynamic = "force-dynamic";

/** 발행 전 글 미리보기 (직원만) */
export default async function BlogPreview({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const db = await readyDb();
  if (!db) redirect("/admin");
  const { id } = await params;
  const post = await getPost(db, Number(id));
  if (!post) notFound();
  const toc = headings(post.body);
  return (
    <article className={s.article}>
      <p style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bg-alt)", fontWeight: 700 }}>
        미리보기 · {post.status === "published" ? "발행된 글" : "아직 발행 전"} — 창을 닫으면 편집 화면으로 돌아갑니다.
      </p>
      <div className={s.meta}>
        {post.keyword && <b>#{post.keyword.replace(/\s+/g, "")}</b>}
        <span>{postDate(post.published_at ?? post.created_at)}</span>
        <span>· {readingMinutes(post.body)}분 읽기</span>
      </div>
      <h1 className={s.title}>{post.title}</h1>
      <p className={s.summary}>{post.summary}</p>
      <div className={s.hero}>
        <BlogCover cover={post.cover} title={post.title} keyword={post.keyword} />
      </div>
      {post.youtube_id && (
        <div className={s.video}>
          <iframe src={`https://www.youtube-nocookie.com/embed/${post.youtube_id}?rel=0`} title="영상" allowFullScreen />
        </div>
      )}
      {toc.length > 2 && (
        <nav className={s.toc} aria-label="목차">
          <div>목차</div>
          <ol>
            {toc.map((h) => (
              <li key={h}>
                <a href={`#${headingId(h)}`}>{h}</a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className={s.body} dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      {post.faq.length > 0 && (
        <section className={s.faq}>
          <h2>자주 묻는 질문</h2>
          {post.faq.map((f) => (
            <details key={f.q} open>
              <summary>Q. {f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      )}
    </article>
  );
}
