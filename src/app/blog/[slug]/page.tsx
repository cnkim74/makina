import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { site } from "@/data/site";
import BlogCover from "@/components/BlogCover";
import BlogShare from "@/components/BlogShare";
import { headingId, headings, postDate, readingMinutes } from "@/lib/blog";
import { countView, getPublishedBySlug, getPublishedPosts, renderMarkdown } from "@/lib/blog-server";
import { readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { telHref } from "@/lib/types";
import s from "../blog.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  return host ? `${h.get("x-forwarded-proto") ?? "https"}://${host}` : "";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBySlug(await readyDb(), slug);
  if (!post) return { title: `블로그 · ${site.name}` };
  const base = await origin();
  // 페이스북·카카오 미리보기 그림: 올린 표지 사진 → 유튜브 썸네일 → 히어로 첫 장면
  const image = post.cover.image
    ? post.cover.image.startsWith("http")
      ? post.cover.image
      : `${base}${post.cover.image}`
    : post.youtube_id
      ? `https://i.ytimg.com/vi/${post.youtube_id}/hqdefault.jpg`
      : `${base}/images/hero/hero-poster.webp`;
  return {
    title: `${post.title} · ${site.name}`,
    description: post.summary,
    keywords: [post.keyword, ...post.tags].filter(Boolean),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `${base}/blog/${post.slug}`,
      siteName: site.name,
      locale: "ko_KR",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images: [image] },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const db = await readyDb();
  const post = await getPublishedBySlug(db, slug);
  if (!post) notFound();
  await countView(db, post.id);

  const html = renderMarkdown(post.body);
  const toc = headings(post.body);
  const others = (await getPublishedPosts(db, 4)).filter((p) => p.id !== post.id).slice(0, 3);
  const base = await origin();
  const url = `${base}/blog/${post.slug}`;
  const contact = await getSetting(db, "contact");

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.summary,
      datePublished: post.published_at,
      dateModified: post.updated_at,
      author: { "@type": "Organization", name: `${site.name} ${site.nameEn}` },
      publisher: { "@type": "Organization", name: `${site.name} ${site.nameEn}` },
      mainEntityOfPage: url,
      keywords: [post.keyword, ...post.tags].filter(Boolean).join(", "),
    },
    ...(post.faq.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]
      : []),
  ];

  return (
    <article className={s.article}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Link href="/blog" className={s.back}>
        ← BLOG
      </Link>
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
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${post.youtube_id}?rel=0&playsinline=1`}
            title={`${post.title} 영상`}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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

      <div className={s.body} dangerouslySetInnerHTML={{ __html: html }} />

      {post.faq.length > 0 && (
        <section className={s.faq}>
          <h2>자주 묻는 질문</h2>
          {post.faq.map((f) => (
            <details key={f.q}>
              <summary>Q. {f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      )}

      {post.tags.length > 0 && (
        <div className={s.tags}>
          {post.tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
      )}

      <BlogShare url={url} title={post.title} />

      <div className={s.cta}>
        <div className={s.ctaEyebrow}>MAKKINA</div>
        <p>
          우리 농가에 맞는 작업기가 궁금하시면,
          <br />
          트랙터 마력과 작업 면적만 알려 주세요.
        </p>
        <div className={s.ctaBtns}>
          <a href={telHref(contact.phone)} className="btn btn--cta">
            ☏ 전화 상담 {contact.phone}
          </a>
          <Link href="/#inquiry" className={`btn ${s.ghostDark}`}>
            문의 남기기
          </Link>
          <Link href="/#products" className={`btn ${s.ghostDark}`}>
            DRAGON 라인업
          </Link>
        </div>
      </div>

      {others.length > 0 && (
        <section className={s.others}>
          <h2>다른 글</h2>
          <div className={s.othersGrid}>
            {others.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className={s.card}>
                <div className={s.thumb}>
                  <BlogCover cover={p.cover} title={p.title} keyword={p.keyword} />
                </div>
                <h3>{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
