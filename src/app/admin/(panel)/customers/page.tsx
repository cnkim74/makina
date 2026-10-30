import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { GRADE, type Grade } from "@/lib/biz";
import { kstDate } from "@/lib/time";
import { saveCustomer } from "../../biz-actions";
import { Submit } from "../../_ui/client";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";
import { CustomerForm } from "./form";

type Row = { id: number; name: string; phone: string; region: string; farm: string; tractor: string; grade: Grade; updated_at: string; sales: number };
type SP = Promise<{ msg?: string; q?: string; grade?: string }>;

export default async function Customers({ searchParams }: { searchParams: SP }) {
  await requireUser();
  const sp = await searchParams;
  const db = (await readyDb())!;
  const q = (sp.q ?? "").trim();
  const grade = sp.grade && sp.grade in GRADE ? (sp.grade as Grade) : "";
  const like = `%${q}%`;
  const rows = await all<Row>(
    db,
    `SELECT c.id, c.name, c.phone, c.region, c.farm, c.tractor, c.grade, c.updated_at,
            (SELECT COALESCE(SUM(amount + vat), 0) FROM sales s WHERE s.customer_id = c.id) AS sales
       FROM customers c
      WHERE (? = '' OR c.name LIKE ? OR c.phone LIKE ? OR c.region LIKE ? OR c.address LIKE ? OR c.farm LIKE ? OR c.machines LIKE ?)
        AND (? = '' OR c.grade = ?)
      ORDER BY c.updated_at DESC LIMIT 300`,
    q, like, like, like, like, like, like, grade, grade,
  );
  const counts = await all<{ grade: Grade; n: number }>(db, "SELECT grade, COUNT(*) AS n FROM customers GROUP BY grade");
  const total = counts.reduce((s, c) => s + c.n, 0);

  return (
    <>
      <PageHead title="회원(고객) 관리" desc="상담·구매 고객을 한곳에 모읍니다. 견적서·계약서·매출과 이어져, 고객을 열면 지금까지의 거래가 함께 보입니다." />
      <Flash msg={sp.msg} />

      <form className={a.search} role="search">
        <label className={a.field}>
          <span>찾기</span>
          <input name="q" defaultValue={q} placeholder="이름·전화·지역·농장·보유 기계" />
        </label>
        <label className={a.field}>
          <span>구분</span>
          <select name="grade" defaultValue={grade}>
            <option value="">전체 ({total})</option>
            {(Object.keys(GRADE) as Grade[]).map((g) => (
              <option key={g} value={g}>
                {GRADE[g]} ({counts.find((c) => c.grade === g)?.n ?? 0})
              </option>
            ))}
          </select>
        </label>
        <button className={a.btn} type="submit">
          찾기
        </button>
      </form>

      <details className={a.card} style={{ marginBottom: 16 }} open={total === 0}>
        <summary>
          <b>+ 새 고객 등록</b>
        </summary>
        <form action={saveCustomer} className={a.form} style={{ marginTop: 14 }}>
          <CustomerForm />
          <div className={a.actions}>
            <Submit>등록</Submit>
          </div>
        </form>
      </details>

      <div className={a.tableWrap}>
        <table className={a.table}>
          <thead>
            <tr>
              <th>이름</th>
              <th>전화</th>
              <th>지역</th>
              <th>농장 · 트랙터</th>
              <th>구분</th>
              <th className={a.num}>누적 매출</th>
              <th>최근 수정</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className={a.muted}>
                  {q || grade ? "찾는 고객이 없습니다." : "아직 등록한 고객이 없습니다. 위에서 등록하거나 네임카드·견적서에서 바로 등록할 수 있습니다."}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/admin/customers/${r.id}`} className={a.rowLink}>
                    {r.name}
                  </Link>
                </td>
                <td>{r.phone ? <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}>{r.phone}</a> : "-"}</td>
                <td>{r.region || "-"}</td>
                <td>{[r.farm, r.tractor].filter(Boolean).join(" · ") || "-"}</td>
                <td>
                  <span className={`${a.pill} ${r.grade === "vip" ? a.pProg : r.grade === "prospect" ? a.pNew : a.pMuted}`}>{GRADE[r.grade]}</span>
                </td>
                <td className={a.num}>{r.sales ? r.sales.toLocaleString("ko-KR") : "-"}</td>
                <td>{kstDate(r.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
