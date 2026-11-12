import Link from "next/link";
import { headers } from "next/headers";
import { hasRole, requireUser } from "@/lib/auth";
import { readyDb } from "@/lib/db";
import { secretOf } from "@/lib/cf";
import { hasAiKey } from "@/lib/blog-ai";
import { fbRedirect, pendingPages } from "@/lib/facebook";
import { getSetting } from "@/lib/settings";
import { kstMinute } from "@/lib/time";
import { choosePage, disconnectFacebook, saveBlogSettings, saveSocialSettings } from "../../../blog-actions";
import { Submit } from "../../../_ui/client";
import { Flash, PageHead } from "../../../_ui/server";
import a from "../../../admin.module.css";

export default async function BlogSettingsPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const isAdmin = hasRole(user, "admin");
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
  const [ai, blog, social, fbSecret] = await Promise.all([
    hasAiKey(),
    getSetting(db, "blog"),
    getSetting(db, "social"),
    secretOf("FB_APP_SECRET"),
  ]);
  const pending = social.fbPending ? await pendingPages(db) : [];

  return (
    <>
      <PageHead title="AI · SNS 연결 설정" desc="블로그 AI 글쓰기(Claude)와 페이스북 페이지 자동 게시, 유튜브 영상 연결을 설정합니다.">
        <Link href="/admin/blog" className={`${a.btn} ${a.btnGhost}`}>
          블로그 목록
        </Link>
      </PageHead>
      <Flash msg={sp.msg} warn={!!sp.msg && /실패|없습니다|만료|먼저|취소/.test(sp.msg)} />

      <section className={a.card}>
        <h2>1. AI 글쓰기 (Claude)</h2>
        <p className={a.sub}>
          상태: <b>{ai ? "연결됨" : "키 없음"}</b> · 모델 Claude Opus 5.5. 초안 한 편에 보통 1~2분, 비용은 글 한 편에 수백 원 안팎입니다.
        </p>
        {!ai && (
          <ol className={a.steps}>
            <li>
              <a href="https://platform.claude.com/" target="_blank" rel="noopener noreferrer">
                platform.claude.com
              </a>{" "}
              에 가입하고 결제 수단을 등록한 뒤, API Keys 에서 키를 만듭니다.
            </li>
            <li>
              키는 비밀 값이라 화면에 넣지 않습니다. Cloudflare 대시보드 → Workers &amp; Pages → makina → Settings → Variables and Secrets 에서{" "}
              <code>ANTHROPIC_API_KEY</code> 를 <b>Secret</b> 으로 추가합니다.
            </li>
            <li>저장하면 바로 이 화면에 “연결됨”이 뜹니다.</li>
          </ol>
        )}
        {isAdmin && (
          <form action={saveBlogSettings} className={a.form}>
            <label className={a.field}>
              <span>
                주제 방향 <small>주제를 비워 두고 초안을 쓰면 여기서 하나를 고릅니다. 한 줄에 하나</small>
              </span>
              <textarea name="topics" rows={5} defaultValue={blog.topics} />
            </label>
            <label className={a.field}>
              <span>
                추가 지시 <small>말투, 꼭 넣을 말, 피할 말 등</small>
              </span>
              <textarea name="guide" rows={3} defaultValue={blog.guide} placeholder="예: 경상도 농가 독자를 생각해 쉬운 말로. ‘최고’ 같은 과장은 쓰지 말 것." />
            </label>
            <div className={a.actions}>
              <Submit>저장</Submit>
            </div>
          </form>
        )}
      </section>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>2. 페이스북 페이지</h2>
        <p className={a.sub}>
          연결하면 블로그 글을 발행할 때 회사 페이스북 페이지에 링크 게시물로 올립니다(제목·요약·표지가 미리보기로 붙음).
        </p>
        <ul className={a.check_list}>
          <li>
            <span className={`${a.dot} ${social.fbAppId ? a.dotOk : a.dotNo}`} aria-hidden="true" />
            페이스북 앱 ID <span className={a.muted}>{social.fbAppId || "아직"}</span>
          </li>
          <li>
            <span className={`${a.dot} ${fbSecret ? a.dotOk : a.dotNo}`} aria-hidden="true" />
            앱 시크릿 (FB_APP_SECRET) <span className={a.muted}>{fbSecret ? "넣음" : "아직"}</span>
          </li>
          <li>
            <span className={`${a.dot} ${social.fbPageId ? a.dotOk : a.dotNo}`} aria-hidden="true" />
            연결된 페이지{" "}
            <span className={a.muted}>
              {social.fbPageId ? `${social.fbPageName} · ${social.fbConnectedAt ? kstMinute(social.fbConnectedAt.replace("T", " ").slice(0, 19)) : ""}` : "아직"}
            </span>
          </li>
        </ul>

        {pending.length > 0 && isAdmin && (
          <div className={a.form} style={{ marginTop: 12 }}>
            <b>게시할 페이지를 고르세요</b>
            <div className={a.actions}>
              {pending.map((pg) => (
                <form key={pg.id} action={choosePage}>
                  <input type="hidden" name="pageId" value={pg.id} />
                  <Submit className={`${a.btn} ${a.btnGhost}`}>{pg.name}</Submit>
                </form>
              ))}
            </div>
          </div>
        )}

        {isAdmin && (
          <>
            <form action={saveSocialSettings} className={a.form} style={{ marginTop: 12 }}>
              <div className={a.row}>
                <label className={a.field}>
                  <span>페이스북 앱 ID</span>
                  <input name="fbAppId" defaultValue={social.fbAppId} inputMode="numeric" placeholder="1234567890123456" />
                </label>
                <label className={a.check} style={{ alignSelf: "end", minHeight: 48 }}>
                  <input type="checkbox" name="fbAutoPost" defaultChecked={social.fbAutoPost} /> 블로그 글을 발행하면 페이스북에도 바로 올리기
                </label>
              </div>
              <div className={a.actions}>
                <Submit>저장</Submit>
                {social.fbAppId && fbSecret && (
                  <a href="/api/admin/facebook/connect" className={`${a.btn} ${a.btnGhost}`}>
                    {social.fbPageId ? "페이스북 다시 연결" : "페이스북 연결하기"}
                  </a>
                )}
              </div>
            </form>
            {social.fbPageId && (
              <form action={disconnectFacebook} style={{ marginTop: 10 }}>
                <Submit className={`${a.btn} ${a.btnGhost} ${a.btnSm}`}>페이스북 연결 끊기</Submit>
              </form>
            )}
            <details style={{ marginTop: 16 }}>
              <summary className={a.linkBtn}>처음 연결하는 방법</summary>
              <ol className={a.steps}>
                <li>
                  <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">
                    developers.facebook.com/apps
                  </a>{" "}
                  에서 앱을 만듭니다(유형: 비즈니스). “Facebook 로그인” 제품을 추가합니다.
                </li>
                <li>
                  Facebook 로그인 → 설정 → “유효한 OAuth 리디렉션 URI”에 <code>{fbRedirect(origin)}</code> 를 넣습니다.
                </li>
                <li>
                  앱 설정 → 기본 설정의 <b>앱 ID</b> 를 위 칸에 넣고 저장합니다. <b>앱 시크릿 코드</b> 는 Cloudflare → makina → Settings → Variables and
                  Secrets 에 <code>FB_APP_SECRET</code> (Secret) 으로 넣습니다.
                </li>
                <li>“페이스북 연결하기”를 누르고, 회사 페이지 관리자 계정으로 로그인해 페이지 게시 권한을 허락합니다.</li>
                <li>
                  다른 사람 계정에서도 게시되게 하려면 앱 검수(pages_manage_posts)가 필요합니다. 그 전에는 앱 역할에 등록된 계정의 페이지에만 올라갑니다.
                </li>
              </ol>
            </details>
          </>
        )}
      </section>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>3. 유튜브 · 그 밖의 SNS</h2>
        <ul className={a.check_list}>
          <li>
            <b>유튜브</b>
            <span className={a.muted}>
              <Link href="/admin/videos">유튜브 영상</Link> 메뉴에 올린 영상을 글마다 붙일 수 있고(글 위에 재생 화면), AI 초안에 영상을 골라 함께 쓰게 할
              수 있습니다.
            </span>
          </li>
          <li>
            <b>인스타그램 · 블로그 · 카카오 등</b>
            <span className={a.muted}>
              <Link href="/admin/sns">SNS</Link> 메뉴에 채널 주소를 넣으면 푸터에 버튼이 생깁니다. 글마다 페이스북·X·밴드 공유, 링크 복사(카톡) 버튼이
              붙습니다.
            </span>
          </li>
        </ul>
      </section>
    </>
  );
}
