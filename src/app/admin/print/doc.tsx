import { CompanyLogo } from "@/components/Logo";
import { site } from "@/data/site";
import { won, wonHangul, type LineItem } from "@/lib/biz";
import type { ContactSettings } from "@/lib/types";
import { PrintButton } from "../_ui/biz-client";
import a from "../admin.module.css";

/* 견적서·계약서 인쇄 화면의 공통 조각 (A4 세로) */

export function PrintBar({ back }: { back: string }) {
  return (
    <div className={a.printBar}>
      <PrintButton />
      <a href={back} className={`${a.btn} ${a.btnGhost}`}>
        돌아가기
      </a>
    </div>
  );
}

export function Seller({ c }: { c: ContactSettings }) {
  return (
    <table className={a.docTable}>
      <tbody>
        <tr>
          <th>상호</th>
          <td>
            {site.name} ({site.nameEn})
          </td>
        </tr>
        <tr>
          <th>대표</th>
          <td>
            {c.ceo} <span className={a.stamp}>(인)</span>
          </td>
        </tr>
        <tr>
          <th>사업자번호</th>
          <td>{/^0{3}-/.test(c.bizNo) ? "" : c.bizNo}</td>
        </tr>
        <tr>
          <th>주소</th>
          <td>{c.address}</td>
        </tr>
        <tr>
          <th>전화</th>
          <td>
            {c.phone}
            {c.phone2 ? ` · ${c.phone2}` : ""}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function Logo() {
  return <CompanyLogo height={34} title={site.name} />;
}

export function ItemsTable({ items, discount, t }: { items: LineItem[]; discount: number; t: { supply: number; vat: number; total: number } }) {
  return (
    <>
      <p className={a.docTotal} style={{ margin: "0 0 3mm" }}>
        합계 금액 : 일금 {wonHangul(t.total)}원정 (₩{won(t.total)})
      </p>
      <table className={a.docTable}>
        <thead>
          <tr>
            <th style={{ width: "6%" }}>No</th>
            <th>품목</th>
            <th>규격 · 내용</th>
            <th style={{ width: "8%" }} className={a.num}>
              수량
            </th>
            <th style={{ width: "15%" }} className={a.num}>
              단가
            </th>
            <th style={{ width: "17%" }} className={a.num}>
              금액
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{it.name}</td>
              <td>{it.spec}</td>
              <td className={a.num}>{it.qty}</td>
              <td className={a.num}>{won(it.price)}</td>
              <td className={a.num}>{won(it.qty * it.price)}</td>
            </tr>
          ))}
          {discount > 0 && (
            <tr>
              <td />
              <td colSpan={4}>할인</td>
              <td className={a.num}>-{won(discount)}</td>
            </tr>
          )}
          <tr>
            <th colSpan={5}>공급가액</th>
            <td className={a.num}>{won(t.supply)}</td>
          </tr>
          <tr>
            <th colSpan={5}>부가세</th>
            <td className={a.num}>{won(t.vat)}</td>
          </tr>
          <tr>
            <th colSpan={5}>합계</th>
            <td className={`${a.num} ${a.docTotal}`}>{won(t.total)}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
