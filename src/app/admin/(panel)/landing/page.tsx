import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { LANDING_SECTIONS } from "@/lib/types";
import { moveLanding, saveLanding } from "../../biz-actions";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

const LABEL = new Map<string, string>(LANDING_SECTIONS.map((s) => [s.id, s.label]));
// 각 섹션에서 고칠 내용이 있는 관리 화면
const EDIT: Record<string, { href: string; label: string }> = {
  videos: { href: "/admin/videos", label: "영상 고르기" },
  support: { href: "/admin/support", label: "연락처 고치기" },
  directions: { href: "/admin/support", label: "주소 고치기" },
  inquiry: { href: "/admin/inquiries", label: "들어온 문의" },
};

export default async function Landing({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const [landing, hero, views] = await Promise.all([
    getSetting(db, "landing"),
    getSetting(db, "hero"),
    all<{ n: number }>(db, "SELECT COUNT(*) AS n FROM events WHERE type = 'page_view' AND created_at > datetime('now', '-7 days')"),
  ]);
  const shown = landing.sections.filter((s) => s.visible).length;

  return (
    <>
      <PageHead
        title="랜딩페이지"
        desc="메인 페이지에 보일 섹션을 켜고 끄고, 순서를 바꿉니다. 저장하면 홈페이지에 바로 반영됩니다. 맨 위 히어로(스크롤 영상)는 언제나 첫 화면입니다."
      >
        <a href="/" target="_blank" rel="noopener noreferrer" className={a.btn}>
          홈페이지에서 확인 ↗
        </a>
      </PageHead>
      <Flash msg={sp.msg} />

      <div className={`${a.grid} ${a.cols3}`}>
        <Link href="/admin/hero" className={`${a.card} ${a.stat}`}>
          <span>히어로</span>
          <b style={{ fontSize: 20 }}>{hero.mode === "video" ? "스크롤 영상" : "그림 장면"}</b>
          <small>{hero.slogan}</small>
        </Link>
        <div className={`${a.card} ${a.stat}`}>
          <span>보이는 섹션</span>
          <b>
            {shown} / {landing.sections.length}
          </b>
          <small>꺼 둔 섹션은 메뉴에서 눌러도 나오지 않습니다</small>
        </div>
        <Link href="/admin/analytics" className={`${a.card} ${a.stat}`}>
          <span>방문 (7일)</span>
          <b>{views[0]?.n ?? 0}</b>
          <small>접속 정보 보기</small>
        </Link>
      </div>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>섹션 순서 · 보이기</h2>
        <p className={a.sub}>바탕색(흰색·회색)은 섹션마다 정해져 있어, 순서를 바꾸면 같은 색이 이어질 수 있습니다. 바꾼 뒤 홈페이지에서 한 번 확인하세요.</p>
        <form id="landing" action={saveLanding} />
        <ol className={a.list} style={{ listStyle: "none", padding: 0 }}>
          <li className={a.item}>
            <div className={a.itemHead}>
              <span className={`${a.pill} ${a.pDone}`}>고정</span>
              <h3>히어로 (스크롤 영상)</h3>
              <Link href="/admin/hero" className={a.linkBtn}>
                영상·문구 고치기
              </Link>
            </div>
          </li>
          {landing.sections.map((s, i) => (
            <li key={s.id} className={a.item}>
              <div className={a.itemHead}>
                <input type="hidden" name={`pos_${s.id}`} value={i + 1} form="landing" />
                <label className={a.check}>
                  <input type="checkbox" name={`vis_${s.id}`} defaultChecked={s.visible} form="landing" />
                  <b>
                    {i + 1}. {LABEL.get(s.id)}
                  </b>
                </label>
                {!s.visible && <span className={`${a.pill} ${a.pMuted}`}>숨김</span>}
                {EDIT[s.id] && (
                  <Link href={EDIT[s.id].href} className={a.linkBtn}>
                    {EDIT[s.id].label}
                  </Link>
                )}
                <span style={{ marginLeft: "auto" }} className={a.actions}>
                  <form action={moveLanding}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button className={`${a.btn} ${a.btnGhost} ${a.btnSm}`} disabled={i === 0} aria-label={`${LABEL.get(s.id)} 위로`}>
                      ↑
                    </button>
                  </form>
                  <form action={moveLanding}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button className={`${a.btn} ${a.btnGhost} ${a.btnSm}`} disabled={i === landing.sections.length - 1} aria-label={`${LABEL.get(s.id)} 아래로`}>
                      ↓
                    </button>
                  </form>
                </span>
              </div>
            </li>
          ))}
        </ol>
        <div className={a.actions} style={{ marginTop: 12 }}>
          <button type="submit" form="landing" className={a.btn}>
            보이기 설정 저장
          </button>
        </div>
      </section>
    </>
  );
}
