import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { postDate } from "@/lib/blog";
import { listPosts } from "@/lib/blog-server";
import { hasAiKey } from "@/lib/blog-ai";
import { getSetting } from "@/lib/settings";
import { aiDraftPost } from "../../blog-actions";
import { AiSubmit } from "../../_ui/blog-client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

export default async function BlogAdmin({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const [posts, ai, social, videos] = await Promise.all([
    listPosts(db),
    hasAiKey(),
    getSetting(db, "social"),
    all<{ youtube_id: string; title: string }>(db, "SELECT youtube_id, title FROM videos WHERE visible = 1 ORDER BY sort, id DESC LIMIT 100"),
  ]);
  const published = posts.filter((p) => p.status === "published").length;

  return (
    <>
      <PageHead
        title="블로그"
        desc="홈페이지 블로그(/blog) 글을 쓰고 발행합니다. AI 가 초안을 쓰고, 발행하면 페이스북 페이지에도 올릴 수 있습니다. 유튜브 영상을 글에 붙일 수 있습니다."
      >
        <div className={a.actions}>
          <Link href="/admin/blog/new" className={a.btn}>
            + 새 글 쓰기
          </Link>
          <Link href="/admin/blog/settings" className={`${a.btn} ${a.btnGhost}`}>
            AI · SNS 연결 설정
          </Link>
          <a href="/blog" target="_blank" rel="noopener noreferrer" className={`${a.btn} ${a.btnGhost}`}>
            블로그 보기 ↗
          </a>
        </div>
      </PageHead>
      <Flash msg={sp.msg} warn={!!sp.msg && /실패|없습니다|확인|못했/.test(sp.msg)} />

      <div className={`${a.grid} ${a.cols4}`}>
        <div className={`${a.card} ${a.stat}`}>
          <span>발행한 글</span>
          <b>{published}</b>
          <small>작성 중 {posts.length - published}</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>조회 (누적)</span>
          <b>{posts.reduce((s, p) => s + p.views, 0).toLocaleString("ko-KR")}</b>
          <small>발행한 글 합계</small>
        </div>
        <Link href="/admin/blog/settings" className={`${a.card} ${a.stat}`}>
          <span>AI 글쓰기</span>
          <b style={{ fontSize: 22 }}>{ai ? "연결됨" : "키 필요"}</b>
          <small>Claude (Anthropic)</small>
        </Link>
        <Link href="/admin/blog/settings" className={`${a.card} ${a.stat}`}>
          <span>페이스북 페이지</span>
          <b style={{ fontSize: 22 }}>{social.fbPageId ? "연결됨" : "연결 전"}</b>
          <small>{social.fbPageName || "SNS 연결 설정에서 연결"}</small>
        </Link>
      </div>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>AI 로 새 글 초안 쓰기</h2>
        <p className={a.sub}>
          주제를 비워 두면 설정의 주제 방향에서 AI 가 하나를 골라 씁니다. 제품 사양은 홈페이지에 있는 사실만 쓰고, 가격은 쓰지 않습니다. 초안은 “작성
          중”으로 저장되니 꼭 읽고 고친 뒤 발행하세요.
        </p>
        {ai ? (
          <form action={aiDraftPost} className={a.form}>
            <label className={a.field}>
              <span>주제 (선택)</span>
              <textarea name="topic" rows={2} placeholder="예: 수단그라스 수확 시기와 DRAGON 으로 베는 요령" />
            </label>
            <label className={a.field}>
              <span>
                함께 붙일 유튜브 영상 (선택) <small>“유튜브 영상” 메뉴에 올린 영상</small>
              </span>
              <select name="video" defaultValue="">
                <option value="">(붙이지 않음)</option>
                {videos.map((v) => (
                  <option key={v.youtube_id} value={v.youtube_id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </label>
            <div className={a.actions}>
              <AiSubmit />
            </div>
          </form>
        ) : (
          <p className={`${a.flash} ${a.flashWarn}`}>
            AI 키가 아직 없습니다. <Link href="/admin/blog/settings">AI · SNS 연결 설정</Link>의 안내대로 키를 넣으면 이 칸이 열립니다. 그 전에도 “새 글
            쓰기”로 직접 쓸 수 있습니다.
          </p>
        )}
      </section>

      <div className={a.tableWrap} style={{ marginTop: 16 }}>
        <table className={a.table}>
          <thead>
            <tr>
              <th>제목</th>
              <th>상태</th>
              <th>발행일</th>
              <th className={a.num}>조회</th>
              <th>영상 · 페이스북</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className={a.muted}>
                  아직 글이 없습니다. “새 글 쓰기” 또는 AI 초안으로 시작하세요.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/blog/${p.id}`} className={a.rowLink}>
                    {p.title}
                  </Link>
                  {p.source === "ai" && <span className={a.muted}> · AI 초안</span>}
                </td>
                <td>
                  <span className={`${a.pill} ${p.status === "published" ? a.pDone : a.pMuted}`}>{p.status === "published" ? "발행" : "작성 중"}</span>
                </td>
                <td>{p.published_at ? postDate(p.published_at) : "-"}</td>
                <td className={a.num}>{p.views.toLocaleString("ko-KR")}</td>
                <td>
                  {p.youtube_id ? "▶ 영상 " : ""}
                  {p.fb_permalink ? (
                    <a href={p.fb_permalink} target="_blank" rel="noopener noreferrer">
                      페이스북 ↗
                    </a>
                  ) : p.fb_post_id ? (
                    "페이스북 게시됨"
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
