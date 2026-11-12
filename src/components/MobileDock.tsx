"use client";

import { useSite } from "./SiteData";
import { useHref } from "./useHref";
import s from "./MobileDock.module.css";

/** 모바일 하단 — 떠 있는 유리 도크. 전화 상담 / 카톡 문의 / 소모품 주문 */
export default function MobileDock() {
  const site = useSite();
  const to = useHref();
  return (
    <div className={s.wrap}>
      <div className={`glass ${s.dock}`}>
        <a className={s.tel} href={site.phoneHref}>
          ☏ 전화 상담
        </a>
        <a className={s.kakao} href={to(site.kakaoHref)}>
          카톡 문의
        </a>
        <a className={s.order} href={to("#consumables")}>
          소모품 주문
        </a>
      </div>
    </div>
  );
}
