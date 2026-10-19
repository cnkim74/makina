"use client";

import { useSite } from "./SiteData";
import { useHeroPast } from "./useHeroProgress";
import s from "./FloatingButtons.module.css";

const ICONS = {
  chat: (
    <path d="M4 5.5h16v10H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  roll: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  play: <path d="M8 5.5 L19 12 L8 18.5 Z" fill="currentColor" />,
  phone: (
    <path
      d="M6.6 3.5h3l1.5 4-2 1.3a11 11 0 0 0 6.1 6.1l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"
      fill="currentColor"
    />
  ),
};

/**
 * 데스크톱 오른쪽 아래 — 유리 캡슐에 담긴 빠른 버튼.
 * 히어로 장면 동안은 내비의 전화 버튼이 그 역할을 하므로 숨겨 두고, 장면이 끝나면 떠오른다.
 * 모바일은 MobileDock 이 대신한다.
 */
export default function FloatingButtons() {
  const site = useSite();
  const show = useHeroPast(0.96);

  return (
    <div className={`${s.float} ${show ? s.show : ""}`} aria-hidden={!show || undefined}>
      <div className={`glass ${s.capsule}`}>
        <a href="#support" className={s.item} tabIndex={show ? undefined : -1}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.chat}
          </svg>
          구매 상담
        </a>
        <a href="#consumables" className={s.item} tabIndex={show ? undefined : -1}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.roll}
          </svg>
          소모품
        </a>
        <a href="#videos" className={s.item} tabIndex={show ? undefined : -1}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {ICONS.play}
          </svg>
          작업 영상
        </a>
      </div>
      <a
        href={site.phoneHref}
        className={s.tel}
        aria-label={`전화 상담 ${site.phone}`}
        tabIndex={show ? undefined : -1}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {ICONS.phone}
        </svg>
        전화
      </a>
    </div>
  );
}
