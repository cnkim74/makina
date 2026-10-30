import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { CONTRACT_STATUS, parseItems, totals, won, type ContractStatus, type VatMode } from "@/lib/biz";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Row = { id: number; doc_no: string; customer_id: number | null; customer_name: string; items: string; discount: number; vat_mode: VatMode; deposit: number; status: ContractStatus; signed_on: string; delivery_date: string };
const PILL: Record<ContractStatus, string> = { draft: a.pMuted, signed: a.pProg, delivered: a.pNew, done: a.pDone, cancelled: a.pMuted };

export default async function Contracts({ searchParams }: { searchParams: Promise<{ msg?: string; status?: string; q?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const status = sp.status && sp.status in CONTRACT_STATUS ? sp.status : "";
  const q = (sp.q ?? "").trim();
  const rows = await all<Row>(
    db,
    `SELECT * FROM contracts WHERE (? = '' OR status = ?) AND (? = '' OR customer_name LIKE ? OR doc_no LIKE ? OR items LIKE ?)
      ORDER BY id DESC LIMIT 300`,
    status, status, q, `%${q}%`, `%${q}%`, `%${q}%`,
  );

  return (
    <>
      <PageHead title="계약서" desc="농기계 매매 계약서를 쓰고 인쇄합니다. 견적서에서 옮기면 품목과 금액이 그대로 들어옵니다. 출고 뒤 “매출로 올리기”를 누르면 매출 장부에 기록됩니다.">
        <Link href="/admin/contracts/new" className={a.btn}>
          + 새 계약서
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
            {(Object.keys(CONTRACT_STATUS) as ContractStatus[]).map((s) => (
              <option key={s} value={s}>
                {CONTRACT_STATUS[s]}
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
              <th className={a.num}>계약 금액</th>
              <th className={a.num}>계약금</th>
              <th>상태</th>
              <th>계약일 · 출고일</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className={a.muted}>
                  계약서가 없습니다.
                </td>
              </tr>
            )}
            {rows.map((r) => {
              const items = parseItems(r.items);
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/contracts/${r.id}`} className={a.rowLink}>
                      {r.doc_no}
                    </Link>
                  </td>
                  <td>{r.customer_id ? <Link href={`/admin/customers/${r.customer_id}`}>{r.customer_name}</Link> : r.customer_name}</td>
                  <td>
                    {items[0]?.name ?? "-"}
                    {items.length > 1 && <span className={a.muted}> 외 {items.length - 1}건</span>}
                  </td>
                  <td className={a.num}>{won(totals(items, r.discount, r.vat_mode).total)}</td>
                  <td className={a.num}>{r.deposit ? won(r.deposit) : "-"}</td>
                  <td>
                    <span className={`${a.pill} ${PILL[r.status]}`}>{CONTRACT_STATUS[r.status]}</span>
                  </td>
                  <td>
                    {r.signed_on || "-"} · {r.delivery_date || "-"}
                  </td>
                  <td>
                    <a href={`/admin/print/contract/${r.id}`} target="_blank" rel="noopener noreferrer" className={a.linkBtn}>
                      인쇄
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
