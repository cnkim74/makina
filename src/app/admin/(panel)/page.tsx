import Link from "next/link";
import { hasRole, requireUser } from "@/lib/auth";
import { all, first, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { INQUIRY_STATUS } from "@/lib/types";
import { kstShort, kstToday } from "@/lib/time";
import { CONTRACT_STATUS, QUOTE_STATUS, parseItems, totals, won, type ContractStatus, type QuoteStatus, type VatMode } from "@/lib/biz";
import { manwon } from "../_ui/server";
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

  const month = kstToday().slice(0, 7);
  const year = month.slice(0, 4);
  const sum = async (sql: string, ...p: unknown[]) => (await first<{ v: number }>(db, sql, ...p))?.v ?? 0;
  const [mSales, unpaid, yearSales, yearTarget, openQuotes, waitDelivery, customers, upcoming, recentQuotes] = await Promise.all([
    sum("SELECT COALESCE(SUM(amount), 0) AS v FROM sales WHERE substr(sold_on, 1, 7) = ?", month),
    sum("SELECT COALESCE(SUM(amount + vat - paid), 0) AS v FROM sales WHERE amount + vat > paid"),
    sum("SELECT COALESCE(SUM(amount), 0) AS v FROM sales WHERE substr(sold_on, 1, 4) = ?", year),
    sum("SELECT COALESCE(amount, 0) AS v FROM targets WHERE year = ? AND item = '전체'", Number(year)),
    count("SELECT COUNT(*) AS n FROM quotes WHERE status IN ('draft', 'sent')"),
    count("SELECT COUNT(*) AS n FROM contracts WHERE status = 'signed'"),
    count("SELECT COUNT(*) AS n FROM customers"),
    all<{ id: number; doc_no: string; customer_name: string; delivery_date: string; status: ContractStatus }>(
      db,
      "SELECT id, doc_no, customer_name, delivery_date, status FROM contracts WHERE status IN ('signed', 'draft') AND delivery_date <> '' ORDER BY delivery_date LIMIT 5",
    ),
    all<{ id: number; doc_no: string; customer_name: string; items: string; discount: number; vat_mode: VatMode; status: QuoteStatus }>(
      db,
      "SELECT id, doc_no, customer_name, items, discount, vat_mode, status FROM quotes ORDER BY id DESC LIMIT 5",
    ),
  ]);
  const isAdmin = hasRole(user, "admin");

  const checks = [
    { ok: videos > 0, label: "유튜브 영상 올리기", href: "/admin/videos" },
    { ok: sns > 0, label: "SNS 채널 연결", href: "/admin/sns" },
    { ok: !!contact.kakaoUrl, label: "카카오톡 채널 주소 넣기", href: "/admin/support" },
    { ok: !!integ.gaId, label: "구글 애널리틱스 연결", href: "/admin/analytics" },
    { ok: !!integ.gaPropertyId, label: "GA4 보고서를 관리자에서 보기 (선택)", href: "/admin/analytics#ga-report" },
    { ok: !!integ.inquiryWebhook, label: "새 문의 알림 받기 (선택)", href: "/admin/support" },
    { ok: !!integ.channelTalkKey, label: "채널톡 상담 연결 (선택)", href: "/admin/support" },
  ];

  return (
    <>
      <PageHead title={`안녕하세요, ${user.name}님`} desc="영업(매출·견적·출고)과 홈페이지(문의·방문), 아직 채우지 않은 설정을 한 화면에서 봅니다." />
      <Flash msg={sp.msg} />
      <Flash msg={sp.denied ? "이 메뉴는 관리자 권한이 필요합니다." : undefined} warn />

      <h2 style={{ margin: "0 0 12px", fontSize: 20 }}>영업</h2>
      <div className={`${a.grid} ${a.cols4}`}>
        {isAdmin ? (
          <Link href="/admin/sales" className={`${a.card} ${a.stat}`}>
            <span>이번 달 매출</span>
            <b>{manwon(mSales)}</b>
            <small>공급가 {won(mSales)}원</small>
          </Link>
        ) : (
          <Link href="/admin/customers" className={`${a.card} ${a.stat}`}>
            <span>등록 고객</span>
            <b>{customers}</b>
            <small>회원(고객) 관리</small>
          </Link>
        )}
        {isAdmin ? (
          <Link href="/admin/sales?unpaid=1" className={`${a.card} ${a.stat}`}>
            <span>미수금</span>
            <b>{manwon(unpaid)}</b>
            <small>받을 돈 전체</small>
          </Link>
        ) : (
          <Link href="/admin/cards" className={`${a.card} ${a.stat}`}>
            <span>네임카드</span>
            <b>정리</b>
            <small>받은 명함 올리기</small>
          </Link>
        )}
        <Link href="/admin/quotes?status=sent" className={`${a.card} ${a.stat}`}>
          <span>진행 중 견적</span>
          <b>{openQuotes}</b>
          <small>작성 중·보냄</small>
        </Link>
        {isAdmin ? (
          <Link href="/admin/performance" className={`${a.card} ${a.stat}`}>
            <span>올해 목표 달성</span>
            <b>{yearTarget ? `${Math.round((yearSales / yearTarget) * 100)}%` : manwon(yearSales)}</b>
            <small>{yearTarget ? `${manwon(yearSales)} / ${manwon(yearTarget)}` : "올해 매출 · 목표 미설정"}</small>
          </Link>
        ) : (
          <Link href="/admin/contracts?status=signed" className={`${a.card} ${a.stat}`}>
            <span>출고 대기 계약</span>
            <b>{waitDelivery}</b>
            <small>계약 체결 상태</small>
          </Link>
        )}
      </div>

      <div className={`${a.grid} ${a.cols2}`} style={{ marginTop: 16 }}>
        <section className={a.card}>
          <h2>다가오는 출고</h2>
          <p className={a.sub}>계약서의 인도 날짜 순서입니다. 출고 대기 {waitDelivery}건.</p>
          <ul className={a.check_list}>
            {upcoming.length === 0 && <li className={a.muted}>인도 날짜가 적힌 계약이 없습니다.</li>}
            {upcoming.map((c) => (
              <li key={c.id}>
                <span className={`${a.pill} ${a.pProg}`}>{c.delivery_date.slice(5).replace("-", ".")}</span>
                <Link href={`/admin/contracts/${c.id}`}>
                  {c.customer_name} · {c.doc_no}
                </Link>
                <span className={a.muted}>{CONTRACT_STATUS[c.status]}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className={a.card}>
          <h2>최근 견적</h2>
          <p className={a.sub}>
            <Link href="/admin/quotes/new">+ 새 견적서</Link>
          </p>
          <ul className={a.check_list}>
            {recentQuotes.length === 0 && <li className={a.muted}>아직 견적서가 없습니다.</li>}
            {recentQuotes.map((q) => (
              <li key={q.id}>
                <span className={`${a.pill} ${a.pMuted}`}>{QUOTE_STATUS[q.status]}</span>
                <Link href={`/admin/quotes/${q.id}`}>
                  {q.customer_name} · {q.doc_no}
                </Link>
                <span className={a.muted}>{won(totals(parseItems(q.items), q.discount, q.vat_mode).total)}원</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <h2 style={{ margin: "28px 0 12px", fontSize: 20 }}>홈페이지</h2>
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
