"use client";

import { useEffect, useRef, useState } from "react";
import { heroImages, heroStory, type HeroLayerImage } from "@/data/content";
import { site } from "@/data/site";
import { HeroField, HeroForeground, HeroSky, HeroTrace } from "./placeholders/HeroScene";
import s from "./Hero.module.css";

/** 실제 사진이 있으면 새벽·작업등 두 장을 겹치고, 없으면 SVG 자리표시 */
function LayerArt({ img, children }: { img?: HeroLayerImage; children: React.ReactNode }) {
  if (!img) return <>{children}</>;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={s.img} src={img.dawn} alt="" decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`${s.img} ${s.imgLit}`} src={img.lit} alt="" decoding="async" />
    </>
  );
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** p 가 a→b 를 지나는 동안 0→1 (부드럽게) */
const ramp = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * 히어로 — ZIPLAN식 스크롤 장면.
 * 새벽 들판(불 꺼짐) → 작업등·해 뜸(--lit) → 기계 도면 선(--trace) → 베일 쪽으로 다가감(--zoom) → 흰 바탕으로 녹아듦(--veil).
 * 스크롤 값은 리렌더 없이 CSS 변수로만 흘려보내고, 캡션이 바뀔 때만 상태를 갱신한다.
 */
export default function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [cap, setCap] = useState(-1);
  const [headAway, setHeadAway] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      stage.style.setProperty("--lit", "1");
      return;
    }

    let raf = 0;
    let lastCap = -2;
    let lastAway: boolean | null = null;

    const update = () => {
      raf = 0;
      const rect = wrap.getBoundingClientRect();
      const travel = Math.max(1, wrap.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / travel);

      const head = 1 - ramp(p, 0.02, 0.15);
      stage.style.setProperty("--p", p.toFixed(4));
      stage.style.setProperty("--head", head.toFixed(4));
      stage.style.setProperty("--lit", ramp(p, 0.2, 0.42).toFixed(4));
      stage.style.setProperty("--trace", ramp(p, 0.44, 0.64).toFixed(4));
      stage.style.setProperty("--zoom", ramp(p, 0.6, 1).toFixed(4));
      stage.style.setProperty("--veil", ramp(p, 0.9, 1).toFixed(4));

      const idx = heroStory.findIndex((c) => p >= c.from && p < c.to);
      if (idx !== lastCap) {
        lastCap = idx;
        setCap(idx);
      }
      const away = head < 0.15;
      if (away !== lastAway) {
        lastAway = away;
        setHeadAway(away);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className={s.photo} id="top">
      <div ref={stageRef} className={s.stage}>
        <div className={`${s.layer} ${s.bg}`} aria-hidden="true">
          <div className={s.drift}>
            <LayerArt img={heroImages.bg}>
              <HeroSky />
            </LayerArt>
          </div>
        </div>
        <div className={`${s.layer} ${s.mid}`} aria-hidden="true">
          <div className={s.drift}>
            <LayerArt img={heroImages.mid}>
              <HeroField />
            </LayerArt>
            <div className={s.trace}>
              <HeroTrace />
            </div>
          </div>
        </div>
        <div className={`${s.layer} ${s.fg}`} aria-hidden="true">
          <div className={s.drift}>
            <LayerArt img={heroImages.fg}>
              <HeroForeground />
            </LayerArt>
          </div>
        </div>
        <div className={s.vignette} aria-hidden="true" />
        <div className={s.shade} aria-hidden="true" />
        {!heroImages.bg && (
          <span className={`photo-label ${s.label}`}>현장 사진 자리 — 새벽/작업등 두 장씩, 세 겹 (교체)</span>
        )}

        <div className={`${s.head} ${headAway ? s.away : ""}`} aria-hidden={headAway || undefined}>
          <p className={s.eyebrow}>{site.tagline}</p>
          <h1 className={s.term}>
            <span className="sr-only">{site.name} </span>
            <span aria-hidden="true">
              MA<span className={s.kk}>KK</span>INA
            </span>
          </h1>
          <p className={s.gloss}>성원마끼나 · 조사료 작업기 · 경북 안동 서후면</p>
          <p className={s.slogan}>{site.slogan}</p>
          <div className={`links on-dark ${s.plinks}`}>
            <a className="lnk" href="#products" tabIndex={headAway ? -1 : undefined}>
              작업기 보기
            </a>
            <a className="lnk" href="#consumables" tabIndex={headAway ? -1 : undefined}>
              소모품 주문
            </a>
            <a className="lnk" href="#videos" tabIndex={headAway ? -1 : undefined}>
              작업 영상
            </a>
          </div>
          <a className={`btn btn--cta ${s.cta}`} href={site.phoneHref} tabIndex={headAway ? -1 : undefined}>
            ☏ 전화 상담 {site.phone}
          </a>
        </div>

        <ol className={s.caps} aria-hidden="true">
          {heroStory.map((c, i) => (
            <li key={c.word} className={`${s.cap} ${cap === i ? s.capOn : ""}`}>
              <div className={s.capW}>{c.word}</div>
              <div className={s.capK}>{c.ko}</div>
            </li>
          ))}
        </ol>

        <div className={`${s.hint} ${headAway ? s.away : ""}`} aria-hidden="true">
          내리면서 보세요 ↓
        </div>
        <div className={s.veil} aria-hidden="true" />
      </div>
    </div>
  );
}
