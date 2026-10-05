"use client";

import { useState } from "react";
import { hpRanges } from "@/data/content";
import { FieldRows } from "./placeholders";
import s from "./HpFinder.module.css";

/** 내 트랙터 마력으로 찾기 — 사진 띠 섹션 */
export default function HpFinder() {
  const [sel, setSel] = useState("51-70");
  const range = hpRanges.find((r) => r.id === sel) ?? hpRanges[2];

  return (
    <section className={s.band} id="hp-finder" aria-labelledby="hp-title">
      <div className={`photo ${s.photo}`}>
        <FieldRows />
        <span className="photo-label">사진 — 트랙터 + 비무꼬 연결 장면 (교체)</span>
      </div>
      <div className={s.shade} />

      <div className={`wrap ${s.in}`}>
        <h2 id="hp-title">내 트랙터 마력으로 찾기</h2>
        <p>트랙터 마력만 고르시면 연결 가능한 작업기를 바로 알려 드립니다</p>

        <div className={s.hp} role="group" aria-label="트랙터 마력 선택">
          {hpRanges.map((r) => (
            <button
              key={r.id}
              type="button"
              className={sel === r.id ? s.on : undefined}
              aria-pressed={sel === r.id}
              onClick={() => setSel(r.id)}
            >
              <span className={s.long}>{r.label}</span>
              <span className={s.short}>{r.shortLabel}</span>
            </button>
          ))}
        </div>

        <p className={s.res} aria-live="polite">
          {range.label.replace(" ~ ", "~")} 트랙터 → <b>{range.machines.join(" · ")}</b> 연결 가능
          <span className={s.pto}> (PTO 540rpm 기준)</span>
        </p>
      </div>
    </section>
  );
}
