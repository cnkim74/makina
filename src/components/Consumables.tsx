"use client";

import { useState } from "react";
import { consumables } from "@/data/content";
import { site } from "@/data/site";
import { NetRoll, WrapRoll } from "./placeholders";
import s from "./Consumables.module.css";

export default function Consumables() {
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(consumables.map((c) => [c.id, c.defaultQty])),
  );
  const change = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(1, Math.min(999, (q[id] ?? 1) + d)) }));

  return (
    <section className={`sec ${s.sec}`} id="consumables" aria-labelledby="cons-title">
      <div className="wrap">
        <h2 className="sec-title" id="cons-title">
          소모품 빠른 주문
        </h2>
        <p className="sec-sub">수확철엔 네트 한 롤이 하루를 좌우합니다. 수량만 고르시면 됩니다</p>

        <div className={s.cons}>
          {consumables.map((c) => (
            <div key={c.id} className={s.ccard}>
              <div className={s.pic}>{c.id === "net" ? <NetRoll /> : <WrapRoll />}</div>
              <div className={s.b}>
                <h3>{c.name}</h3>
                <div className={s.spec}>
                  <span className={s.long}>{c.spec}</span>
                  <span className={s.short}>{c.specShort}</span>
                </div>
                <div className={s.row}>
                  <div className={s.qty} role="group" aria-label={`${c.name} 수량`}>
                    <button type="button" aria-label="수량 줄이기" onClick={() => change(c.id, -1)}>
                      −
                    </button>
                    <output aria-live="polite">{qty[c.id]}</output>
                    <button type="button" aria-label="수량 늘리기" onClick={() => change(c.id, 1)}>
                      +
                    </button>
                  </div>
                  <a
                    className={`pill pill--dark ${s.btn}`}
                    href={`${site.phoneHref}`}
                    aria-label={`${c.name} ${qty[c.id]}롤 전화 주문`}
                  >
                    <span className={s.long}>주문하기</span>
                    <span className={s.short}>주문</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={s.notice}>
          <span className={s.tag}>수확철 당일 출고</span>
          <span>
            평일 <b>오후 3시 이전</b> 주문 시 다음 날 도착합니다. 전화 한 통이면 바로 출발합니다 —{" "}
            <a href={site.phoneHref}>
              <b>{site.phone}</b>
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
