"use client";

import { footerGroups, legalLinks } from "@/data/site";
import { useSiteData } from "./SiteData";
import { SNS_PLATFORMS } from "@/lib/types";
import { LogoMark } from "./placeholders";
import s from "./Footer.module.css";

/** 애플식 푸터 — 연회색 바탕, 작은 글, 링크 묶음 */
export default function Footer() {
  const { site, sns } = useSiteData();
  return (
    <footer className={s.foot}>
      <div className={s.in}>
        <p className={s.note}>
          운영시간 · {site.hours}. 가격과 사양은 전화로 바로 안내해 드립니다.
        </p>

        <div className={s.cols}>
          <div className={s.brand}>
            <LogoMark size={34} />
            <b>
              성원마<em>끼</em>나
            </b>
            <span>{site.tagline}</span>
            <a className={s.tel} href={site.phoneHref}>
              {site.phone}
            </a>
            {sns.length > 0 && (
              <ul className={s.sns} aria-label="SNS 채널">
                {sns.map((l) => (
                  <li key={l.id}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label || SNS_PLATFORMS.find((p) => p.id === l.platform)?.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {footerGroups.map((g) => (
            <nav key={g.title} className={s.col} aria-label={g.title}>
              <h4>{g.title}</h4>
              {g.links.map((l) => (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              ))}
            </nav>
          ))}
        </div>

        <div className={s.bot}>
          <address>
            {site.name} · 대표 {site.ceo} · 사업자등록번호 {site.bizNo}
            <br />
            {site.address} · 전화 {site.phone} · 팩스 {site.fax}
          </address>
          <div className={s.legal}>
            {legalLinks.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
            <span>© {site.name}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
