"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { consumables } from "@/data/content";
import { openInquiry } from "@/lib/inquiry";
import { useSite } from "./SiteData";
import s from "./Consumables.module.css";

export default function Consumables() {
  const site = useSite();
  const [qty, setQty] = useState<Record<string, number>>(
    Object.fromEntries(consumables.map((c) => [c.id, c.defaultQty])),
  );
  const change = (id: string, d: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(1, Math.min(999, (q[id] ?? 1) + d)) }));

  return (
    <section className="mod mod--alt" id="consumables" aria-labelledby="cons-title">
      <div className="mod-in">
        <span className="lab-k">소모품</span>
        <h2 id="cons-title">멈추지 않게, 바로 보내 드립니다.</h2>
        <p className="tag">수확철엔 칼날 하나, 벨트 하나가 하루를 좌우합니다. 수량만 고르시면 모델에 맞춰 보내 드립니다.</p>

        <div className={s.grid}>
          {consumables.map((c) => (
            <div key={c.id} className={`tile ${s.tile}`}>
              <div className={s.art}>
                <img src={c.image} alt={`${c.name} 사진`} loading="lazy" />
              </div>
              <h3>{c.name}</h3>
              <p className={s.spec}>{c.spec}</p>
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
                <span className={s.unit}>{c.unit}</span>
              </div>
              <a
                className={`btn btn--dark ${s.order}`}
                href={site.phoneHref}
                aria-label={`${c.name} ${qty[c.id]}${c.unit} 전화로 주문`}
              >
                {qty[c.id]}{c.unit} 전화 주문
              </a>
            </div>
          ))}

          <div className={`tile ${s.notice}`}>
            <span className={s.badge}>수확철 당일 출고</span>
            <h3>오늘 주문, 내일 도착.</h3>
            <p>
              평일 <b>오후 3시 이전</b> 주문하시면 다음 날 받으실 수 있습니다. 급하시면 공장으로 바로 오셔도 됩니다.
            </p>
            <a className={`btn btn--cta ${s.tel}`} href={site.phoneHref}>
              ☏ {site.phone}
            </a>
            <a
              className="btn btn--ghost"
              href="#inquiry"
              onClick={() =>
                openInquiry(
                  "소모품 주문",
                  `${consumables.map((c) => `${c.name} ${qty[c.id]}${c.unit}`).join(", ")} 주문합니다.\nDRAGON 모델: \n받으실 주소: `,
                )
              }
            >
              주문 남기기
            </a>
            <a className="lnk" href={site.kakaoHref}>
              카카오톡으로 주문하기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
