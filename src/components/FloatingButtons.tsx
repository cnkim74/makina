"use client";

import { useState } from "react";
import Link from "next/link";
import { site } from "@/data/site";
import s from "./FloatingButtons.module.css";

/** 우측 플로팅 원형 버튼 4개. 모바일에서는 MobileDock 이 대신한다. */
export default function FloatingButtons() {
  const [bubble, setBubble] = useState(true);

  return (
    <div className={s.float}>
      {bubble && (
        <div className={s.bubble} role="status">
          작업기가 궁금하신가요?
          <br />
          구매 상담을 받아보세요!
          <button type="button" aria-label="말풍선 닫기" onClick={() => setBubble(false)}>
            ×
          </button>
        </div>
      )}
      <Link href="#support">
        구매
        <br />
        상담
      </Link>
      <Link href="#consumables">
        소모품
        <br />
        주문
      </Link>
      <Link href="#videos">
        작업
        <br />
        영상
        <br />
        보기
      </Link>
      <a href={site.phoneHref} className={s.black}>
        전화상담
      </a>
    </div>
  );
}
