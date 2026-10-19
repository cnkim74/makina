"use client";

import { useState } from "react";
import { supportItems } from "@/data/content";
import { site } from "@/data/site";
import s from "./Support.module.css";

/** 고객지원 — 애플식 펼침 목록 */
export default function Support() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mod" id="support" aria-labelledby="support-title">
      <div className="mod-in">
        <span className="lab-k">고객지원</span>
        <h2 id="support-title">무엇을 도와드릴까요?</h2>
        <p className="tag">원하시는 서비스를 눌러 주세요. 어느 것이든 전화 한 통으로 시작됩니다.</p>

        <div className={s.list}>
          {supportItems.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={`${s.item} ${isOpen ? s.open : ""}`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`support-panel-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className={s.title}>
                    {it.short}
                    <small>{it.sub}</small>
                  </span>
                  <span className={s.plus} aria-hidden="true" />
                </button>
                <div id={`support-panel-${i}`} className={s.panel} hidden={!isOpen}>
                  <div className={s.acts}>
                    <a className="btn btn--cta" href={site.phoneHref}>
                      ☏ 전화 상담 {site.phone}
                    </a>
                    <a className="btn btn--kakao" href={site.kakaoHref}>
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
