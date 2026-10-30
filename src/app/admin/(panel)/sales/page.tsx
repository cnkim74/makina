import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all, first, readyDb } from "@/lib/db";
import { PAY_METHODS, SALE_CATEGORY, won, type SaleCategory } from "@/lib/biz";
import { kstToday } from "@/lib/time";
import { deleteSale, saveSale } from "../../biz-actions";
import { ConfirmSubmit, Submit } from "../../_ui/client";
import { customerOptions, ym } from "../../_ui/biz-server";
import { Flash, PageHead } from "../../_ui/server";
import a from "../../admin.module.css";

type Sale = {
  id: number; sold_on: string; customer_id: number | null; customer_name: string; contract_id: number | null; category: SaleCategory;
  item: string; qty: number; amount: number; vat: number; paid: number; method: string; region: string; memo: string;
};

function shift(m: string, n: number) {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export default async function Sales({ searchParams }: { searchParams: Promise<{ msg?: string; m?: string; edit?: string; unpaid?: string }> }) {
  await requireUser("admin");
  const sp = await searchParams;
  const db = (await readyDb())!;
  const month = ym(sp.m, kstToday().slice(0, 7));
  const onlyUnpaid = sp.unpaid === "1";
  const ret = `/admin/sales?m=${month}${onlyUnpaid ? "&unpaid=1" : ""}`;

  const [rows, allUnpaid, customers, edit] = await Promise.all([
    onlyUnpaid
      ? all<Sale>(db, "SELECT * FROM sales WHERE amount + vat > paid ORDER BY sold_on DESC, id DESC LIMIT 500")
      : all<Sale>(db, "SELECT * FROM sales WHERE substr(sold_on, 1, 7) = ? ORDER BY sold_on DESC, id DESC", month),
    first<{ n: number; v: number }>(db, "SELECT COUNT(*) AS n, COALESCE(SUM(amount + vat - paid), 0) AS v FROM sales WHERE amount + vat > paid"),
    customerOptions(db),
    sp.edit ? first<Sale>(db, "SELECT * FROM sales WHERE id = ?", Number(sp.edit)) : null,
  ]);
  const sum = (f: (s: Sale) => number) => rows.reduce((t, s) => t + f(s), 0);
  const supply = sum((s) => s.amount);
  const vat = sum((s) => s.vat);
  const paid = sum((s) => s.paid);
  const byCat = (Object.keys(SALE_CATEGORY) as SaleCategory[]).map((k) => ({
    k,
    v: rows.filter((r) => r.category === k).reduce((t, r) => t + r.amount, 0),
  }));
  const e = edit;

  return (
    <>
      <PageHead title="매출 관리" desc="판매·수금 장부입니다. 계약서에서 “매출로 올리기”를 누르거나 여기서 바로 적습니다. 금액은 공급가(부가세 빼고) 기준입니다.">
        <div className={a.actions}>
          <Link href={`/admin/sales?m=${shift(month, -1)}`} className={`${a.btn} ${a.btnGhost}`} aria-label="이전 달">
            ‹
          </Link>
          <b style={{ fontSize: 20 }}>{onlyUnpaid ? "미수금 전체" : `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`}</b>
          <Link href={`/admin/sales?m=${shift(month, 1)}`} className={`${a.btn} ${a.btnGhost}`} aria-label="다음 달">
            ›
          </Link>
          <Link href={onlyUnpaid ? `/admin/sales?m=${month}` : `/admin/sales?m=${month}&unpaid=1`} className={a.btn}>
            {onlyUnpaid ? "월별 보기" : `미수금 ${allUnpaid?.n ?? 0}건 보기`}
          </Link>
        </div>
      </PageHead>
      <Flash msg={sp.msg} />

      <div className={`${a.grid} ${a.cols4}`}>
        <div className={`${a.card} ${a.stat}`}>
          <span>매출 (공급가)</span>
          <b>{won(supply)}</b>
          <small>부가세 {won(vat)}</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>합계 (부가세 포함)</span>
          <b>{won(supply + vat)}</b>
          <small>{rows.length}건</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>받은 돈</span>
          <b>{won(paid)}</b>
          <small>미수 {won(Math.max(0, supply + vat - paid))}</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>전체 미수금</span>
          <b>{won(allUnpaid?.v ?? 0)}</b>
          <small>{allUnpaid?.n ?? 0}건</small>
        </div>
      </div>
      <p className={a.muted} style={{ margin: "10px 0 16px" }}>
        {byCat.map((c) => `${SALE_CATEGORY[c.k]} ${won(c.v)}`).join(" · ")}
      </p>

      <details className={a.card} style={{ marginBottom: 16 }} open={!!e}>
        <summary>
          <b>{e ? `매출 고치기 (#${e.id})` : "+ 매출 적기"}</b>
        </summary>
        <form action={saveSale} className={a.form} style={{ marginTop: 14 }}>
          <input type="hidden" name="return" value={ret} />
          {e && <input type="hidden" name="id" value={e.id} />}
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>날짜</span>
              <input type="date" name="sold_on" defaultValue={e?.sold_on ?? kstToday()} required />
            </label>
            <label className={a.field}>
              <span>등록 고객</span>
              <select name="customer_id" defaultValue={e?.customer_id ?? ""}>
                <option value="">(고르지 않음)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone && `· ${c.phone}`}
                  </option>
                ))}
              </select>
            </label>
            <label className={a.field}>
              <span>고객 이름 (장부에 남는 이름)</span>
              <input name="customer_name" defaultValue={e?.customer_name} />
            </label>
          </div>
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>구분</span>
              <select name="category" defaultValue={e?.category ?? "machine"}>
                {(Object.keys(SALE_CATEGORY) as SaleCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {SALE_CATEGORY[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className={a.field}>
              <span>품목 *</span>
              <input name="item" required defaultValue={e?.item} placeholder="예: DRAGON 230" />
            </label>
            <label className={a.field}>
              <span>수량</span>
              <input name="qty" inputMode="numeric" defaultValue={e?.qty ?? 1} />
            </label>
          </div>
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>공급가 (원)</span>
              <input name="amount" inputMode="numeric" defaultValue={e?.amount || ""} required />
            </label>
            <label className={a.field}>
              <span>
                부가세 (원) <small>· 비우고 아래 체크하면 10%</small>
              </span>
              <input name="vat" inputMode="numeric" defaultValue={e?.vat || ""} />
            </label>
            <label className={a.field}>
              <span>받은 돈 (원)</span>
              <input name="paid" inputMode="numeric" defaultValue={e?.paid || ""} />
            </label>
          </div>
          <label className={a.check}>
            <input type="checkbox" name="auto_vat" defaultChecked={!e} /> 부가세를 공급가의 10%로 계산
          </label>
          <div className={`${a.row} ${a.row3}`}>
            <label className={a.field}>
              <span>결제 방법</span>
              <select name="method" defaultValue={e?.method ?? ""}>
                <option value="">-</option>
                {PAY_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className={a.field}>
              <span>지역</span>
              <input name="region" defaultValue={e?.region} placeholder="예: 경북 영주" />
            </label>
            <label className={a.field}>
              <span>메모</span>
              <input name="memo" defaultValue={e?.memo} />
            </label>
          </div>
          <div className={a.actions}>
            <Submit>{e ? "저장" : "매출 적기"}</Submit>
            {e && (
              <Link href={ret} className={`${a.btn} ${a.btnGhost}`}>
                취소
              </Link>
            )}
          </div>
        </form>
        {e && (
          <form action={deleteSale} style={{ marginTop: 10 }}>
            <input type="hidden" name="id" value={e.id} />
            <input type="hidden" name="return" value={ret} />
            <ConfirmSubmit message="이 매출 기록을 지울까요?">지우기</ConfirmSubmit>
          </form>
        )}
      </details>

      <div className={a.tableWrap}>
        <table className={a.table}>
          <thead>
            <tr>
              <th>날짜</th>
              <th>고객</th>
              <th>구분</th>
              <th>품목</th>
              <th className={a.num}>수량</th>
              <th className={a.num}>공급가</th>
              <th className={a.num}>부가세</th>
              <th className={a.num}>받은 돈</th>
              <th className={a.num}>미수</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className={a.muted}>
                  {onlyUnpaid ? "미수금이 없습니다." : "이 달 매출 기록이 없습니다."}
                </td>
              </tr>
            )}
            {rows.map((s) => {
              const due = Math.max(0, s.amount + s.vat - s.paid);
              return (
                <tr key={s.id}>
                  <td>{s.sold_on}</td>
                  <td>{s.customer_id ? <Link href={`/admin/customers/${s.customer_id}`}>{s.customer_name || "고객"}</Link> : s.customer_name || "-"}</td>
                  <td>{SALE_CATEGORY[s.category]}</td>
                  <td>
                    {s.item}
                    {s.contract_id && (
                      <Link href={`/admin/contracts/${s.contract_id}`} className={a.muted}>
                        {" "}
                        · 계약
                      </Link>
                    )}
                  </td>
                  <td className={a.num}>{s.qty}</td>
                  <td className={a.num}>{won(s.amount)}</td>
                  <td className={a.num}>{won(s.vat)}</td>
                  <td className={a.num}>{won(s.paid)}</td>
                  <td className={a.num}>{due ? <b>{won(due)}</b> : <span className={a.muted}>완납</span>}</td>
                  <td>
                    <Link href={`${ret}&edit=${s.id}`} className={a.linkBtn}>
                      고치기
                    </Link>
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
