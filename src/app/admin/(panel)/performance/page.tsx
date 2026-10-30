import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { all, readyDb } from "@/lib/db";
import { SALE_CATEGORY, won, type SaleCategory } from "@/lib/biz";
import { kstToday } from "@/lib/time";
import { saveTargets } from "../../biz-actions";
import { Submit } from "../../_ui/client";
import { Flash, LabeledBars, PageHead, manwon } from "../../_ui/server";
import a from "../../admin.module.css";

type Target = { item: string; qty: number; amount: number };
type Agg = { item: string; qty: number; amount: number };

export default async function Performance({ searchParams }: { searchParams: Promise<{ msg?: string; year?: string }> }) {
  await requireUser("admin");
  const sp = await searchParams;
  const db = (await readyDb())!;
  const thisYear = Number(kstToday().slice(0, 4));
  const year = Number(sp.year) >= 2020 && Number(sp.year) <= 2100 ? Number(sp.year) : thisYear;
  const y = String(year);

  const [targets, byItem, byMonth, byRegion, byCat, topCustomers] = await Promise.all([
    all<Target>(db, "SELECT item, qty, amount FROM targets WHERE year = ? ORDER BY item", year),
    all<Agg>(db, "SELECT item, SUM(qty) AS qty, SUM(amount) AS amount FROM sales WHERE substr(sold_on, 1, 4) = ? GROUP BY item ORDER BY amount DESC", y),
    all<{ m: string; v: number; n: number }>(
      db,
      "SELECT substr(sold_on, 6, 2) AS m, SUM(amount) AS v, SUM(CASE WHEN category = 'machine' THEN qty ELSE 0 END) AS n FROM sales WHERE substr(sold_on, 1, 4) = ? GROUP BY m",
      y,
    ),
    all<{ region: string; qty: number; amount: number }>(
      db,
      `SELECT CASE WHEN region = '' THEN '(지역 없음)' ELSE region END AS region, SUM(CASE WHEN category = 'machine' THEN qty ELSE 0 END) AS qty, SUM(amount) AS amount
         FROM sales WHERE substr(sold_on, 1, 4) = ? GROUP BY 1 ORDER BY amount DESC LIMIT 10`,
      y,
    ),
    all<{ category: SaleCategory; amount: number }>(db, "SELECT category, SUM(amount) AS amount FROM sales WHERE substr(sold_on, 1, 4) = ? GROUP BY category", y),
    all<{ name: string; id: number | null; amount: number }>(
      db,
      `SELECT COALESCE(NULLIF(customer_name, ''), '(이름 없음)') AS name, customer_id AS id, SUM(amount) AS amount
         FROM sales WHERE substr(sold_on, 1, 4) = ? GROUP BY customer_id, customer_name ORDER BY amount DESC LIMIT 5`,
      y,
    ),
  ]);

  const actual = new Map(byItem.map((r) => [r.item, r]));
  const totalAmount = byItem.reduce((s, r) => s + r.amount, 0);
  const totalTarget = targets.find((t) => t.item === "전체");
  const rows = [
    ...targets.filter((t) => t.item !== "전체"),
    ...byItem.filter((r) => !targets.some((t) => t.item === r.item)).map((r) => ({ item: r.item, qty: 0, amount: 0 })),
  ];
  const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : null);
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, "0");
    const hit = byMonth.find((x) => x.m === m);
    return { key: m, label: `${i + 1}월`, v: hit?.v ?? 0, n: hit?.n ?? 0 };
  });

  return (
    <>
      <PageHead title="실적 관리" desc="연간 목표와 매출 장부를 맞대어 봅니다. 금액은 공급가(부가세 빼고) 기준, 대수는 본기만 셉니다.">
        <div className={a.actions}>
          <Link href={`/admin/performance?year=${year - 1}`} className={`${a.btn} ${a.btnGhost}`} aria-label="이전 해">
            ‹
          </Link>
          <b style={{ fontSize: 20 }}>{year}년</b>
          <Link href={`/admin/performance?year=${year + 1}`} className={`${a.btn} ${a.btnGhost}`} aria-label="다음 해">
            ›
          </Link>
        </div>
      </PageHead>
      <Flash msg={sp.msg} />

      <div className={`${a.grid} ${a.cols4}`}>
        <div className={`${a.card} ${a.stat}`}>
          <span>올해 매출</span>
          <b>{manwon(totalAmount)}</b>
          <small>{won(totalAmount)}원</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>목표 달성</span>
          <b>{totalTarget?.amount ? `${pct(totalAmount, totalTarget.amount)}%` : "-"}</b>
          <small>{totalTarget?.amount ? `목표 ${manwon(totalTarget.amount)}` : "“전체” 목표를 적으면 계산"}</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>본기 판매</span>
          <b>{months.reduce((s, m) => s + m.n, 0)}대</b>
          <small>{totalTarget?.qty ? `목표 ${totalTarget.qty}대` : "　"}</small>
        </div>
        <div className={`${a.card} ${a.stat}`}>
          <span>구분별</span>
          <b style={{ fontSize: 16, lineHeight: 1.5 }}>
            {byCat.length ? byCat.map((c) => `${SALE_CATEGORY[c.category]} ${manwon(c.amount)}`).join(" · ") : "-"}
          </b>
        </div>
      </div>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>월별 매출</h2>
        <LabeledBars data={months} label="매출" fmt={manwon} />
      </section>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>품목별 목표 대비</h2>
        <div className={a.tableWrap}>
          <table className={a.table}>
            <thead>
              <tr>
                <th>품목</th>
                <th className={a.num}>대수 (실적 / 목표)</th>
                <th className={a.num}>금액 (실적 / 목표)</th>
                <th style={{ width: "30%" }}>달성</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className={a.muted}>
                    아래에 목표를 적거나 매출을 올리면 여기에 나타납니다.
                  </td>
                </tr>
              )}
              {rows.map((t) => {
                const r = actual.get(t.item);
                const p = pct(r?.amount ?? 0, t.amount) ?? pct(r?.qty ?? 0, t.qty);
                return (
                  <tr key={t.item}>
                    <td>{t.item}</td>
                    <td className={a.num}>
                      {r?.qty ?? 0} / {t.qty || "-"}
                    </td>
                    <td className={a.num}>
                      {manwon(r?.amount ?? 0)} / {t.amount ? manwon(t.amount) : "-"}
                    </td>
                    <td>
                      {p === null ? (
                        <span className={a.muted}>목표 없음</span>
                      ) : (
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <div className={a.meter} style={{ flex: 1 }} role="img" aria-label={`${p}% 달성`}>
                            <i style={{ width: `${Math.min(100, p)}%` }} />
                          </div>
                          <b>{p}%</b>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className={`${a.grid} ${a.cols2}`} style={{ marginTop: 16 }}>
        <section className={a.card}>
          <h2>지역별</h2>
          <ul className={a.check_list}>
            {byRegion.length === 0 && <li className={a.muted}>기록 없음</li>}
            {byRegion.map((r) => (
              <li key={r.region}>
                <b>{r.region}</b>
                <span className={a.muted}>
                  {r.qty}대 · {manwon(r.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className={a.card}>
          <h2>많이 산 고객</h2>
          <ul className={a.check_list}>
            {topCustomers.length === 0 && <li className={a.muted}>기록 없음</li>}
            {topCustomers.map((c, i) => (
              <li key={`${c.id}-${c.name}-${i}`}>
                {c.id ? <Link href={`/admin/customers/${c.id}`}>{c.name}</Link> : <b>{c.name}</b>}
                <span className={a.muted}>{manwon(c.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={a.card} style={{ marginTop: 16 }}>
        <h2>{year}년 목표</h2>
        <p className={a.sub}>한 줄에 “품목 | 대수 | 금액(원)”. 품목 이름은 매출 장부의 품목과 똑같이 적습니다. 회사 전체 목표는 품목을 “전체”로.</p>
        <form action={saveTargets} className={a.form}>
          <input type="hidden" name="year" value={year} />
          <label className={a.field}>
            <span>품목 | 대수 | 금액</span>
            <textarea
              name="lines"
              rows={7}
              defaultValue={targets.map((t) => `${t.item} | ${t.qty} | ${t.amount}`).join("\n")}
              placeholder={"전체 | 40 | 1500000000\nDRAGON 230 | 15 | 0\nDRAGON 280 | 10 | 0"}
            />
          </label>
          <div className={a.actions}>
            <Submit>목표 저장</Submit>
          </div>
        </form>
      </section>
    </>
  );
}
