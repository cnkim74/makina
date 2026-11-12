import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import BlogCover from "@/components/BlogCover";
import { postDate, readingMinutes } from "@/lib/blog";
import { getPublishedPosts } from "@/lib/blog-server";
import { readyDb } from "@/lib/db";
import s from "./blog.module.css";

export const metadata: Metadata = {
  title: `블로그 · ${site.name}`,
  description: "조사료 수확 요령, DRAGON 사용·정비, 작업기 고르는 법까지 — 성원마끼나가 현장에서 자주 받는 질문을 정리합니다.",
  alternates: { canonical: "/blog" },
};
// 관리자에서 발행하면 바로 보이도록 요청마다 그린다
export const dynamic = "force-dynamic";

export default async function BlogList() {
  const posts = await getPublishedPosts(await readyDb());
  const [lead, ...rest] = posts;

  return (
    <div className={s.page}>
      <div className={s.eyebrow}>BLOG</div>
      <h1 className={s.h1}>
        들판에서 바로 쓰는 이야기<span>.</span>
      </h1>
      <p className={s.lead}>조사료 수확 요령, DRAGON 사용·정비, 작업기 고르는 법까지 — 농가에서 자주 받는 질문을 정리합니다.</p>

      {posts.length === 0 ? (
        <p className={s.empty}>곧 첫 글이 올라옵니다.</p>
      ) : (
        <>
          <Link href={`/blog/${lead.slug}`} className={s.feature}>
            <BlogCover cover={lead.cover} title={lead.title} keyword={lead.keyword} />
            <div className={s.featureText}>
              <Meta p={lead} />
              <h2>{lead.title}</h2>
              <p>{lead.summary}</p>
              <span className="lnk">글 읽기</span>
            </div>
          </Link>
          {rest.length > 0 && (
            <div className={s.grid}>
              {rest.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className={s.card}>
                  <div className={s.thumb}>
                    <BlogCover cover={p.cover} title={p.title} keyword={p.keyword} />
                  </div>
                  <Meta p={p} />
                  <h2>{p.title}</h2>
                  <p>{p.summary}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Meta({ p }: { p: { keyword: string; published_at: string | null; created_at: string; body: string; youtube_id: string } }) {
  return (
    <div className={s.meta}>
      {p.keyword && <b>#{p.keyword.replace(/\s+/g, "")}</b>}
      <span>{postDate(p.published_at ?? p.created_at)}</span>
      <span>· {readingMinutes(p.body)}분</span>
      {p.youtube_id && <span className={s.badge}>▶ 영상</span>}
    </div>
  );
}
