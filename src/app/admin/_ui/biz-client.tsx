"use client";

import { useMemo, useState } from "react";
import { totals, won, type LineItem, type PriceItem, type VatMode, VAT_MODE } from "@/lib/biz";
import a from "../admin.module.css";

/* 견적서·계약서 화면의 클라이언트 조각: 품목 표(합계 바로 계산), 고객 고르기 */

type Row = { name: string; spec: string; qty: string; price: string };
const blank = (): Row => ({ name: "", spec: "", qty: "1", price: "" });
const digits = (s: string) => s.replace(/[^\d]/g, "");

export function ItemsEditor({
  initial,
  discount: d0 = 0,
  vatMode: v0 = "exclusive",
  pricebook,
}: {
  initial: LineItem[];
  discount?: number;
  vatMode?: VatMode;
  pricebook: PriceItem[];
}) {
  const [rows, setRows] = useState<Row[]>(() => {
    const r = initial.map((it) => ({ name: it.name, spec: it.spec, qty: String(it.qty), price: String(it.price) }));
    return r.length ? r : [blank(), blank()];
  });
  const [discount, setDiscount] = useState(String(d0 || ""));
  const [vat, setVat] = useState<VatMode>(v0);

  const items: LineItem[] = useMemo(
    () =>
      rows
        .filter((r) => r.name.trim())
        .map((r) => ({ name: r.name.trim(), spec: r.spec.trim(), qty: Number(digits(r.qty)) || 0, price: Number(digits(r.price)) || 0 })),
    [rows],
  );
  const t = totals(items, Number(digits(discount)) || 0, vat);

  const set = (i: number, k: keyof Row, v: string) =>
    setRows((rs) =>
      rs.map((r, j) => {
        if (j !== i) return r;
        const next = { ...r, [k]: v };
        // 단가표에 있는 품목을 고르면 규격·단가를 채운다 (이미 적은 단가는 그대로)
        if (k === "name") {
          const p = pricebook.find((x) => x.name === v.trim());
          if (p) {
            if (!r.spec) next.spec = p.spec;
            if (!r.price) next.price = String(p.price);
          }
        }
        return next;
      }),
    );

  return (
    <div className={a.form}>
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <datalist id="pricebook">
        {pricebook.map((p) => (
          <option key={p.name} value={p.name}>
            {p.spec} {p.price ? `· ${won(p.price)}원` : ""}
          </option>
        ))}
      </datalist>
      <div className={a.tableWrap}>
        <table className={`${a.table} ${a.itemsTable}`}>
          <thead>
            <tr>
              <th style={{ width: "30%" }}>품목</th>
              <th>규격 · 내용</th>
              <th style={{ width: 80 }}>수량</th>
              <th style={{ width: 150 }}>단가(원)</th>
              <th style={{ width: 130 }} className={a.num}>
                금액
              </th>
              <th style={{ width: 52 }} aria-label="줄 지우기" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const amt = (Number(digits(r.qty)) || 0) * (Number(digits(r.price)) || 0);
              return (
                <tr key={i}>
                  <td>
                    <input className={a.input} list="pricebook" value={r.name} onChange={(e) => set(i, "name", e.target.value)} placeholder="예: DRAGON 230" aria-label={`${i + 1}번 품목`} />
                  </td>
                  <td>
                    <input className={a.input} value={r.spec} onChange={(e) => set(i, "spec", e.target.value)} aria-label={`${i + 1}번 규격`} />
                  </td>
                  <td>
                    <input className={a.input} inputMode="numeric" value={r.qty} onChange={(e) => set(i, "qty", digits(e.target.value))} aria-label={`${i + 1}번 수량`} />
                  </td>
                  <td>
                    <input
                      className={a.input}
                      inputMode="numeric"
                      value={r.price ? won(Number(r.price)) : ""}
                      onChange={(e) => set(i, "price", digits(e.target.value))}
                      aria-label={`${i + 1}번 단가`}
                    />
                  </td>
                  <td className={a.num}>{amt ? won(amt) : "-"}</td>
                  <td>
                    <button type="button" className={`${a.btn} ${a.btnGhost} ${a.btnSm}`} onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, j) => j !== i) : [blank()]))} aria-label={`${i + 1}번 줄 지우기`}>
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className={a.actions}>
        <button type="button" className={`${a.btn} ${a.btnGhost}`} onClick={() => setRows((rs) => [...rs, blank()])}>
          + 품목 줄 더하기
        </button>
      </div>
      <div className={`${a.row} ${a.row3}`}>
        <label className={a.field}>
          <span>할인 (원)</span>
          <input name="discount" inputMode="numeric" value={discount ? won(Number(digits(discount))) : ""} onChange={(e) => setDiscount(digits(e.target.value))} />
        </label>
        <label className={a.field}>
          <span>부가세</span>
          <select name="vat_mode" value={vat} onChange={(e) => setVat(e.target.value as VatMode)}>
            {(Object.keys(VAT_MODE) as VatMode[]).map((k) => (
              <option key={k} value={k}>
                {VAT_MODE[k]}
              </option>
            ))}
          </select>
        </label>
        <div className={a.sumBox} aria-live="polite">
          <span>
            공급가액 <b>{won(t.supply)}</b>
          </span>
          <span>
            부가세 <b>{won(t.vat)}</b>
          </span>
          <span className={a.sumTotal}>
            합계 <b>{won(t.total)}원</b>
          </span>
        </div>
      </div>
    </div>
  );
}

export type CustomerOpt = { id: number; name: string; phone: string; address: string };

/** 고객 이름을 적으면 등록된 고객 중에서 고를 수 있다. 고르면 전화·주소를 채운다 */
export function CustomerFields({
  customers,
  initial,
  nameLabel = "받는 분 (고객)",
  extra,
}: {
  customers: CustomerOpt[];
  initial: { id: number | null; name: string; phone: string; address: string };
  nameLabel?: string;
  extra?: React.ReactNode;
}) {
  const [id, setId] = useState<number | null>(initial.id);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [addr, setAddr] = useState(initial.address);
  const label = (c: CustomerOpt) => `${c.name} · ${c.phone || "전화 없음"}`;

  return (
    <>
      <input type="hidden" name="customer_id" value={id ?? ""} />
      <datalist id="customers">
        {customers.map((c) => (
          <option key={c.id} value={label(c)} />
        ))}
      </datalist>
      <div className={`${a.row} ${a.row3}`}>
        <label className={a.field}>
          <span>
            {nameLabel} <small>{id ? "· 등록된 고객과 연결됨" : "· 목록에서 고르면 연결"}</small>
          </span>
          <input
            name="customer_name"
            list="customers"
            required
            value={name}
            onChange={(e) => {
              const v = e.target.value;
              const hit = customers.find((c) => label(c) === v);
              if (hit) {
                setId(hit.id);
                setName(hit.name);
                setPhone(hit.phone);
                setAddr(hit.address);
              } else {
                setName(v);
                if (id && customers.find((c) => c.id === id)?.name !== v) setId(null);
              }
            }}
          />
        </label>
        <label className={a.field}>
          <span>전화</span>
          <input name="customer_phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label className={a.field}>
          <span>주소</span>
          <input name="customer_addr" value={addr} onChange={(e) => setAddr(e.target.value)} />
        </label>
      </div>
      {!id && name && (
        <label className={a.check}>
          <input type="checkbox" name="save_customer" defaultChecked />
          “{name}” 님을 고객(회원)으로도 등록
        </label>
      )}
      {extra}
    </>
  );
}

/** 인쇄 버튼 (인쇄 화면에서 PDF 로 저장) */
export function PrintButton() {
  return (
    <button type="button" className={a.btn} onClick={() => window.print()}>
      인쇄 · PDF 저장
    </button>
  );
}
