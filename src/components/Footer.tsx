import Link from "next/link";
import { footerLinks, site } from "@/data/site";
import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.foot}>
      <div className={s.top}>
        <nav className={s.fm} aria-label="푸터 메뉴">
          {footerLinks.map((l) => (
            <Link key={l.label} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={s.fam}>
          <a href="#catalog">카탈로그 다운로드</a>
          <a href={site.youtubeHref}>유튜브 채널</a>
        </div>
      </div>
      <div className={s.bot}>
        <address>
          {site.name} · 대표 {site.ceo} · 사업자등록번호 {site.bizNo}
          <br />
          {site.address} · 전화 <a href={site.phoneHref}>{site.phone}</a> · 팩스 {site.fax}
          <br />
          Copyright © {site.name}. All rights reserved.
        </address>
        <div className={s.tag}>{site.tagline}</div>
      </div>
    </footer>
  );
}
