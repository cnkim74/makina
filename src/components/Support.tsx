"use client";

import { useState } from "react";
import { supportItems } from "@/data/content";
import { site } from "@/data/site";
import { FactoryScene } from "./placeholders";
import s from "./Support.module.css";

/** 고객지원 — "무엇을 도와드릴까요?" 사진 띠 + 아코디언 5개 */
export default function Support() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className={s.help} id="support" aria-labelledby="support-title">
      <div className={`photo ${s.photo}`}>
        <FactoryScene />
        <span className="photo-label">사진 — 공장 내부 / 작업기 정비 장면 (교체)</span>
      </div>
      <div className={s.shade} />

      <div className={`wrap ${s.in}`}>
        <h2 className={s.ttl} id="support-title">
          무엇을 도와드릴까요?
        </h2>
        <p className={s.sub}>원하시는 서비스를 눌러 주세요</p>

        <div className={s.grid}>
          {supportItems.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`${s.it} ${isOpen ? s.open : ""}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`support-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={s.title}>
                    {it.title.split("\n").map((line, li) => (
                      <span key={li}>
                        {li > 0 && (
                          <>
                            <br className={s.br} />{" "}
                          </>
                        )}
                        {line}
                      </span>
                    ))}
                    <small>{it.sub}</small>
                  </span>
                  <span className={s.plus} aria-hidden="true">
                    +
                  </span>
                </button>
                <div id={`support-panel-${i}`} className={s.panel} hidden={!isOpen}>
                  <p>{it.sub}</p>
                  <div className={s.acts}>
                    <a className="pill pill--cta" href={site.phoneHref}>
                      ☏ 전화 상담 {site.phone}
                    </a>
                    <a className="pill pill--kakao" href={site.kakaoHref}>
                      카카오톡 문의
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
