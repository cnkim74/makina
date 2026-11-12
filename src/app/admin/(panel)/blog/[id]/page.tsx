import Link from "next/link";
import { notFound } from "next/navigation";
import { hasRole, requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { COVER_TEMPLATES, postDate, type BlogPost } from "@/lib/blog";
import { getPost } from "@/lib/blog-server";
import { getSetting } from "@/lib/settings";
import { deleteBlogPost, saveBlogPost, shareBlogToFacebook } from "../../../blog-actions";
import { ConfirmSubmit, Submit } from "../../../_ui/client";
import { BodyImage, CoverImage, IntentButton } from "../../../_ui/blog-client";
import { Flash, PageHead } from "../../../_ui/server";
import a from "../../../admin.module.css";

export default async function BlogEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const db = (await readyDb())!;
  const isNew = id === "new";
  const p: BlogPost | null = isNew ? null : await getPost(db, Number(id));
  if (!isNew && !p) notFound();
  const [social, videos] = await Promise.all([
    getSetting(db, "social"),
    all<{ youtube_id: string; title: string }>(db, "SELECT youtube_id, title FROM videos ORDER BY sort, id DESC LIMIT 200"),
  ]);
  const known = p?.youtube_id && videos.some((v) => v.youtube_id === p.youtube_id);
  const published = p?.status === "published";

  return (
    <>
      <PageHead
        title={p ? p.title : "새 글"}
        desc={
          p
            ? `${published ? `발행 ${postDate(p.published_at)}` : "작성 중"} · 조회 ${p.views} · 주소 /blog/${p.slug}${p.source === "ai" ? " · AI 초안" : ""}`
            : "본문은 마크다운으로 씁니다. ## 는 소제목, - 는 목록, **굵게**, [글자](주소) 는 링크입니다."
        }
      >
        <div className={a.actions}>
          {p && (
            <a href={`/admin/preview/blog/${p.id}`} target="_blank" rel="noopener noreferrer" className={`${a.btn} ${a.btnGhost}`}>
              미리보기 ↗
            </a>
          )}
          {published && (
            <a href={`/blog/${p!.slug}`} target="_blank" rel="noopener noreferrer" className={`${a.btn} ${a.btnGhost}`}>
              블로그에서 보기 ↗
            </a>
          )}
          <Link href="/admin/blog" className={`${a.btn} ${a.btnGhost}`}>
            목록
          </Link>
        </div>
      </PageHead>
      <Flash msg={sp.msg} warn={!!sp.msg && /실패|확인|적어/.test(sp.msg)} />

      <form action={saveBlogPost} className={`${a.card} ${a.form}`}>
        {p && <input type="hidden" name="id" value={p.id} />}
        <label className={a.field}>
          <span>제목 *</span>
          <input name="title" required defaultValue={p?.title} placeholder="예: 수단그라스 수확 시기, 이렇게 정하세요" />
        </label>
        <label className={a.field}>
          <span>
            요약 <small>검색 결과·목록·페이스북에 보이는 두 줄 (100~140자)</small>
          </span>
          <textarea name="summary" rows={2} defaultValue={p?.summary} />
        </label>
        <div className={`${a.row} ${a.row3}`}>
          <label className={a.field}>
            <span>
              핵심 키워드 <small>표지·검색용 1개</small>
            </span>
            <input name="keyword" defaultValue={p?.keyword} placeholder="예: 수단그라스 수확" />
          </label>
          <label className={a.field}>
            <span>
              태그 <small>쉼표로 구분</small>
            </span>
            <input name="tags" defaultValue={p?.tags.join(", ")} placeholder="조사료, 수단그라스, 모우어" />
          </label>
          <label className={a.field}>
            <span>
              주소 이름 <small>영문·숫자·하이픈, 비우면 자동</small>
            </span>
            <input name="slug" defaultValue={p?.slug} placeholder="sudangrass-harvest" />
          </label>
        </div>

        <label className={a.field}>
          <span>본문 (마크다운)</span>
          <textarea id="blog-body" name="body" rows={22} defaultValue={p?.body} style={{ fontFamily: "ui-monospace, monospace", fontSize: 15 }} />
        </label>
        <BodyImage target="blog-body" />

        <label className={a.field}>
          <span>
            자주 묻는 질문 <small>한 줄에 “질문 | 답”</small>
          </span>
          <textarea name="faq" rows={4} defaultValue={p?.faq.map((f) => `${f.q} | ${f.a}`).join("\n")} />
        </label>

        <h2 style={{ marginTop: 8 }}>유튜브 영상</h2>
        <div className={a.row}>
          <label className={a.field}>
            <span>“유튜브 영상” 메뉴에 올린 영상에서 고르기</span>
            <select name="youtube_pick" defaultValue={known ? p!.youtube_id : ""}>
              <option value="">(없음)</option>
              {videos.map((v) => (
                <option key={v.youtube_id} value={v.youtube_id}>
                  {v.title}
                </option>
              ))}
            </select>
          </label>
          <label className={a.field}>
            <span>또는 유튜브 주소 붙여 넣기 (이쪽이 우선)</span>
            <input name="youtube" defaultValue={p?.youtube_id && !known ? `https://youtu.be/${p.youtube_id}` : ""} placeholder="https://youtu.be/…" />
          </label>
        </div>

        <h2 style={{ marginTop: 8 }}>표지</h2>
        <div className={a.row}>
          <label className={a.field}>
            <span>표지 모양</span>
            <select name="cover_template" defaultValue={p?.cover.template ?? "soil"}>
              {COVER_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label} — {t.desc}
                </option>
              ))}
            </select>
          </label>
          <label className={a.field}>
            <span>
              제목 위 라벨 <small>예: GUIDE, 수확 가이드</small>
            </span>
            <input name="cover_eyebrow" defaultValue={p?.cover.eyebrow} maxLength={20} />
          </label>
        </div>
        <CoverImage initial={p?.cover.image ?? ""} />

        <div className={a.actions}>
          <IntentButton intent="save" ghost>
            저장
          </IntentButton>
          {published ? (
            <>
              <IntentButton intent="publish">고친 내용 저장 (발행 유지)</IntentButton>
              <IntentButton intent="unpublish" ghost>
                발행 내리기
              </IntentButton>
            </>
          ) : (
            <IntentButton intent="publish">발행하기</IntentButton>
          )}
          {!published && social.fbAutoPost && social.fbPageId && (
            <span className={a.muted}>발행하면 페이스북 페이지 “{social.fbPageName}”에도 올라갑니다.</span>
          )}
        </div>
      </form>

      {p && (
        <div className={a.actions} style={{ marginTop: 16 }}>
          {published && social.fbPageId && (
            <form action={shareBlogToFacebook}>
              <input type="hidden" name="id" value={p.id} />
              <Submit className={`${a.btn} ${a.btnGhost}`}>{p.fb_post_id ? "페이스북에 한 번 더 올리기" : "페이스북 페이지에 올리기"}</Submit>
            </form>
          )}
          {p.fb_permalink && (
            <a href={p.fb_permalink} target="_blank" rel="noopener noreferrer" className={`${a.btn} ${a.btnGhost}`}>
              페이스북 게시물 보기 ↗
            </a>
          )}
          {hasRole(user, "admin") && (
            <form action={deleteBlogPost}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmSubmit message={`“${p.title}” 글을 지울까요?`}>글 지우기</ConfirmSubmit>
            </form>
          )}
        </div>
      )}
    </>
  );
}
