"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navGroups, utilLinks } from "@/data/site";
import { useSite } from "./SiteData";
import { LogoMark, Wordmark } from "./Logo";
import { useHeroPast } from "./useHeroProgress";
import s from "./Header.module.css";

const SECTION_IDS = navGroups.flatMap((g) => g.links.map((l) => l.href.slice(1)));

/**
 * 떠 있는 유리 알약 내비.
 * - 커서를 따라 얇은 빛(스펙큘러)이 흐르고
 * - 유리 방울 하나가 로고·메뉴 사이를 스프링처럼 미끄러진다
 * - 지금 보고 있는 섹션 메뉴 아래 점이 찍힌다
 */
export default function Header() {
  const site = useSite();
  const [open, setOpen] = useState(false);
  // 히어로 장면 위에서는 어두운 유리, 장면이 흰 바탕으로 녹아들면 밝은 유리
  const onLight = useHeroPast(0.9);
  const [current, setCurrent] = useState<string | null>(null);
  const inRef = useRef<HTMLDivElement>(null);
  const hlRef = useRef<HTMLSpanElement>(null);

  // 지금 보이는 섹션
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best: string | null = null;
        let max = 0.12;
        seen.forEach((v, k) => {
          if (v > max) {
            max = v;
            best = k;
          }
        });
        setCurrent(best);
      },
      { threshold: [0, 0.12, 0.3, 0.5, 0.75] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // 메뉴가 열려 있을 때 Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const moveHighlight = (el: HTMLElement) => {
    const host = inRef.current;
    const hl = hlRef.current;
    if (!host || !hl) return;
    const a = host.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    hl.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px)`;
    hl.style.width = `${b.width}px`;
    hl.style.height = `${b.height}px`;
    hl.style.opacity = "1";
  };

  const hideHighlight = () => {
    if (hlRef.current) hlRef.current.style.opacity = "0";
  };

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const host = inRef.current;
    if (!host) return;
    const r = host.getBoundingClientRect();
    host.style.setProperty("--mx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  };

  const hover = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => moveHighlight(e.currentTarget),
    onFocus: (e: React.FocusEvent<HTMLElement>) => moveHighlight(e.currentTarget),
  };

  return (
    <header className={s.nav}>
      <div
        ref={inRef}
        className={`glass ${onLight ? "" : `glass--dark ${s.dark}`} ${s.in}`}
        onMouseMove={onMove}
        onMouseLeave={hideHighlight}
      >
        <span ref={hlRef} className={s.hl} aria-hidden="true" />

        <Link className={s.logo} href="/#top" aria-label={`${site.name} 처음으로`} {...hover}>
          <LogoMark size={24} />
          <Wordmark height={17} />
        </Link>

        <nav className={s.links} aria-label="주 메뉴">
          {navGroups.map((g) => (
            <span key={g.title} className={s.group}>
              {g.links.map((l) => (
                <a
                  key={l.href}
                  className={s.nl}
                  href={l.href}
                  aria-current={current === l.href.slice(1) ? "true" : undefined}
                  {...hover}
                >
                  {l.label}
                </a>
              ))}
            </span>
          ))}
        </nav>

        <span className={s.sp} />

        <a className={s.tel} href={site.phoneHref} {...hover}>
          ☏ {site.phone}
        </a>

        <button
          type="button"
          className={s.menuBtn}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="navMenu"
          onClick={() => setOpen((v) => !v)}
        >
          <i />
          <i />
          <i />
        </button>
      </div>

      {open && (
        <div id="navMenu" className={`glass ${s.menu}`}>
          {navGroups.map((g) => (
            <div key={g.title} className={s.menuGroup}>
              <h4>{g.title}</h4>
              {g.links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ))}
            </div>
          ))}
          <div className={s.menuUtil}>
            {utilLinks.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </div>
          <a className={`btn btn--cta ${s.menuTel}`} href={site.phoneHref}>
            ☏ 전화 상담 {site.phone}
          </a>
        </div>
      )}
    </header>
  );
}
