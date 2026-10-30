import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { first, readyDb } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { site } from "@/data/site";
import { VAT_MODE, parseItems, totals, won, type VatMode } from "@/lib/biz";
import { ItemsTable, Logo, PrintBar, Seller } from "../../doc";
import a from "../../../admin.module.css";

export const dynamic = "force-dynamic";

type C = {
  id: number; doc_no: string; customer_name: string; customer_phone: string; customer_addr: string; customer_birth: string;
  items: string; discount: number; vat_mode: VatMode; deposit: number; deposit_date: string; balance_date: string;
  delivery_date: string; delivery_place: string; warranty: string; special_terms: string; signed_on: string;
};

const blank = "　　년　　월　　일";

export default async function ContractPrint({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const db = await readyDb();
  if (!db) redirect("/admin");
  const { id } = await params;
  const c = await first<C>(db, "SELECT * FROM contracts WHERE id = ?", Number(id));
  if (!c) notFound();
  const contact = await getSetting(db, "contact");
  const items = parseItems(c.items);
  const t = totals(items, c.discount, c.vat_mode);
  const balance = Math.max(0, t.total - c.deposit);
  const d = (s: string) => (s ? s.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1년 $2월 $3일") : blank);

  return (
    <>
      <PrintBar back={`/admin/contracts/${c.id}`} />
      <article className={`${a.doc} ${a.docTight}`}>
        <div className={a.docHead}>
          <Logo />
          <span>No. {c.doc_no}</span>
        </div>
        <h1>농기계 매매 계약서</h1>
        <p>
          매도인 <b>{site.name}</b>(이하 “갑”)과 매수인 <b>{c.customer_name}</b>(이하 “을”)은 아래 농기계의 매매에 관하여 다음과 같이 계약한다.
        </p>
        <h3 style={{ margin: "3mm 0 2mm" }}>1. 계약 목적물 및 금액 ({VAT_MODE[c.vat_mode]})</h3>
        <ItemsTable items={items} discount={c.discount} t={t} />
        <h3 style={{ margin: "3mm 0 2mm" }}>2. 대금 지급</h3>
        <table className={a.docTable}>
          <tbody>
            <tr>
              <th style={{ width: "18%" }}>계약금</th>
              <td className={a.num} style={{ width: "26%" }}>
                {won(c.deposit)}원
              </td>
              <td>{d(c.deposit_date)} 지급</td>
            </tr>
            <tr>
              <th>잔금</th>
              <td className={a.num}>{won(balance)}원</td>
              <td>{d(c.balance_date)} 지급 (인도 시)</td>
            </tr>
          </tbody>
        </table>
        <ol className={a.clauses}>
          <li>
            3. (인도) 갑은 {d(c.delivery_date)}까지 {c.delivery_place || "을이 지정한 장소"}에서 목적물을 을에게 인도하고, 시운전과 사용 방법을 안내한다.
          </li>
          <li>4. (소유권) 목적물의 소유권은 을이 대금을 모두 지급한 때에 을에게 넘어간다.</li>
          <li>
            5. (품질 보증) 갑은 {c.warranty || "출고일로부터 1년"} 동안 정상 사용 중 생긴 제작상의 결함을 무상으로 수리한다. 소모품(칼날·벨트 등)과
            사용자 과실·천재지변으로 인한 고장은 제외한다.
          </li>
          <li>6. (계약 해제) 을이 잔금 지급 전 계약을 해제할 때는 계약금을 포기하고, 갑이 해제할 때는 계약금의 두 배를 을에게 돌려준다.</li>
          <li>7. (기타) 이 계약서에 없는 사항은 관계 법령과 일반 상관례에 따르며, 분쟁이 생기면 서로 협의하여 해결한다.</li>
          {c.special_terms && <li style={{ whiteSpace: "pre-wrap" }}>8. (특약) {c.special_terms}</li>}
        </ol>
        <p style={{ textAlign: "center", margin: "5mm 0 1mm" }}>위 계약을 증명하기 위하여 계약서 2부를 작성하여 각 1부씩 보관한다.</p>
        <p style={{ textAlign: "center", fontWeight: 700 }}>{d(c.signed_on)}</p>
        <div className={a.docSign}>
          <div>
            <b>매도인 (갑)</b>
            <div style={{ marginTop: "3mm" }}>
              <Seller c={contact} />
            </div>
          </div>
          <div>
            <b>매수인 (을)</b>
            <table className={a.docTable} style={{ marginTop: "3mm" }}>
              <tbody>
                <tr>
                  <th>성명</th>
                  <td>
                    {c.customer_name} <span className={a.stamp}>(인)</span>
                  </td>
                </tr>
                <tr>
                  <th>생년월일</th>
                  <td>{c.customer_birth}</td>
                </tr>
                <tr>
                  <th>주소</th>
                  <td>{c.customer_addr}</td>
                </tr>
                <tr>
                  <th>전화</th>
                  <td>{c.customer_phone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </article>
    </>
  );
}
