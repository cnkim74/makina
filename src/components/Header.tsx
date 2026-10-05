"use client";

import { useState } from "react";
import Link from "next/link";
import { nav, utilLinks, site } from "@/data/site";
import { LogoMark } from "./placeholders";
import s from "./Header.module.css";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className={s.header}>
      <div className={s.util}>
        {utilLinks.map((l) => (
          <Link key={l.label} href={l.href}>
            {l.label}
          </Link>
        ))}
        <span className={s.social} aria-label="소셜 채널">
          <a href={site.youtubeHref} title="YouTube" aria-label="YouTube">
            <i />
          </a>
          <a href="#" title="Instagram" aria-label="Instagram">
            <i />
          </a>
          <a href="#" title="Blog" aria-label="Blog">
            <i />
          </a>
        </span>
      </div>

      <div className={s.gnb}>
        <Link className={s.logo} href="/" aria-label={`${site.name} 홈`}>
          <LogoMark />
          <b>
            성원마<em>끼</em>나
          </b>
        </Link>

        <nav className={s.menu} aria-label="주 메뉴">
          {nav.map((l, i) => (
            <Link key={l.label} href={l.href} className={i === 1 ? s.on : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={s.right}>
          <button type="button" className={s.search} aria-label="검색">
            <i />
            <span>검색</span>
          </button>
          <button
            type="button"
            className={s.burger}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <i />
            <i />
            <i />
          </button>
        </div>
      </div>

      {open && (
        <nav className={s.drawer} aria-label="모바일 메뉴">
          {nav.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className={s.drawerUtil}>
            {utilLinks.map((l) => (
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
          <a className={`pill pill--cta ${s.drawerTel}`} href={site.phoneHref}>
            ☏ 전화 상담 {site.phone}
          </a>
        </nav>
      )}
    </header>
  );
}
