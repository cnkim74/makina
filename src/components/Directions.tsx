"use client";

import { useState } from "react";
import { phoneRange } from "@/lib/types";
import { useSite } from "./SiteData";
import { MapPlaceholder } from "./placeholders";
import s from "./Directions.module.css";

export default function Directions() {
  const site = useSite();
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(site.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* 복사가 막힌 브라우저에서는 주소가 화면에 그대로 보인다 */
    }
  }

  return (
    <section className="mod" id="directions" aria-labelledby="dir-title">
      <div className="mod-in">
        <span className="lab-k">오시는 길</span>
        <h2 id="dir-title">안동 서후면, 공장으로 오세요.</h2>
        <p className="tag">작업기를 직접 보고 시연까지 받아 보실 수 있습니다. 오시기 전에 전화 한 번 주세요.</p>

        <div className={s.way}>
          <div className={s.map}>
            {/* 지도가 뜨기 전·막혔을 때 보이는 바탕 */}
            <MapPlaceholder />
            <iframe
              className={s.frame}
              src={site.mapEmbed}
              title={`${site.name} 위치 지도 — ${site.address}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a className={`glass ${s.mapOpen}`} href={site.mapHref} target="_blank" rel="noopener noreferrer">
              카카오맵에서 크게 보기 ›
            </a>
          </div>

          <div className={s.info}>
            <h3>{site.name} 본사 · 공장</h3>
            <dl>
              <dt>주소</dt>
              <dd>
                {site.address}
                <button type="button" className={s.copy} onClick={copyAddress} aria-live="polite">
                  {copied ? "복사했습니다" : "주소 복사"}
                </button>
              </dd>
              <dt>전화</dt>
              <dd>{phoneRange(site.phone, site.phone2)}</dd>
              <dt>운영시간</dt>
              <dd>{site.hours}</dd>
            </dl>
            <div className={s.tels}>
              <a className={s.tel} href={site.phoneHref}>
                {site.phone}
              </a>
              {site.phone2 && (
                <a className={s.tel2} href={site.phone2Href} aria-label={`두 번째 전화 ${site.phone2}`}>
                  {site.phone2}
                </a>
              )}
            </div>
            <div className={s.acts}>
              <a className="btn btn--cta" href={site.phoneHref}>
                ☏ 전화 상담
              </a>
              <a className="btn btn--dark" href={site.routeHref} target="_blank" rel="noopener noreferrer">
                카카오맵 길찾기
              </a>
              <a className="btn btn--ghost" href={site.naverMapHref} target="_blank" rel="noopener noreferrer">
                네이버 지도
              </a>
            </div>
            <p className={s.hint}>내비게이션에는 “성원마끼나” 또는 “풍산태사로 2780”을 검색하세요.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
