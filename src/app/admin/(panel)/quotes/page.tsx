import Link from "next/link";
import { hasRole, requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { QUOTE_STATUS, parseItems, totals, won, type QuoteStatus, type VatMode } from "@/lib/biz";
import { kstDate } from "@/lib/time";
import { savePricebook } from "../../biz-actions";
import { Submit } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Row = { id: number; doc_no: string; customer_id: number | null; customer_name: string; title: string; items: string; discount: number; vat_mode: VatMode; status: QuoteStatus; valid_until: string; created_at: string; created_by: string };
const PILL: Record<QuoteStatus, string> = { draft: a.pMuted, sent: a.pProg, won: a.pDone, lost: a.pNew };

export default async function Quotes({ searchParams }: { searchParams: Promise<{ msg?: string; status?: string; q?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const status = sp.status && sp.status in QUOTE_STATUS ? sp.status : "";
  const q = (sp.q ?? "").trim();
  const [rows, book] = await Promise.all([
    all<Row>(
      db,
      `SELECT * FROM quotes WHERE (? = '' OR status = ?) AND (? = '' OR customer_name LIKE ? OR doc_no LIKE ? OR title LIKE ? OR items LIKE ?)
        ORDER BY id DESC LIMIT 300`,
      status, status, q, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`,
    ),
    getSetting(db, "pricebook"),
  ]);

  return (
    <>
      <PageHead title="견적서" desc="품목을 고르면 단가표 금액이 채워지고 합계가 바로 계산됩니다. 인쇄 화면에서 PDF 로 저장해 문자·카톡으로 보내세요.">
        <Link href="/admin/quotes/new" className={a.btn}>
          + 새 견적서
        </Link>
      </PageHead>
      <Flash msg={sp.msg} />

      <form className={a.search} role="search">
        <label className={a.field}>
          <span>찾기</span>
          <input name="q" defaultValue={q} placeholder="고객·번호·품목" />
        </label>
        <label className={a.field}>
          <span>상태</span>
          <select name="status" defaultValue={status}>
            <option value="">전체</option>
            {(Object.keys(QUOTE_STATUS) as QuoteStatus[]).map((s) => (
              <option key={s} value={s}>
                {QUOTE_STATUS[s]}
              </option>
            ))}
          </select>
        </label>
        <button className={a.btn} type="submit">
          찾기
        </button>
      </form>

      <div className={a.tableWrap}>
        <table className={a.table}>
          <thead>
            <tr>
              <th>번호</th>
              <th>고객</th>
              <th>품목</th>
              <th className={a.num}>합계</th>
              <th>상태</th>
              <th>작성</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className={a.muted}>
                  견적서가 없습니다. “새 견적서”로 시작하세요.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const items = parseItems(r.items);
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/quotes/${r.id}`} className={a.rowLink}>
                      {r.doc_no}
                    </Link>
                  </td>
                  <td>{r.customer_id ? <Link href={`/admin/customers/${r.customer_id}`}>{r.customer_name}</Link> : r.customer_name}</td>
                  <td>
                    {items[0]?.name ?? "-"}
                    {items.length > 1 && <span className={a.muted}> 외 {items.length - 1}건</span>}
                  </td>
                  <td className={a.num}>{won(totals(items, r.discount, r.vat_mode).total)}</td>
                  <td>
                    <span className={`${a.pill} ${PILL[r.status]}`}>{QUOTE_STATUS[r.status]}</span>
                  </td>
                  <td>
                    {kstDate(r.created_at)}
                    {r.created_by && <span className={a.muted}> · {r.created_by}</span>}
                  </td>
                  <td>
                    <a href={`/admin/print/quote/${r.id}`} target="_blank" rel="noopener noreferrer" className={a.linkBtn}>
                      인쇄
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>단가표</h2>
        <p className={a.sub}>견적서·계약서에서 품목 이름을 고르면 규격과 단가가 자동으로 들어갑니다. 한 줄에 “품목 | 규격 | 단가”. 홈페이지에는 나가지 않습니다.</p>
        {hasRole(user, "admin") ? (
          <form action={savePricebook} className={a.form}>
            <label className={a.field}>
              <span>품목 | 규격 | 단가(원)</span>
              <textarea
                name="lines"
                rows={8}
                defaultValue={book.items.map((p) => `${p.name} | ${p.spec} | ${p.price}`).join("\n")}
                placeholder={"DRAGON 230 | 작업 폭 2.3m, 칼날 48개 | 0\n파쇄 칼날 | DRAGON 전용 1조 | 0"}
              />
            </label>
            <div className={a.actions}>
              <Submit>단가표 저장</Submit>
            </div>
          </form>
        ) : (
          <ul className={a.check_list}>
            {book.items.length === 0 && <li className={a.muted}>아직 비어 있습니다. 관리자가 채웁니다.</li>}
            {book.items.map((p) => (
              <li key={p.name}>
                <b>{p.name}</b>
                <span className={a.muted}>
                  {p.spec} · {won(p.price)}원
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
