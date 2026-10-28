"use client";

import { useState } from "react";
import { hpRanges } from "@/data/content";
import Segmented from "./Segmented";
import { openInquiry } from "@/lib/inquiry";
import { useSite } from "./SiteData";
import s from "./HpFinder.module.css";

/** 내 트랙터 마력으로 찾기 — 어두운 사진 띠 위의 유리 */
export default function HpFinder() {
  const site = useSite();
  const [sel, setSel] = useState("80-99");
  const range = hpRanges.find((r) => r.id === sel) ?? hpRanges[2];

  return (
    <section className={`mod mod--dark ${s.band}`} id="hp-finder" aria-labelledby="hp-title">
      <div className={`photo ${s.photo}`} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/dragon/field-cut.webp" alt="" loading="lazy" />
      </div>
      <div className={s.shade} aria-hidden="true" />

      <div className={`mod-in ${s.in}`}>
        <span className="lab-k">마력 찾기</span>
        <h2 id="hp-title">내 트랙터 마력으로 찾기.</h2>
        <p className="tag">마력만 고르시면 연결할 수 있는 드래곤 모델을 알려 드립니다.</p>

        <Segmented
          className={s.seg}
          label="트랙터 마력"
          tone="dark"
          value={sel}
          onChange={setSel}
          options={hpRanges.map((r) => ({ id: r.id, label: r.label, short: r.shortLabel }))}
        />

        <div className={`glass glass--dark ${s.result}`} aria-live="polite">
          <p className={s.q}>
            <b>{range.label.replace(" ~ ", "~")}</b> 트랙터에 연결할 수 있는 드래곤
          </p>
          {range.machines.length > 0 ? (
            <ul className={s.chips}>
              {range.machines.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className={s.ask}>
              드래곤은 60마력부터 씁니다. 작은 트랙터에 맞는 작업기는 전화로 안내해 드립니다.{" "}
              <a className="btn btn--cta" href={site.phoneHref}>
                ☏ {site.phone}
              </a>
            </p>
          )}
          <a
            className={`lnk ${s.askLink}`}
            href="#inquiry"
            onClick={() =>
              openInquiry("구매 상담", `${range.label} 트랙터에 맞는 드래곤 모델이 궁금합니다.\n트랙터 기종: `)
            }
          >
            이 마력으로 문의 남기기
          </a>
          <p className={s.note}>PTO 540 (DRAGON280은 540·1000 겸용) · 정확한 궁합은 전화로 확인해 드립니다</p>
        </div>
      </div>
    </section>
  );
}
