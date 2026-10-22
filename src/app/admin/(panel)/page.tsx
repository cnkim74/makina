import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all, first, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { INQUIRY_STATUS } from "@/lib/types";
import { kstShort } from "@/lib/time";
import { Flash, PageHead } from "../_ui/server";
import a from "../admin.module.css";

type SP = Promise<{ msg?: string; denied?: string }>;

export default async function Dashboard({ searchParams }: { searchParams: SP }) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;

  const count = async (sql: string) => (await first<{ n: number }>(db, sql))?.n ?? 0;
  const [newInq, progInq, views7, calls7, inq7, videos, sns, pending, integ, contact, recent] = await Promise.all([
    count("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'"),
    count("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'in_progress'"),
    count("SELECT COUNT(*) AS n FROM events WHERE type = 'page_view' AND created_at > datetime('now', '-7 days')"),
    count("SELECT COUNT(*) AS n FROM events WHERE type = 'call_click' AND created_at > datetime('now', '-7 days')"),
    count("SELECT COUNT(*) AS n FROM inquiries WHERE created_at > datetime('now', '-7 days')"),
    count("SELECT COUNT(*) AS n FROM videos WHERE visible = 1"),
    count("SELECT COUNT(*) AS n FROM sns_links WHERE visible = 1"),
    count("SELECT COUNT(*) AS n FROM users WHERE status = 'pending'"),
    getSetting(db, "integrations"),
    getSetting(db, "contact"),
    all<{ id: number; name: string; category: string; status: keyof typeof INQUIRY_STATUS; created_at: string }>(
      db,
      "SELECT id, name, category, status, created_at FROM inquiries ORDER BY id DESC LIMIT 5",
    ),
  ]);

  const checks = [
    { ok: videos > 0, label: "유튜브 영상 올리기", href: "/admin/videos" },
    { ok: sns > 0, label: "SNS 채널 연결", href: "/admin/sns" },
    { ok: !!contact.kakaoUrl, label: "카카오톡 채널 주소 넣기", href: "/admin/support" },
    { ok: !!integ.gaId, label: "구글 애널리틱스 연결", href: "/admin/analytics" },
    { ok: !!integ.inquiryWebhook, label: "새 문의 알림 받기 (선택)", href: "/admin/support" },
    { ok: !!integ.channelTalkKey, label: "채널톡 상담 연결 (선택)", href: "/admin/support" },
  ];

  return (
    <>
      <PageHead title={`안녕하세요, ${user.name}님`} desc="홈페이지에 들어온 문의와 방문, 아직 채우지 않은 설정을 한 화면에서 봅니다." />
      <Flash msg={sp.msg} />
      <Flash msg={sp.denied ? "이 메뉴는 관리자 권한이 필요합니다." : undefined} warn />

      <div className={`${a.grid} ${a.cols4}`}>
        <Link href="/admin/inquiries?status=new" className={`${a.card} ${a.stat}`}>
          <span>새 문의</span>
          <b>{newInq}</b>
          <small>처리 중 {progInq}건</small>
        </Link>
        <Link href="/admin/analytics" className={`${a.card} ${a.stat}`}>
          <span>방문 (7일)</span>
          <b>{views7}</b>
          <small>홈페이지 열람 수</small>
        </Link>
        <Link href="/admin/analytics" className={`${a.card} ${a.stat}`}>
          <span>전화 버튼 (7일)</span>
          <b>{calls7}</b>
          <small>문의 접수 {inq7}건</small>
        </Link>
        <Link href={user.role === "editor" ? "/admin" : "/admin/users"} className={`${a.card} ${a.stat}`}>
          <span>가입 승인 대기</span>
          <b>{pending}</b>
          <small>영상 {videos}개 공개 중</small>
        </Link>
      </div>

      <div className={`${a.grid} ${a.cols2}`} style={{ marginTop: 16 }}>
        <section className={a.card}>
          <h2>최근 문의</h2>
          <p className={a.sub}>새 문의는 빨리 전화드릴수록 계약으로 이어집니다.</p>
          {recent.length === 0 ? (
            <p className={a.muted}>아직 들어온 문의가 없습니다.</p>
          ) : (
            <ul className={a.check_list}>
              {recent.map((r) => (
                <li key={r.id}>
                  <span className={`${a.pill} ${r.status === "new" ? a.pNew : r.status === "in_progress" ? a.pProg : a.pDone}`}>
                    {INQUIRY_STATUS[r.status]}
                  </span>
                  <Link href={`/admin/inquiries#q${r.id}`}>
                    {r.name} · {r.category}
                  </Link>
                  <span className={a.muted}>{kstShort(r.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={a.card}>
          <h2>설정 점검</h2>
          <p className={a.sub}>회색 항목을 채우면 홈페이지가 더 많은 일을 합니다.</p>
          <ul className={a.check_list}>
            {checks.map((c) => (
              <li key={c.label}>
                <span className={`${a.dot} ${c.ok ? a.dotOk : a.dotNo}`} aria-hidden="true" />
                <Link href={c.href}>{c.label}</Link>
                <span className={a.muted}>{c.ok ? "완료" : "아직"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
