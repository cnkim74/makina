import Link from "next/link";
import { notFound } from "next/navigation";
import { hasRole, requireUser } from "@/lib/auth";
import { all, first, readyDb } from "@/lib/db";
import { CONTRACT_STATUS, QUOTE_STATUS, SALE_CATEGORY, parseItems, totals, won, type ContractStatus, type QuoteStatus, type SaleCategory, type VatMode } from "@/lib/biz";
import { kstDate } from "@/lib/time";
import { deleteCustomer, saveCustomer } from "../../../biz-actions";
import { ConfirmSubmit, Submit } from "../../../_ui/client";
import { Flash, PageHead } from "../../../_ui/server";
import a from "../../../admin.module.css";
import { CustomerForm, type CustomerRow } from "../form";

type Doc = { id: number; doc_no: string; items: string; discount: number; vat_mode: VatMode; created_at: string };

export default async function Customer({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const db = (await readyDb())!;
  const c = await first<CustomerRow & { created_at: string }>(db, "SELECT * FROM customers WHERE id = ?", Number(id));
  if (!c) notFound();
  const [quotes, contracts, sales] = await Promise.all([
    all<Doc & { status: QuoteStatus }>(db, "SELECT id, doc_no, items, discount, vat_mode, status, created_at FROM quotes WHERE customer_id = ? ORDER BY id DESC", c.id),
    all<Doc & { status: ContractStatus }>(db, "SELECT id, doc_no, items, discount, vat_mode, status, created_at FROM contracts WHERE customer_id = ? ORDER BY id DESC", c.id),
    all<{ id: number; sold_on: string; category: SaleCategory; item: string; qty: number; amount: number; vat: number; paid: number }>(
      db,
      "SELECT id, sold_on, category, item, qty, amount, vat, paid FROM sales WHERE customer_id = ? ORDER BY sold_on DESC",
      c.id,
    ),
  ]);
  const sum = sales.reduce((s, r) => s + r.amount + r.vat, 0);
  const unpaid = sales.reduce((s, r) => s + Math.max(0, r.amount + r.vat - r.paid), 0);
  const docTotal = (d: Doc) => totals(parseItems(d.items), d.discount, d.vat_mode).total;

  return (
    <>
      <PageHead title={c.name} desc={`등록 ${kstDate(c.created_at)} · 누적 매출 ${won(sum)}원${unpaid ? ` · 미수금 ${won(unpaid)}원` : ""}`}>
        <div className={a.actions}>
          <Link href={`/admin/quotes/new?customer=${c.id}`} className={a.btn}>
            견적서 쓰기
          </Link>
          <Link href={`/admin/contracts/new?customer=${c.id}`} className={`${a.btn} ${a.btnGhost}`}>
            계약서 쓰기
          </Link>
          <Link href="/admin/customers" className={`${a.btn} ${a.btnGhost}`}>
            목록
          </Link>
        </div>
      </PageHead>
      <Flash msg={sp.msg} />

      <section className={a.card}>
        <form action={saveCustomer} className={a.form}>
          <CustomerForm c={c} />
          <div className={a.actions}>
            <Submit>저장</Submit>
          </div>
        </form>
        {hasRole(user, "admin") && (
          <form action={deleteCustomer} style={{ marginTop: 12 }}>
            <input type="hidden" name="id" value={c.id} />
            <ConfirmSubmit message={`${c.name} 고객을 지울까요? 견적·계약·매출 기록은 이름만 남습니다.`}>고객 지우기</ConfirmSubmit>
          </form>
        )}
      </section>

      <div className={`${a.grid} ${a.cols2}`} style={{ marginTop: 16 }}>
        <section className={a.card}>
          <h2>견적서 ({quotes.length})</h2>
          <ul className={a.check_list}>
            {quotes.length === 0 && <li className={a.muted}>없음</li>}
            {quotes.map((q) => (
              <li key={q.id}>
                <span className={`${a.pill} ${a.pMuted}`}>{QUOTE_STATUS[q.status]}</span>
                <Link href={`/admin/quotes/${q.id}`}>{q.doc_no}</Link>
                <span className={a.muted}>
                  {won(docTotal(q))}원 · {kstDate(q.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className={a.card}>
          <h2>계약서 ({contracts.length})</h2>
          <ul className={a.check_list}>
            {contracts.length === 0 && <li className={a.muted}>없음</li>}
            {contracts.map((q) => (
              <li key={q.id}>
                <span className={`${a.pill} ${a.pMuted}`}>{CONTRACT_STATUS[q.status]}</span>
                <Link href={`/admin/contracts/${q.id}`}>{q.doc_no}</Link>
                <span className={a.muted}>
                  {won(docTotal(q))}원 · {kstDate(q.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>매출 ({sales.length})</h2>
        <div className={a.tableWrap}>
          <table className={a.table}>
            <thead>
              <tr>
                <th>날짜</th>
                <th>구분</th>
                <th>품목</th>
                <th className={a.num}>수량</th>
                <th className={a.num}>합계(부가세 포함)</th>
                <th className={a.num}>받은 돈</th>
                <th className={a.num}>미수</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 && (
                <tr>
                  <td colSpan={7} className={a.muted}>
                    매출 기록이 없습니다.
                  </td>
                </tr>
              )}
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>{s.sold_on}</td>
                  <td>{SALE_CATEGORY[s.category]}</td>
                  <td>{s.item}</td>
                  <td className={a.num}>{s.qty}</td>
                  <td className={a.num}>{won(s.amount + s.vat)}</td>
                  <td className={a.num}>{won(s.paid)}</td>
                  <td className={a.num}>{won(Math.max(0, s.amount + s.vat - s.paid))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
